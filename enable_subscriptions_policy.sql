-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to enable insert for anonymous users
CREATE POLICY "Enable insert for anonymous users" ON subscriptions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policy to enable select for anonymous users
CREATE POLICY "Enable select for anonymous users" ON subscriptions
    FOR SELECT
    TO anon
    USING (true); 