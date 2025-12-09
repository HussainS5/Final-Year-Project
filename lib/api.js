const API_BASE_URL = 'http://localhost:5001/api';

export const api = {
    // Fetch all jobs
    getJobs: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.type) params.append('type', filters.type);
        if (filters.location) params.append('location', filters.location);

        const response = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch jobs');
        return response.json();
    },

    // Fetch job by ID
    getJob: async (id) => {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
        if (!response.ok) throw new Error('Failed to fetch job');
        return response.json();
    },

    // Fetch dashboard data
    getDashboard: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/dashboard/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        return response.json();
    },

    // Auth
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    signup: async (full_name, email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Signup failed');
        return data;
    },

    // Profile
    getProfile: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    updateProfile: async (userId, data) => {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.details || 'Failed to update profile');
        }
        return result;
    },

    updateSkills: async (userId, skills) => {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}/skills`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.details || 'Failed to update skills');
        }
        return result;
    },

    // Skills
    getSkills: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/skills/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch skills');
        return response.json();
    },

    addSkill: async (userId, skillName, proficiency) => {
        const response = await fetch(`${API_BASE_URL}/skills/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skillName, proficiency }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to add skill');
        return data;
    },

    deleteSkill: async (userId, skillId) => {
        const response = await fetch(`${API_BASE_URL}/skills/${userId}/${skillId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete skill');
        return response.json();
    },

    // Dashboard - combined endpoint
    getUserStats: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/dashboard/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user stats');
        return response.json();
    },

    getRecommendedJobs: async (userId) => {
        // This now returns the recommendedJobs from the dashboard endpoint
        const response = await fetch(`${API_BASE_URL}/dashboard/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch recommended jobs');
        const data = await response.json();
        return data.recommendedJobs || [];
    },

    // Chat
    getChatHistory: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/chat/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch chat history');
        return response.json();
    },

    sendChatMessage: async (userId, message, sessionId = null) => {
        const response = await fetch(`${API_BASE_URL}/chat/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, sessionId }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.details || 'Failed to send message');
        }
        return result;
    },

    endChatSession: async (userId, sessionId) => {
        const response = await fetch(`${API_BASE_URL}/chat/${userId}/${sessionId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to end chat session');
        return response.json();
    }
};
