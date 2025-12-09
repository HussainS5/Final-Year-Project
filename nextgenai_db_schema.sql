-- ============================================================================
-- NextGenAI: AI-Powered Career Companion Platform
-- OPTIMIZED Database Schema (18 Core Tables)
-- Fully Normalized PostgreSQL Design
-- Removed: SYSTEM_SETTINGS, USER_ACTIVITY
-- ============================================================================

-- ============================================================================
-- 1. USERS - Core user accounts
-- ============================================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    current_city VARCHAR(100),
    bio TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    profile_picture_url TEXT,
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Core user accounts with profile information';

-- ============================================================================
-- 2. RESUMES - Uploaded resume documents
-- ============================================================================
CREATE TABLE resumes (
    resume_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'docx', 'doc')),
    parsing_status VARCHAR(20) DEFAULT 'pending' CHECK (parsing_status IN ('pending', 'completed', 'failed')),
    parsed_text TEXT,
    parsed_data JSONB, -- Store complete extracted data
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE resumes IS 'Uploaded resumes with parsed data stored in JSONB';

-- ============================================================================
-- 3. EDUCATION - Educational qualifications
-- ============================================================================
CREATE TABLE education (
    education_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    degree_type VARCHAR(50) CHECK (degree_type IN ('high_school', 'bachelors', 'masters', 'phd', 'diploma')),
    degree_title VARCHAR(200) NOT NULL,
    institution_name VARCHAR(200) NOT NULL,
    field_of_study VARCHAR(150),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    grade_cgpa DECIMAL(4,2),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE education IS 'User educational qualifications';

-- ============================================================================
-- 4. WORK_EXPERIENCE - Work history
-- ============================================================================
CREATE TABLE work_experience (
    experience_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    employment_type VARCHAR(50) CHECK (employment_type IN ('full_time', 'part_time', 'internship', 'freelance')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE work_experience IS 'User work experience history';

-- ============================================================================
-- 5. SKILLS_CATALOG - Master skills database
-- ============================================================================
CREATE TABLE skills_catalog (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    skill_category VARCHAR(100) CHECK (skill_category IN ('technical', 'soft_skill', 'language', 'tool', 'framework')),
    description TEXT,
    demand_score INTEGER DEFAULT 50 CHECK (demand_score BETWEEN 0 AND 100),
    is_trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE skills_catalog IS 'Master catalog of all skills';

-- ============================================================================
-- 6. USER_SKILLS - User's skills with proficiency
-- ============================================================================
CREATE TABLE user_skills (
    user_skill_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_of_experience DECIMAL(4,2),
    source VARCHAR(50) CHECK (source IN ('resume_extracted', 'manual_entry', 'verified')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills_catalog(skill_id) ON DELETE CASCADE,
    UNIQUE(user_id, skill_id)
);

COMMENT ON TABLE user_skills IS 'Skills possessed by users with proficiency levels';

-- ============================================================================
-- 7. JOB_POSTINGS - Scraped job opportunities
-- ============================================================================
CREATE TABLE job_postings (
    job_id SERIAL PRIMARY KEY,
    job_title VARCHAR(200) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    job_description TEXT,
    job_location VARCHAR(200),
    job_type VARCHAR(50) CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship')),
    work_mode VARCHAR(20) CHECK (work_mode IN ('onsite', 'remote', 'hybrid')),
    experience_required_min DECIMAL(4,2),
    experience_required_max DECIMAL(4,2),
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    required_skills JSONB, -- Store skills array
    source_portal VARCHAR(100) NOT NULL,
    source_url TEXT UNIQUE NOT NULL,
    posted_date DATE,
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE job_postings IS 'Job opportunities from LinkedIn, Indeed, Rozee.pk';

-- ============================================================================
-- 8. OPPORTUNITIES - Scholarships and Admissions (Combined)
-- ============================================================================
CREATE TABLE opportunities (
    opportunity_id SERIAL PRIMARY KEY,
    opportunity_type VARCHAR(20) CHECK (opportunity_type IN ('scholarship', 'admission')),
    title VARCHAR(255) NOT NULL,
    organization_name VARCHAR(200) NOT NULL,
    country VARCHAR(100),
    degree_level VARCHAR(50) CHECK (degree_level IN ('undergraduate', 'masters', 'phd')),
    field_of_study VARCHAR(150),
    description TEXT,
    eligibility_criteria TEXT,
    funding_amount DECIMAL(12,2),
    currency VARCHAR(10),
    application_deadline DATE,
    source_url TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE opportunities IS 'Combined scholarships and university admissions';

-- ============================================================================
-- 9. RECOMMENDATIONS - AI-generated matches (Jobs + Opportunities)
-- ============================================================================
CREATE TABLE recommendations (
    recommendation_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    entity_type VARCHAR(20) CHECK (entity_type IN ('job', 'scholarship', 'admission')),
    entity_id INTEGER NOT NULL, -- job_id or opportunity_id
    match_score DECIMAL(5,4) NOT NULL CHECK (match_score BETWEEN 0 AND 1),
    match_reason TEXT,
    skill_match_percentage DECIMAL(5,2),
    recommendation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_viewed BOOLEAN DEFAULT FALSE,
    is_saved BOOLEAN DEFAULT FALSE,
    is_applied BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE recommendations IS 'AI-generated recommendations for jobs, scholarships, admissions';

-- ============================================================================
-- 10. SKILL_GAPS - Identified skill gaps with priorities
-- ============================================================================
CREATE TABLE skill_gaps (
    gap_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    current_level VARCHAR(50) CHECK (current_level IN ('none', 'beginner', 'intermediate', 'advanced')),
    target_level VARCHAR(50) CHECK (target_level IN ('intermediate', 'advanced', 'expert')),
    gap_severity VARCHAR(20) CHECK (gap_severity IN ('critical', 'high', 'medium', 'low')),
    priority_score INTEGER CHECK (priority_score BETWEEN 1 AND 100),
    identified_from VARCHAR(50), -- 'job_id:123' or 'opportunity_id:45'
    identified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills_catalog(skill_id) ON DELETE CASCADE
);

COMMENT ON TABLE skill_gaps IS 'Skill gaps identified from job/opportunity matching';

-- ============================================================================
-- 11. LEARNING_PATHS - Personalized learning journeys
-- ============================================================================
CREATE TABLE learning_paths (
    path_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    path_name VARCHAR(255) NOT NULL,
    target_role VARCHAR(150),
    total_duration_weeks INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE learning_paths IS 'Personalized learning paths for users';

-- ============================================================================
-- 12. LEARNING_MODULES - Modules within learning paths
-- ============================================================================
CREATE TABLE learning_modules (
    module_id SERIAL PRIMARY KEY,
    path_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    module_order INTEGER NOT NULL,
    estimated_hours INTEGER,
    resources JSONB, -- Array of {title, url, type, duration}
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (path_id) REFERENCES learning_paths(path_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills_catalog(skill_id) ON DELETE CASCADE
);

COMMENT ON TABLE learning_modules IS 'Individual modules in learning paths with embedded resources';

-- ============================================================================
-- 13. ASSESSMENTS - Skills assessments and quizzes
-- ============================================================================
CREATE TABLE assessments (
    assessment_id SERIAL PRIMARY KEY,
    skill_id INTEGER NOT NULL,
    assessment_title VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(50) CHECK (assessment_type IN ('mcq', 'coding', 'practical')),
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    questions JSONB NOT NULL, -- Array of question objects
    total_marks INTEGER NOT NULL,
    passing_marks INTEGER NOT NULL,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skills_catalog(skill_id) ON DELETE CASCADE
);

COMMENT ON TABLE assessments IS 'Skills assessments with questions stored as JSONB';

-- ============================================================================
-- 14. USER_ASSESSMENTS - User assessment attempts
-- ============================================================================
CREATE TABLE user_assessments (
    attempt_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    assessment_id INTEGER NOT NULL,
    answers JSONB, -- User's answers array
    score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_taken_minutes INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id) ON DELETE CASCADE
);

COMMENT ON TABLE user_assessments IS 'User assessment attempts with answers in JSONB';

-- ============================================================================
-- 15. CHAT_SESSIONS - AI chatbot conversations
-- ============================================================================
CREATE TABLE chat_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    messages JSONB NOT NULL, -- Array of {sender, message, timestamp, skill_id}
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE chat_sessions IS 'Chatbot conversations with messages stored as JSONB';

-- ============================================================================
-- 16. NOTIFICATIONS - User notifications and alerts
-- ============================================================================
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notification_type VARCHAR(50) CHECK (notification_type IN ('deadline', 'new_match', 'milestone', 'reminder')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity VARCHAR(100), -- 'job_id:123' or 'path_id:45'
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE notifications IS 'User notifications and alerts';

-- ============================================================================
-- 17. APPLICATIONS - Track all user applications (Jobs + Opportunities)
-- ============================================================================
CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    application_type VARCHAR(20) CHECK (application_type IN ('job', 'scholarship', 'admission')),
    entity_id INTEGER NOT NULL, -- job_id or opportunity_id
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected')),
    cover_letter TEXT,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE applications IS 'Unified application tracking for jobs, scholarships, admissions';

-- ============================================================================
-- 18. ACHIEVEMENTS - User achievements and milestones
-- ============================================================================
CREATE TABLE achievements (
    achievement_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    achievement_type VARCHAR(50) CHECK (achievement_type IN ('skill_master', 'fast_learner', 'assessment_ace', 'career_milestone')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    badge_url TEXT,
    points_earned INTEGER DEFAULT 0,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE achievements IS 'User achievements and badges';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(account_status);

-- Resumes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_status ON resumes(parsing_status);

-- Skills
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX idx_skills_category ON skills_catalog(skill_category);

-- Jobs
CREATE INDEX idx_jobs_active ON job_postings(is_active);
CREATE INDEX idx_jobs_posted_date ON job_postings(posted_date DESC);
CREATE INDEX idx_jobs_location ON job_postings(job_location);

-- Recommendations
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_score ON recommendations(match_score DESC);

-- Learning
CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX idx_modules_path_id ON learning_modules(path_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = FALSE;

-- Applications
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);

-- JSONB Indexes (for faster queries on JSONB fields)
CREATE INDEX idx_resumes_parsed_data ON resumes USING GIN (parsed_data);
CREATE INDEX idx_jobs_skills ON job_postings USING GIN (required_skills);
CREATE INDEX idx_modules_resources ON learning_modules USING GIN (resources);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SAMPLE DATA INSERTS
-- ============================================================================

-- Insert sample skills
INSERT INTO skills_catalog (skill_name, skill_category, demand_score, is_trending) VALUES
('Python', 'technical', 98, TRUE),
('Machine Learning', 'technical', 95, TRUE),
('React.js', 'technical', 90, TRUE),
('Communication', 'soft_skill', 88, FALSE),
('SQL', 'technical', 85, FALSE);

-- Additional sample users
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, current_city, bio, linkedin_url, github_url, profile_picture_url, account_status) VALUES
('alice@example.com', 'hashed_pw_1', 'Alice', 'Khan', '03001234567', '1995-06-15', 'Karachi', 'Data scientist and ML enthusiast', 'https://linkedin.com/in/alice', 'https://github.com/alice', 'https://example.com/alice.jpg', 'active'),
('bob@example.com', 'hashed_pw_2', 'Bob', 'Ahmed', '03009876543', '1998-03-22', 'Lahore', 'Full stack developer passionate about web technologies', 'https://linkedin.com/in/bob', 'https://github.com/bob', 'https://example.com/bob.jpg', 'active'),
('charlie@example.com', 'hashed_pw_3', 'Charlie', 'Malik', '03112345678', '1997-11-08', 'Islamabad', 'Software engineer seeking career growth', 'https://linkedin.com/in/charlie', 'https://github.com/charlie', 'https://example.com/charlie.jpg', 'active'),
('diana@example.com', 'hashed_pw_4', 'Diana', 'Shah', '03221234567', '1996-09-14', 'Karachi', 'Recent graduate in computer science', 'https://linkedin.com/in/diana', NULL, 'https://example.com/diana.jpg', 'active'),
('eve@example.com', 'hashed_pw_5', 'Eve', 'Siddiqui', '03331122334', '1999-01-30', 'Peshawar', 'Aspiring data analyst', 'https://linkedin.com/in/eve', NULL, NULL, 'active');

-- Additional skills
INSERT INTO skills_catalog (skill_name, skill_category, demand_score, is_trending) VALUES
('Docker', 'tool', 75, FALSE),
('Kubernetes', 'tool', 80, TRUE),
('Node.js', 'framework', 85, FALSE),
('PostgreSQL', 'technical', 82, FALSE),
('Leadership', 'soft_skill', 90, FALSE),
('Problem Solving', 'soft_skill', 92, FALSE),
('Java', 'technical', 88, FALSE),
('AWS', 'technical', 93, TRUE),
('TensorFlow', 'framework', 91, TRUE),
('Django', 'framework', 78, FALSE),
('Git', 'tool', 95, FALSE),
('Agile', 'soft_skill', 86, FALSE),
('Flutter', 'framework', 77, TRUE),
('TypeScript', 'technical', 84, TRUE),
('Data Analysis', 'technical', 89, FALSE);

-- Resumes for multiple users
INSERT INTO resumes (user_id, file_name, file_path, file_type, parsing_status, parsed_text, parsed_data, is_active) VALUES
(1, 'alice_resume.pdf', '/resumes/alice_resume.pdf', 'pdf', 'completed', 'Alice Khan, BSc Computer Science...', '{"education":[{"degree":"BSc Computer Science","institution":"NED University"}],"skills":["Python","Machine Learning","SQL"]}', TRUE),
(2, 'bob_resume.docx', '/resumes/bob_resume.docx', 'docx', 'completed', 'Bob Ahmed, Full Stack Developer...', '{"education":[{"degree":"BSc Software Engineering","institution":"FAST-NUCES"}],"skills":["React.js","Node.js","PostgreSQL"]}', TRUE),
(3, 'charlie_resume.pdf', '/resumes/charlie_resume.pdf', 'pdf', 'completed', 'Charlie Malik, Software Engineer...', '{"education":[{"degree":"BSc CS","institution":"NUST"}],"skills":["Java","AWS","Docker"]}', TRUE),
(4, 'diana_resume.pdf', '/resumes/diana_resume.pdf', 'pdf', 'pending', 'Diana Shah, Fresh Graduate...', NULL, TRUE),
(5, 'eve_resume.docx', '/resumes/eve_resume.docx', 'docx', 'completed', 'Eve Siddiqui, Data Analyst...', '{"education":[{"degree":"BSc Statistics","institution":"Punjab University"}],"skills":["SQL","Data Analysis","Python"]}', TRUE);

-- Education records
INSERT INTO education (user_id, degree_type, degree_title, institution_name, field_of_study, start_date, end_date, is_current, grade_cgpa) VALUES
(1, 'bachelors', 'BSc Computer Science', 'NED University', 'Computer Science', '2013-08-01', '2017-05-30', FALSE, 3.60),
(1, 'masters', 'MS Data Science', 'IBA Karachi', 'Data Science', '2018-09-01', NULL, TRUE, NULL),
(2, 'bachelors', 'BSc Software Engineering', 'FAST-NUCES', 'Software Engineering', '2016-08-01', '2020-06-30', FALSE, 3.45),
(3, 'bachelors', 'BSc Computer Science', 'NUST', 'Computer Science', '2015-09-01', '2019-07-15', FALSE, 3.75),
(4, 'bachelors', 'BSc Computer Science', 'University of Karachi', 'Computer Science', '2019-08-01', '2023-06-30', FALSE, 3.20),
(5, 'bachelors', 'BSc Statistics', 'Punjab University', 'Statistics', '2017-08-01', '2021-06-30', FALSE, 3.55);

-- Work experience
INSERT INTO work_experience (user_id, job_title, company_name, employment_type, start_date, end_date, is_current, description) VALUES
(1, 'Data Scientist', 'Tech Solutions Ltd', 'full_time', '2018-06-01', NULL, TRUE, 'Working on ML models for product recommendations and customer analytics'),
(1, 'ML Intern', 'AI Startup', 'internship', '2017-06-01', '2017-08-31', FALSE, 'Developed classification models for image recognition'),
(2, 'Full Stack Developer', 'Web Agency Pro', 'full_time', '2020-08-01', NULL, TRUE, 'Building scalable web applications using MERN stack'),
(2, 'Frontend Developer Intern', 'Digital Solutions', 'internship', '2019-06-01', '2019-09-30', FALSE, 'Created responsive UI components using React'),
(3, 'Software Engineer', 'Cloud Systems Inc', 'full_time', '2019-09-01', NULL, TRUE, 'Developing microservices architecture on AWS'),
(5, 'Data Analyst Intern', 'Business Analytics Co', 'internship', '2021-07-01', '2021-12-31', FALSE, 'Performed data analysis and created dashboards');

-- User skills (connecting users with skills)
INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_of_experience, source) VALUES
(1, 1, 'advanced', 5.00, 'resume_extracted'),
(1, 2, 'advanced', 3.50, 'resume_extracted'),
(1, 5, 'advanced', 4.00, 'resume_extracted'),
(1, 6, 'intermediate', 1.50, 'manual_entry'),
(1, 9, 'intermediate', 2.00, 'manual_entry'),
(2, 3, 'advanced', 3.00, 'resume_extracted'),
(2, 8, 'advanced', 3.00, 'resume_extracted'),
(2, 9, 'intermediate', 2.50, 'resume_extracted'),
(2, 16, 'intermediate', 2.00, 'manual_entry'),
(3, 12, 'advanced', 4.00, 'resume_extracted'),
(3, 13, 'advanced', 3.50, 'resume_extracted'),
(3, 6, 'intermediate', 2.00, 'resume_extracted'),
(3, 7, 'beginner', 1.00, 'manual_entry'),
(4, 1, 'beginner', 0.50, 'manual_entry'),
(4, 5, 'beginner', 0.50, 'manual_entry'),
(5, 1, 'intermediate', 2.00, 'resume_extracted'),
(5, 5, 'advanced', 3.00, 'resume_extracted'),
(5, 20, 'intermediate', 2.00, 'resume_extracted');

-- Job postings
INSERT INTO job_postings (job_title, company_name, job_description, job_location, job_type, work_mode, experience_required_min, experience_required_max, salary_min, salary_max, required_skills, source_portal, source_url, posted_date, application_deadline, is_active) VALUES
('Machine Learning Engineer', 'AI Innovate', 'Develop and productionize ML models for recommendation systems', 'Karachi, Pakistan', 'full_time', 'remote', 2.00, 5.00, 150000.00, 300000.00, '["Python","Machine Learning","TensorFlow","SQL"]', 'LinkedIn', 'https://jobs.example.com/ml-engineer-1', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', TRUE),
('Senior Full Stack Developer', 'TechCorp', 'Build scalable web applications using modern frameworks', 'Lahore, Pakistan', 'full_time', 'hybrid', 3.00, 6.00, 200000.00, 400000.00, '["React.js","Node.js","PostgreSQL","AWS"]', 'LinkedIn', 'https://jobs.example.com/fullstack-1', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', TRUE),
('Data Analyst', 'Analytics Hub', 'Perform data analysis and create insightful dashboards', 'Karachi, Pakistan', 'full_time', 'onsite', 1.00, 3.00, 80000.00, 150000.00, '["SQL","Data Analysis","Python"]', 'Rozee.pk', 'https://jobs.example.com/data-analyst-1', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '15 days', TRUE),
('Cloud Engineer', 'CloudTech Solutions', 'Design and implement cloud infrastructure on AWS', 'Islamabad, Pakistan', 'full_time', 'remote', 2.00, 5.00, 180000.00, 350000.00, '["AWS","Docker","Kubernetes","Java"]', 'Indeed', 'https://jobs.example.com/cloud-engineer-1', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '18 days', TRUE),
('Junior Software Developer', 'StartupXYZ', 'Join our team to build innovative software solutions', 'Karachi, Pakistan', 'full_time', 'onsite', 0.00, 2.00, 60000.00, 100000.00, '["Python","Git","Problem Solving"]', 'Rozee.pk', 'https://jobs.example.com/junior-dev-1', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '30 days', TRUE),
('React Native Developer', 'Mobile Apps Co', 'Develop cross-platform mobile applications', 'Lahore, Pakistan', 'contract', 'remote', 2.00, 4.00, 120000.00, 250000.00, '["React.js","Flutter","TypeScript"]', 'LinkedIn', 'https://jobs.example.com/react-native-1', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE + INTERVAL '10 days', TRUE);

-- Opportunities (scholarships and admissions)
INSERT INTO opportunities (opportunity_type, title, organization_name, country, degree_level, field_of_study, description, eligibility_criteria, funding_amount, currency, application_deadline, source_url, is_active) VALUES
('scholarship', 'Masters Scholarship in AI', 'Global Education Trust', 'USA', 'masters', 'Artificial Intelligence', 'Full tuition scholarship for AI/ML masters programs', 'GPA >= 3.5, IELTS >= 7.0', 50000.00, 'USD', CURRENT_DATE + INTERVAL '60 days', 'https://scholarships.example.com/ai-masters', TRUE),
('scholarship', 'Commonwealth Scholarship', 'UK Government', 'United Kingdom', 'masters', 'Computer Science', 'Fully funded masters degree in CS', 'Developing country citizen, First class degree', 35000.00, 'GBP', CURRENT_DATE + INTERVAL '45 days', 'https://scholarships.example.com/commonwealth', TRUE),
('admission', 'PhD Program in Data Science', 'MIT', 'USA', 'phd', 'Data Science', 'PhD program with research assistantship', 'Masters degree, Strong research background', 30000.00, 'USD', CURRENT_DATE + INTERVAL '90 days', 'https://admissions.example.com/mit-phd', TRUE),
('scholarship', 'DAAD Scholarship', 'DAAD Germany', 'Germany', 'masters', 'Computer Science', 'Scholarship for masters studies in Germany', 'Good academic record, German language proficiency', 10000.00, 'EUR', CURRENT_DATE + INTERVAL '50 days', 'https://scholarships.example.com/daad', TRUE),
('admission', 'Masters in Software Engineering', 'National University of Singapore', 'Singapore', 'masters', 'Software Engineering', 'World-class masters program with industry links', 'Bachelors in CS/SE, IELTS 6.5', 0.00, 'SGD', CURRENT_DATE + INTERVAL '75 days', 'https://admissions.example.com/nus-mse', TRUE);

-- Recommendations for users
INSERT INTO recommendations (user_id, entity_type, entity_id, match_score, match_reason, skill_match_percentage, is_viewed, is_saved, is_applied) VALUES
(1, 'job', 1, 0.9200, 'Excellent match: Python, ML, TensorFlow skills align perfectly', 92.00, FALSE, TRUE, FALSE),
(1, 'scholarship', 1, 0.8500, 'AI/ML focus matches your profile and ongoing masters degree', 85.00, FALSE, FALSE, FALSE),
(2, 'job', 2, 0.8800, 'Strong skills match in React, Node.js, and AWS', 88.00, TRUE, TRUE, TRUE),
(2, 'job', 6, 0.7500, 'Good match for React Native with your React.js background', 75.00, FALSE, FALSE, FALSE),
(3, 'job', 4, 0.9000, 'Perfect fit: AWS, Docker, Kubernetes expertise required', 90.00, FALSE, TRUE, FALSE),
(4, 'job', 5, 0.7000, 'Entry-level position suitable for fresh graduates', 70.00, TRUE, FALSE, FALSE),
(5, 'job', 3, 0.8300, 'Data analysis skills match perfectly with requirements', 83.00, FALSE, FALSE, FALSE);

-- Skill gaps identified
INSERT INTO skill_gaps (user_id, skill_id, current_level, target_level, gap_severity, priority_score, identified_from, is_resolved) VALUES
(1, 6, 'intermediate', 'advanced', 'medium', 65, 'job_id:1', FALSE),
(1, 7, 'none', 'intermediate', 'high', 75, 'job_id:1', FALSE),
(2, 13, 'none', 'intermediate', 'medium', 60, 'job_id:2', FALSE),
(3, 14, 'none', 'intermediate', 'medium', 55, 'job_id:4', FALSE),
(4, 1, 'beginner', 'intermediate', 'critical', 85, 'job_id:5', FALSE),
(4, 16, 'none', 'intermediate', 'high', 80, 'job_id:5', FALSE),
(5, 2, 'none', 'intermediate', 'medium', 50, 'job_id:3', FALSE);

-- Learning paths
INSERT INTO learning_paths (user_id, path_name, target_role, total_duration_weeks, status, completion_percentage) VALUES
(1, 'Advanced ML Engineer Track', 'Senior ML Engineer', 16, 'active', 25.00),
(2, 'Cloud DevOps Mastery', 'DevOps Engineer', 12, 'active', 15.00),
(3, 'Kubernetes Expert Path', 'Cloud Architect', 10, 'active', 30.00),
(4, 'Software Development Fundamentals', 'Junior Developer', 20, 'active', 10.00),
(5, 'Data Science Career Path', 'Data Scientist', 18, 'active', 20.00);

-- Learning modules
INSERT INTO learning_modules (path_id, skill_id, module_name, module_order, estimated_hours, resources, status, completion_percentage) VALUES
(1, 6, 'Docker Fundamentals', 1, 15, '[{"title":"Docker Complete Guide","url":"https://learn.example.com/docker","type":"video","duration":180}]', 'completed', 100.00),
(1, 7, 'Kubernetes Deployment', 2, 20, '[{"title":"K8s Mastery Course","url":"https://learn.example.com/k8s","type":"course","duration":240}]', 'in_progress', 40.00),
(1, 14, 'TensorFlow Advanced', 3, 25, '[{"title":"TF Deep Dive","url":"https://learn.example.com/tf","type":"video","duration":300}]', 'not_started', 0.00),
(2, 13, 'AWS Essentials', 1, 18, '[{"title":"AWS Basics","url":"https://learn.example.com/aws","type":"course","duration":220}]', 'in_progress', 50.00),
(3, 7, 'Kubernetes Architecture', 1, 22, '[{"title":"K8s Deep Dive","url":"https://learn.example.com/k8s-arch","type":"course","duration":260}]', 'in_progress', 60.00),
(4, 1, 'Python Programming Basics', 1, 12, '[{"title":"Python for Beginners","url":"https://learn.example.com/python","type":"video","duration":150}]', 'in_progress', 30.00),
(5, 2, 'Introduction to Machine Learning', 1, 16, '[{"title":"ML Fundamentals","url":"https://learn.example.com/ml","type":"course","duration":200}]', 'in_progress', 40.00);

-- Assessments
INSERT INTO assessments (skill_id, assessment_title, assessment_type, difficulty_level, questions, total_marks, passing_marks, time_limit_minutes) VALUES
(1, 'Python Basics Quiz', 'mcq', 'beginner', '[{"q":"What is a list in Python?","options":["Array","Dictionary","Sequence","Tuple"],"answer":2},{"q":"Which keyword defines a function?","options":["func","def","function","define"],"answer":1}]', 10, 6, 20),
(2, 'Machine Learning Fundamentals', 'mcq', 'intermediate', '[{"q":"What is supervised learning?","options":["Learning with labels","Unsupervised","Clustering","Random"],"answer":0}]', 20, 12, 30),
(3, 'React.js Advanced Concepts', 'coding', 'advanced', '[{"q":"Implement a custom hook for API calls","starter_code":"function useAPI() {}"}]', 50, 30, 60),
(5, 'SQL Query Mastery', 'mcq', 'intermediate', '[{"q":"What is a JOIN?","options":["Combine tables","Split data","Delete rows","Update"],"answer":0}]', 15, 9, 25),
(13, 'AWS Cloud Practitioner', 'mcq', 'beginner', '[{"q":"What is EC2?","options":["Database","Compute","Storage","Network"],"answer":1}]', 25, 15, 40);

-- User assessment attempts
INSERT INTO user_assessments (user_id, assessment_id, answers, score, percentage, passed, submitted_at, time_taken_minutes) VALUES
(1, 1, '[{"q_id":1,"answer":2},{"q_id":2,"answer":1}]', 10.00, 100.00, TRUE, CURRENT_TIMESTAMP - INTERVAL '2 days', 15),
(1, 2, '[{"q_id":1,"answer":0}]', 18.00, 90.00, TRUE, CURRENT_TIMESTAMP - INTERVAL '5 days', 25),
(2, 3, '[{"q_id":1,"code":"function useAPI() { return fetch() }"}]', 42.00, 84.00, TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day', 55),
(4, 1, '[{"q_id":1,"answer":0},{"q_id":2,"answer":1}]', 5.00, 50.00, FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days', 18),
(5, 4, '[{"q_id":1,"answer":0}]', 13.00, 86.67, TRUE, CURRENT_TIMESTAMP - INTERVAL '4 days', 20);

-- Chat sessions
INSERT INTO chat_sessions (user_id, messages, started_at, last_message_at, is_active) VALUES
(1, '[{"sender":"user","message":"How can I improve my ML skills?","timestamp":"2024-01-15T10:00:00"},{"sender":"bot","message":"I recommend focusing on TensorFlow and deep learning","timestamp":"2024-01-15T10:00:15"}]', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', TRUE),
(2, '[{"sender":"user","message":"What jobs match my profile?","timestamp":"2024-01-15T14:00:00"},{"sender":"bot","message":"Found 3 matching positions","timestamp":"2024-01-15T14:00:20"}]', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours', FALSE),
(3, '[{"sender":"user","message":"Tell me about cloud certifications","timestamp":"2024-01-15T09:00:00"}]', CURRENT_TIMESTAMP - INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '8 hours', TRUE);

-- Notifications
INSERT INTO notifications (user_id, notification_type, title, message, related_entity, priority, is_read) VALUES
(1, 'new_match', 'New Job Match!', 'ML Engineer position at AI Innovate matches your profile with 92% score', 'job_id:1', 'high', FALSE),
(1, 'deadline', 'Application Deadline Approaching', 'Masters Scholarship in AI deadline is in 7 days', 'scholarship_id:1', 'urgent', FALSE),
(2, 'milestone', 'Congratulations!', 'You completed AWS Essentials module', 'module_id:4', 'medium', TRUE),
(3, 'reminder', 'Continue Learning', 'You have pending modules in Kubernetes Expert Path', 'path_id:3', 'low', FALSE),
(4, 'new_match', 'Perfect for You!', 'Junior Developer position matches your skills', 'job_id:5', 'medium', FALSE),
(5, 'milestone', 'Achievement Unlocked!', 'You earned the SQL Master badge', 'achievement_id:3', 'medium', TRUE);

-- Applications tracking
INSERT INTO applications (user_id, application_type, entity_id, applied_date, status, cover_letter, notes) VALUES
(1, 'job', 1, CURRENT_TIMESTAMP - INTERVAL '3 days', 'under_review', 'I am very excited about this ML Engineer role. With 5 years of Python experience...', 'Applied through platform'),
(2, 'job', 2, CURRENT_TIMESTAMP - INTERVAL '1 day', 'applied', 'My full-stack experience with React and Node.js makes me ideal for this position...', 'Quick apply used'),
(2, 'scholarship', 2, CURRENT_TIMESTAMP - INTERVAL '10 days', 'shortlisted', 'Statement of purpose attached separately', 'Interview scheduled for next week'),
(3, 'job', 4, CURRENT_TIMESTAMP - INTERVAL '5 days', 'interview', 'Cover letter emphasizing AWS and Kubernetes expertise', 'Technical round on Friday'),
(5, 'admission', 5, CURRENT_TIMESTAMP - INTERVAL '15 days', 'applied', 'Application with all transcripts and recommendations', 'Waiting for response');

-- Achievements and badges
INSERT INTO achievements (user_id, achievement_type, title, description, badge_url, points_earned) VALUES
(1, 'assessment_ace', 'Perfect Score', 'Scored 100% on Python Basics Quiz', 'https://badges.example.com/perfect_score.png', 50),
(1, 'skill_master', 'ML Expert', 'Demonstrated expert level proficiency in Machine Learning', 'https://badges.example.com/ml_expert.png', 100),
(2, 'fast_learner', 'Quick Learner', 'Completed 3 modules in 2 weeks', 'https://badges.example.com/fast_learner.png', 75),
(3, 'career_milestone', 'Job Application Streak', 'Applied to 5 jobs this month', 'https://badges.example.com/job_streak.png', 60),
(5, 'skill_master', 'SQL Master', 'Passed SQL assessment with 86% score', 'https://badges.example.com/sql_master.png', 80);

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- Complete user profile view
CREATE VIEW vw_user_profiles AS
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.current_city,
    COUNT(DISTINCT us.skill_id) as total_skills,
    COUNT(DISTINCT e.education_id) as education_count,
    COUNT(DISTINCT we.experience_id) as experience_count,
    COUNT(DISTINCT r.resume_id) as resume_count
FROM users u
LEFT JOIN user_skills us ON u.user_id = us.user_id
LEFT JOIN education e ON u.user_id = e.user_id
LEFT JOIN work_experience we ON u.user_id = we.user_id
LEFT JOIN resumes r ON u.user_id = r.user_id AND r.is_active = TRUE
GROUP BY u.user_id;

-- Active recommendations view
CREATE VIEW vw_active_recommendations AS
SELECT 
    r.recommendation_id,
    r.user_id,
    r.entity_type,
    r.entity_id,
    r.match_score,
    r.skill_match_percentage,
    CASE 
        WHEN r.entity_type = 'job' THEN jp.job_title
        ELSE o.title
    END as title,
    CASE 
        WHEN r.entity_type = 'job' THEN jp.company_name
        ELSE o.organization_name
    END as organization
FROM recommendations r
LEFT JOIN job_postings jp ON r.entity_type = 'job' AND r.entity_id = jp.job_id
LEFT JOIN opportunities o ON r.entity_type IN ('scholarship', 'admission') AND r.entity_id = o.opportunity_id
WHERE r.is_viewed = FALSE;

-- User progress dashboard
CREATE VIEW vw_user_progress AS
SELECT 
    lp.user_id,
    lp.path_id,
    lp.path_name,
    lp.completion_percentage as path_completion,
    COUNT(lm.module_id) as total_modules,
    COUNT(CASE WHEN lm.status = 'completed' THEN 1 END) as completed_modules,
    SUM(lm.estimated_hours) as total_hours
FROM learning_paths lp
LEFT JOIN learning_modules lm ON lp.path_id = lm.path_id
GROUP BY lp.path_id;

-- ============================================================================
-- END OF OPTIMIZED SCHEMA
-- Total Tables: 18
-- Total Indexes: 18
-- Total Views: 3
-- Removed: SYSTEM_SETTINGS, USER_ACTIVITY
-- ============================================================================