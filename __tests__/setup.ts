// Global test setup and environment variable mocks
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key-for-prism';
process.env.NEXTAUTH_SECRET = 'prism-secret-key-32-chars-long-minimum!';
process.env.ML_SERVICE_URL = 'http://localhost:8000';
