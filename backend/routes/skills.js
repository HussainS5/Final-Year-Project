const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/skills/:userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user skills (Strengths)
        const skillsRes = await db.query(`
      SELECT us.user_skill_id, s.skill_name, s.skill_category, us.proficiency_level
      FROM user_skills us
      JOIN skills_catalog s ON us.skill_id = s.skill_id
      WHERE us.user_id = $1
    `, [userId]);

        // Map proficiency to percentage for UI
        const proficiencyMap = {
            'beginner': 25,
            'intermediate': 50,
            'advanced': 75,
            'expert': 100
        };

        const strengths = skillsRes.rows.map(s => ({
            id: s.user_skill_id,
            name: s.skill_name,
            category: s.skill_category,
            level: proficiencyMap[s.proficiency_level] || 0,
            proficiency: s.proficiency_level
        }));

        // Fetch skill gaps
        const gapsRes = await db.query(`
      SELECT sg.gap_id, s.skill_name, sg.current_level, sg.target_level, sg.priority_score, sg.gap_severity
      FROM skill_gaps sg
      JOIN skills_catalog s ON sg.skill_id = s.skill_id
      WHERE sg.user_id = $1 AND sg.is_resolved = FALSE
    `, [userId]);

        const gaps = gapsRes.rows.map(g => ({
            id: g.gap_id,
            name: g.skill_name,
            priority: g.gap_severity === 'critical' ? 'High' : (g.gap_severity === 'high' ? 'High' : (g.gap_severity === 'medium' ? 'Medium' : 'Low')),
            current: proficiencyMap[g.current_level] || 0,
            target: proficiencyMap[g.target_level] || 100
        }));

        // Radar Data (Aggregate by category or just top skills)
        // For now, let's just take top 6 skills for the radar
        const radarData = strengths.slice(0, 6).map(s => ({
            skill: s.name,
            value: s.level
        }));

        // Latest ATS report (stored, no new Gemini call)
        const atsRes = await db.query(
            `SELECT score, summary, strengths, gaps, recommendations, keywords_to_add, breakdown, model_used, created_at
             FROM ats_reports
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId]
        );

        let atsReport = null;
        if (atsRes.rows.length > 0) {
            const row = atsRes.rows[0];
            atsReport = {
                score: Number(row.score) || 0,
                summary: row.summary || '',
                strengths: Array.isArray(row.strengths) ? row.strengths : tryParseArray(row.strengths),
                gaps: Array.isArray(row.gaps) ? row.gaps : tryParseArray(row.gaps),
                recommendations: Array.isArray(row.recommendations) ? row.recommendations : tryParseArray(row.recommendations),
                keywordsToAdd: Array.isArray(row.keywords_to_add) ? row.keywords_to_add : tryParseArray(row.keywords_to_add),
                breakdown: row.breakdown || {},
                modelUsed: row.model_used || '',
                createdAt: row.created_at,
            };
        }

        res.json({
            strengths,
            gaps,
            radarData,
            atsReport,
        });
    } catch (err) {
        console.error('Error fetching skills:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function tryParseArray(val) {
    try {
        const parsed = typeof val === 'string' ? JSON.parse(val) : val;
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

// POST /api/skills/:userId
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { skillName, proficiency } = req.body;

        if (!skillName) {
            return res.status(400).json({ error: 'Skill name is required' });
        }

        // Find or create skill in catalog
        let skillId;
        const skillRes = await db.query('SELECT skill_id FROM skills_catalog WHERE skill_name = $1', [skillName]);

        if (skillRes.rows.length > 0) {
            skillId = skillRes.rows[0].skill_id;
        } else {
            const newSkill = await db.query(
                'INSERT INTO skills_catalog (skill_name, skill_category) VALUES ($1, $2) RETURNING skill_id',
                [skillName, 'technical'] // Default category
            );
            skillId = newSkill.rows[0].skill_id;
        }

        // Check if user already has this skill
        const existing = await db.query('SELECT * FROM user_skills WHERE user_id = $1 AND skill_id = $2', [userId, skillId]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'User already has this skill' });
        }

        // Add to user_skills
        const newEntry = await db.query(
            'INSERT INTO user_skills (user_id, skill_id, proficiency_level, source) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, skillId, proficiency || 'beginner', 'manual_entry']
        );

        res.status(201).json(newEntry.rows[0]);
    } catch (err) {
        console.error('Error adding skill:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/skills/:userId/:skillId
router.delete('/:userId/:skillId', async (req, res) => {
    try {
        const { userId, skillId } = req.params; // Note: this is user_skill_id from frontend if we pass that, or we need to look up by name. 
        // Let's assume frontend passes the user_skill_id (which we returned as 'id' in GET)

        await db.query('DELETE FROM user_skills WHERE user_skill_id = $1 AND user_id = $2', [skillId, userId]);

        res.json({ message: 'Skill deleted successfully' });
    } catch (err) {
        console.error('Error deleting skill:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
