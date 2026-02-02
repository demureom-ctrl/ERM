-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- In a real app, this should be hashed!
    role TEXT NOT NULL CHECK (role IN ('admin', 'sales')),
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create activity logs table
CREATE TABLE activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default admin user (admin / 123456)
INSERT INTO users (username, password, role, name)
VALUES ('admin', '123456', 'admin', 'المدير العام');

-- Insert default sales user (sales / 123456)
INSERT INTO users (username, password, role, name)
VALUES ('sales', '123456', 'sales', 'موظف المبيعات');

-- Disable RLS for now
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
