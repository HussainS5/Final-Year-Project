const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
console.log('Gemini API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
const genAI = new GoogleGenerativeAI(apiKey);

// GET /api/chat/:userId - Get chat history
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching chat history for userId:', userId);

        // Get the most recent active session
        const sessionRes = await db.query(
            'SELECT * FROM chat_sessions WHERE user_id = $1 AND is_active = true ORDER BY last_message_at DESC LIMIT 1',
            [userId]
        );

        if (sessionRes.rows.length === 0) {
            // No active session, return empty
            return res.json({ sessionId: null, messages: [] });
        }

        const session = sessionRes.rows[0];
        res.json({
            sessionId: session.session_id,
            messages: session.messages || [],
            startedAt: session.started_at,
            lastMessageAt: session.last_message_at
        });
    } catch (err) {
        console.error('Error fetching chat history:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// POST /api/chat/:userId - Send message and get AI response
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { message, sessionId } = req.body;

        console.log('Received chat message from userId:', userId);
        console.log('Message:', message);
        console.log('Session ID:', sessionId);

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Fetch user profile for context
        const userRes = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userRes.rows[0];

        // Fetch user skills
        const skillsRes = await db.query(`
            SELECT s.skill_name 
            FROM user_skills us
            JOIN skills_catalog s ON us.skill_id = s.skill_id
            WHERE us.user_id = $1
        `, [userId]);
        const skills = skillsRes.rows.map(s => s.skill_name).join(', ');

        // Fetch work experience
        const expRes = await db.query(
            'SELECT job_title, company_name FROM work_experience WHERE user_id = $1 ORDER BY start_date DESC LIMIT 3',
            [userId]
        );
        const experience = expRes.rows.map(e => `${e.job_title} at ${e.company_name}`).join(', ');

        // Get or create session
        let currentSessionId = sessionId;
        let existingMessages = [];

        if (sessionId) {
            const sessionRes = await db.query('SELECT messages FROM chat_sessions WHERE session_id = $1 AND user_id = $2', [sessionId, userId]);
            if (sessionRes.rows.length > 0) {
                existingMessages = sessionRes.rows[0].messages || [];
            }
        }

        console.log('Existing messages count:', existingMessages.length);

        // Add user message to history
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };
        existingMessages.push(userMessage);

        // Build context for AI with user information
        let contextPrompt = `You are a helpful career advisor AI assistant. `;
        
        if (user.first_name) {
            contextPrompt += `The user's name is ${user.first_name} ${user.last_name || ''}. `;
        }
        if (skills) {
            contextPrompt += `They have skills in: ${skills}. `;
        }
        if (experience) {
            contextPrompt += `Their work experience includes: ${experience}. `;
        }
        if (user.bio) {
            contextPrompt += `About them: ${user.bio}. `;
        }
        
        contextPrompt += `Provide helpful, professional, and encouraging career advice. Be concise but informative. IMPORTANT: Do NOT use any markdown formatting in your response. No asterisks (*), underscores (_), hash symbols (#), or any other markdown characters. Use plain text only.`;

        // Helper function to clean markdown formatting
        const cleanMarkdown = (text) => {
            if (!text) return '';
            return text
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
                .replace(/\*(.*?)\*/g, '$1') // Remove italic *text* (but not **)
                .replace(/_{2}(.*?)_{2}/g, '$1') // Remove bold __text__
                .replace(/_(.*?)_/g, '$1') // Remove italic _text_
                .replace(/#{1,6}\s*(.*)/g, '$1') // Remove headers # ## ###
                .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url) -> text
                .replace(/`(.*?)`/g, '$1') // Remove inline code `code`
                .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                .replace(/---+/g, '') // Remove horizontal rules
                .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double
                .trim();
        };

        console.log('=== GEMINI API DEBUG ===');
        console.log('API Key being used:', apiKey ? `${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 5)}` : 'NOT FOUND');
        console.log('API Key length:', apiKey ? apiKey.length : 0);
        console.log('Calling Gemini API with model: gemini-2.5-flash');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
     
        // For first message or simple conversation
        const fullPrompt = existingMessages.length <= 1 
            ? `${contextPrompt}\n\nUser's question: ${message}`
            : `${contextPrompt}\n\nUser's question: ${message}`;

        console.log('Prompt length:', fullPrompt.length);
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let aiResponse = response.text();
        
        // Clean markdown formatting from response
        aiResponse = cleanMarkdown(aiResponse);

        console.log('AI Response received successfully');
        console.log('Response preview:', aiResponse.substring(0, 100) + '...');
        console.log('=== END DEBUG ===');

        // Add AI response to history
        const assistantMessage = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
        };
        existingMessages.push(assistantMessage);

        // Save to database
        if (currentSessionId) {
            // Update existing session
            console.log('Updating existing session:', currentSessionId);
            await db.query(
                'UPDATE chat_sessions SET messages = $1, last_message_at = CURRENT_TIMESTAMP WHERE session_id = $2',
                [JSON.stringify(existingMessages), currentSessionId]
            );
        } else {
            // Create new session
            console.log('Creating new session');
            const newSessionRes = await db.query(
                'INSERT INTO chat_sessions (user_id, messages, started_at, last_message_at, is_active) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true) RETURNING session_id',
                [userId, JSON.stringify(existingMessages)]
            );
            currentSessionId = newSessionRes.rows[0].session_id;
            console.log('New session created:', currentSessionId);
        }

        res.json({
            sessionId: currentSessionId,
            userMessage,
            assistantMessage,
            allMessages: existingMessages
        });
    } catch (err) {
        console.error('Error processing chat message:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// DELETE /api/chat/:userId/:sessionId - End/delete a chat session
router.delete('/:userId/:sessionId', async (req, res) => {
    try {
        const { userId, sessionId } = req.params;

        await db.query(
            'UPDATE chat_sessions SET is_active = false WHERE session_id = $1 AND user_id = $2',
            [sessionId, userId]
        );

        res.json({ message: 'Chat session ended' });
    } catch (err) {
        console.error('Error ending chat session:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
