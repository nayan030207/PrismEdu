-- =============================================================================
-- PRISM-EDU Comprehensive Seed Data
-- =============================================================================

-- Clean up any existing data in reverse order of dependencies
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE ai_conversations CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE career_opportunities CASCADE;
TRUNCATE TABLE counsellors CASCADE;
TRUNCATE TABLE educational_loans CASCADE;
TRUNCATE TABLE scholarships CASCADE;
TRUNCATE TABLE interventions CASCADE;
TRUNCATE TABLE student_insights CASCADE;
TRUNCATE TABLE predictions CASCADE;
TRUNCATE TABLE model_versions CASCADE;
TRUNCATE TABLE activity_events CASCADE;
TRUNCATE TABLE quiz_attempts CASCADE;
TRUNCATE TABLE quizzes CASCADE;
TRUNCATE TABLE assignment_submissions CASCADE;
TRUNCATE TABLE assignments CASCADE;
TRUNCATE TABLE learning_activity CASCADE;
TRUNCATE TABLE resource_embeddings CASCADE;
TRUNCATE TABLE learning_resources CASCADE;
TRUNCATE TABLE attendance_records CASCADE;
TRUNCATE TABLE academic_records CASCADE;
TRUNCATE TABLE subjects CASCADE;
TRUNCATE TABLE admission_profiles CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE faculty CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE departments CASCADE;

-- Fixed UUIDs for predictable references
-- Password hash for 'admin123', 'faculty123', 'student123'
-- Bcrypt hash of 'password123': $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
-- We will use this universal test hash for seamless login testing
-- Passwords:
-- admin@prismedu.com    -> password123
-- faculty1@prismedu.com  -> password123
-- faculty2@prismedu.com  -> password123
-- student1@prismedu.com  -> password123
-- student2@prismedu.com  -> password123
-- student3@prismedu.com  -> password123
-- student4@prismedu.com  -> password123
-- student5@prismedu.com  -> password123
-- student6@prismedu.com  -> password123

-- 1. DEPARTMENTS
INSERT INTO departments (id, name, code, description) VALUES
('d1111111-1111-1111-1111-111111111111', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science & Software Engineering'),
('d2222222-2222-2222-2222-222222222222', 'Information Technology', 'IT', 'Department of Information Systems and Cloud Computing'),
('d3333333-3333-3333-3333-333333333333', 'Electronics and Communication', 'ECE', 'Department of Electronics and Communications');

-- 2. COURSES
INSERT INTO courses (id, name, code, department_id, duration_years, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'B.Tech in Computer Science', 'BTECH-CSE', 'd1111111-1111-1111-1111-111111111111', 4, 'Undergraduate 4-year Computer Science engineering program'),
('c2222222-2222-2222-2222-222222222222', 'B.Tech in Information Technology', 'BTECH-IT', 'd2222222-2222-2222-2222-222222222222', 4, 'Undergraduate 4-year IT and Systems program');

-- 3. USERS (Admin, Faculty, Students)
-- Hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi (password123)
INSERT INTO users (id, email, password_hash, role, status) VALUES
-- Admin
('u0000000-0000-0000-0000-000000000001', 'admin@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin', 'active'),
-- Faculty
('u1111111-0000-0000-0000-000000000001', 'faculty1@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'faculty', 'active'),
('u1111111-0000-0000-0000-000000000002', 'faculty2@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'faculty', 'active'),
-- Students
('u2222222-0000-0000-0000-000000000001', 'student1@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('u2222222-0000-0000-0000-000000000002', 'student2@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('u2222222-0000-0000-0000-000000000003', 'student3@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('u2222222-0000-0000-0000-000000000004', 'student4@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('u2222222-0000-0000-0000-000000000005', 'student5@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('u2222222-0000-0000-0000-000000000006', 'student6@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active');

-- 4. FACULTY PROFILES
INSERT INTO faculty (id, user_id, employee_id, full_name, email, mobile, department_id, designation, specialization, status) VALUES
('f1111111-1111-1111-1111-111111111111', 'u1111111-0000-0000-0000-000000000001', 'FAC-CSE-01', 'Dr. Sarah Mitchell', 'faculty1@prismedu.com', '+91 9876543210', 'd1111111-1111-1111-1111-111111111111', 'Associate Professor', 'Database Systems & Machine Learning', 'active'),
('f2222222-2222-2222-2222-222222222222', 'u1111111-0000-0000-0000-000000000002', 'FAC-IT-02', 'Prof. David Reynolds', 'faculty2@prismedu.com', '+91 9876543211', 'd2222222-2222-2222-2222-222222222222', 'Assistant Professor', 'Computer Networks & Distributed Systems', 'active');

-- 5. STUDENTS
INSERT INTO students (id, user_id, student_id, full_name, email, mobile, date_of_birth, gender, course_id, department_id, academic_year, admission_year, faculty_id, status, current_outcome) VALUES
-- Student 1: Aarav Sharma (Good Standing)
('s1111111-1111-1111-1111-111111111111', 'u2222222-0000-0000-0000-000000000001', 'STU1021', 'Aarav Sharma', 'student1@prismedu.com', '+91 9123456781', '2004-05-14', 'male', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 2, 2023, 'f1111111-1111-1111-1111-111111111111', 'active', 'enrolled'),
-- Student 2: Priya Patel (Attention Required: Academic & Financial)
('s2222222-2222-2222-2222-222222222222', 'u2222222-0000-0000-0000-000000000002', 'STU1024', 'Priya Patel', 'student2@prismedu.com', '+91 9123456782', '2004-08-22', 'female', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 2, 2023, 'f1111111-1111-1111-1111-111111111111', 'active', 'enrolled'),
-- Student 3: Rohan Gupta (Declining Attendance & Engagement)
('s3333333-3333-3333-3333-333333333333', 'u2222222-0000-0000-0000-000000000003', 'STU1035', 'Rohan Gupta', 'student3@prismedu.com', '+91 9123456783', '2003-11-09', 'male', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 3, 2022, 'f1111111-1111-1111-1111-111111111111', 'active', 'enrolled'),
-- Student 4: Ananya Singh (Career Active, Good Overall)
('s4444444-4444-4444-4444-444444444444', 'u2222222-0000-0000-0000-000000000004', 'STU1042', 'Ananya Singh', 'student4@prismedu.com', '+91 9123456784', '2004-01-30', 'female', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 2, 2023, 'f1111111-1111-1111-1111-111111111111', 'active', 'enrolled'),
-- Student 5: Vikram Verma (Critical: Low attendance, backlogs)
('s5555555-5555-5555-5555-555555555555', 'u2222222-0000-0000-0000-000000000005', 'STU1058', 'Vikram Verma', 'student5@prismedu.com', '+91 9123456785', '2003-03-17', 'male', 'c2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 3, 2022, 'f2222222-2222-2222-2222-222222222222', 'active', 'enrolled'),
-- Student 6: Neha Joshi (Good Standing)
('s6666666-6666-6666-6666-666666666666', 'u2222222-0000-0000-0000-000000000006', 'STU1063', 'Neha Joshi', 'student6@prismedu.com', '+91 9123456786', '2004-07-11', 'female', 'c2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 2, 2023, 'f2222222-2222-2222-2222-222222222222', 'active', 'enrolled');

-- 6. ADMISSION PROFILES
INSERT INTO admission_profiles (student_id, tenth_percentage, twelfth_percentage, previous_gpa, previous_backlogs, family_income, financial_assistance, guardian_name, guardian_relationship, guardian_mobile) VALUES
('s1111111-1111-1111-1111-111111111111', 89.40, 91.20, 8.75, 0, 850000.00, 'not_required', 'Rajesh Sharma', 'Father', '+91 9811122233'),
('s2222222-2222-2222-2222-222222222222', 72.50, 68.00, 6.20, 2, 180000.00, 'required', 'Kamlesh Patel', 'Father', '+91 9811122234'),
('s3333333-3333-3333-3333-333333333333', 78.00, 74.50, 6.90, 1, 420000.00, 'partial', 'Sunil Gupta', 'Father', '+91 9811122235'),
('s4444444-4444-4444-4444-444444444444', 94.00, 92.50, 9.10, 0, 1200000.00, 'not_required', 'Ashok Singh', 'Father', '+91 9811122236'),
('s5555555-5555-5555-5555-555555555555', 61.20, 58.40, 5.10, 4, 150000.00, 'required', 'Mahesh Verma', 'Father', '+91 9811122237'),
('s6666666-6666-6666-6666-666666666666', 86.50, 85.00, 8.40, 0, 650000.00, 'not_required', 'Deepak Joshi', 'Father', '+91 9811122238');

-- 7. SUBJECTS
INSERT INTO subjects (id, course_id, name, code, semester, credits, description) VALUES
('sub11111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Database Management Systems', 'CS301', 3, 4, 'Relational model, SQL, normalization, transactions and indexing'),
('sub22222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Data Structures and Algorithms', 'CS302', 3, 4, 'Trees, graphs, dynamic programming, sorting and searching algorithms'),
('sub33333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Operating Systems', 'CS303', 3, 3, 'Process synchronization, memory management, virtual memory, scheduling'),
('sub44444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'Computer Networks', 'CS304', 3, 3, 'OSI model, TCP/IP, routing protocols, flow control and security');

-- 8. LEARNING RESOURCES
INSERT INTO learning_resources (id, subject_id, title, description, type, content_text, duration_minutes, is_active, created_by) VALUES
('lr111111-1111-1111-1111-111111111111', 'sub11111-1111-1111-1111-111111111111', 'DBMS Lecture Notes - Normalization (1NF to BCNF)', 'Comprehensive guide on database normalization including 1NF, 2NF, 3NF, and Boyce-Codd Normal Form with practical examples.', 'note', 'Normalization is the process of organizing data in a database to reduce data redundancy and improve data integrity. 1NF requires atomic values. 2NF removes partial functional dependencies on candidate keys. 3NF removes transitive functional dependencies. BCNF is a stricter version where for every X -> Y, X must be a super key.', 45, true, 'f1111111-1111-1111-1111-111111111111'),
('lr222222-2222-2222-2222-222222222222', 'sub11111-1111-1111-1111-111111111111', 'SQL Indexing and Query Optimization Handbook', 'In-depth guide covering B-tree indexes, hash indexing, explain analyze and cost-based query plan analysis.', 'pdf', 'An index is a data structure that improves the speed of data retrieval operations on a database table. B-trees keep data sorted and allow searches, sequential access, insertions, and deletions in logarithmic time.', 60, true, 'f1111111-1111-1111-1111-111111111111'),
('lr333333-3333-3333-3333-333333333333', 'sub11111-1111-1111-1111-111111111111', 'Video Lecture: ACID Properties and Concurrency Control', 'Video breakdown of Atomicity, Consistency, Isolation, and Durability with 2-Phase Locking examples.', 'video', 'https://www.youtube.com/watch?v=sample-acid', 35, true, 'f1111111-1111-1111-1111-111111111111'),
('lr444444-4444-4444-4444-444444444444', 'sub22222-2222-2222-2222-222222222222', 'Graph Algorithms Notes: BFS, DFS and Dijkstra', 'Complete study guide for breadth-first search, depth-first search and shortest path calculation.', 'note', 'Graph representation using adjacency matrices and lists. Dijkstra uses a priority queue for single-source shortest paths on non-negative weighted graphs in O((V + E) log V) time.', 50, true, 'f1111111-1111-1111-1111-111111111111');

-- 9. ASSIGNMENTS & QUIZZES
INSERT INTO assignments (id, resource_id, subject_id, title, description, max_marks, due_date, created_by) VALUES
('as111111-1111-1111-1111-111111111111', 'lr111111-1111-1111-1111-111111111111', 'sub11111-1111-1111-1111-111111111111', 'Assignment 1: Database Schema Normalization Exercise', 'Given a raw relational schema with candidate keys and functional dependencies, decompose it into 3NF and BCNF step by step.', 100, NOW() + INTERVAL '7 days', 'f1111111-1111-1111-1111-111111111111'),
('as222222-2222-2222-2222-222222222222', 'lr444444-4444-4444-4444-444444444444', 'sub22222-2222-2222-2222-222222222222', 'Assignment 2: Dijkstra Shortest Path Implementation', 'Implement Dijkstra algorithm in C++ or Python and test against the provided benchmark graph datasets.', 100, NOW() + INTERVAL '12 days', 'f1111111-1111-1111-1111-111111111111');

INSERT INTO quizzes (id, resource_id, subject_id, title, description, total_questions, total_marks, duration_minutes, questions, created_by) VALUES
('qz111111-1111-1111-1111-111111111111', 'lr111111-1111-1111-1111-111111111111', 'sub11111-1111-1111-1111-111111111111', 'DBMS Normalization & Relational Theory Quiz', 'Test your understanding of functional dependencies, keys, and 1NF through BCNF.', 5, 50, 20,
'[
  {"id": "q1", "question": "Which normal form requires eliminating partial functional dependencies on candidate keys?", "options": ["1NF", "2NF", "3NF", "BCNF"], "correct_index": 1, "explanation": "2NF mandates that all non-prime attributes are fully functionally dependent on every candidate key."},
  {"id": "q2", "question": "In 3NF, what kind of functional dependencies are prohibited for non-prime attributes?", "options": ["Trivial", "Transitive", "Multi-valued", "Partial"], "correct_index": 1, "explanation": "3NF requires that no non-prime attribute depends transitively on a candidate key."},
  {"id": "q3", "question": "For a relation to be in BCNF, for every functional dependency X -> Y:", "options": ["X must be a super key", "Y must be a super key", "X must be a prime attribute", "Y must be non-prime"], "correct_index": 0, "explanation": "BCNF requires that the determinant X is always a super key."},
  {"id": "q4", "question": "Which ACID property guarantees that all operations within a transaction either completely succeed or completely fail?", "options": ["Consistency", "Atomicity", "Isolation", "Durability"], "correct_index": 1, "explanation": "Atomicity ensures all-or-nothing execution of a transaction."},
  {"id": "q5", "question": "Which data structure is most commonly used for database indexes allowing efficient range queries?", "options": ["Hash Table", "Binary Search Tree", "B+ Tree", "Heap"], "correct_index": 2, "explanation": "B+ Trees store all keys in leaves linked sequentially, making range queries exceptionally fast."}
]'::jsonb, 'f1111111-1111-1111-1111-111111111111');

-- 10. ATTENDANCE RECORDS (Past 30 days for Priya Patel STU1024 - demonstrating decline)
DO $$
DECLARE
  dt DATE;
  s_id UUID := 's2222222-2222-2222-2222-222222222222';
  sub_id UUID := 'sub11111-1111-1111-1111-111111111111';
  fac_id UUID := 'f1111111-1111-1111-1111-111111111111';
BEGIN
  FOR i IN 1..30 LOOP
    dt := CURRENT_DATE - (30 - i);
    -- Skip weekends
    IF EXTRACT(DOW FROM dt) NOT IN (0, 6) THEN
      -- First 15 days: mostly present (85%)
      -- Last 15 days: mostly absent (declining to 60%)
      IF i <= 15 THEN
        INSERT INTO attendance_records (student_id, subject_id, date, is_present, recorded_by)
        VALUES (s_id, sub_id, dt, (i % 6 != 0), fac_id);
      ELSE
        INSERT INTO attendance_records (student_id, subject_id, date, is_present, recorded_by)
        VALUES (s_id, sub_id, dt, (i % 2 = 0), fac_id);
      END IF;
    END IF;
  END LOOP;
END $$;

-- 11. STUDENT INSIGHTS (Pre-computed for demo)
INSERT INTO student_insights (id, student_id, academic_level, attendance_level, financial_level, career_level, support_level, academic_trend, attendance_trend, engagement_trend, quiz_trend, assignment_trend, recent_changes, last_updated) VALUES
(
  'in111111-1111-1111-1111-111111111111',
  's2222222-2222-2222-2222-222222222222', -- Priya Patel (STU1024)
  'attention_required',
  'declining',
  'attention_required',
  'good',
  'good',
  '[{"date": "Aug", "value": 78}, {"date": "Sep", "value": 74}, {"date": "Oct", "value": 68}, {"date": "Nov", "value": 63}, {"date": "Dec", "value": 62}]'::jsonb,
  '[{"date": "Week 1", "value": 85}, {"date": "Week 2", "value": 82}, {"date": "Week 3", "value": 74}, {"date": "Week 4", "value": 69}]'::jsonb,
  '[{"date": "Week 1", "value": 80}, {"date": "Week 2", "value": 72}, {"date": "Week 3", "value": 60}, {"date": "Week 4", "value": 52}]'::jsonb,
  '[{"date": "Quiz 1", "value": 76}, {"date": "Quiz 2", "value": 68}, {"date": "Quiz 3", "value": 54}]'::jsonb,
  '[{"date": "Assign 1", "value": 85}, {"date": "Assign 2", "value": 70}, {"date": "Assign 3", "value": 50}]'::jsonb,
  '["Attendance has decreased from 82% to 69%", "Assignment completion has declined over the last 3 weeks", "Quiz performance has decreased in DBMS", "Learning activity on portal has reduced by 40%"]'::jsonb,
  NOW()
),
(
  'in222222-2222-2222-2222-222222222222',
  's1111111-1111-1111-1111-111111111111', -- Aarav Sharma (STU1021)
  'good',
  'good',
  'good',
  'good',
  'good',
  '[{"date": "Aug", "value": 84}, {"date": "Sep", "value": 86}, {"date": "Oct", "value": 88}, {"date": "Nov", "value": 90}]'::jsonb,
  '[{"date": "Week 1", "value": 92}, {"date": "Week 2", "value": 94}, {"date": "Week 3", "value": 91}, {"date": "Week 4", "value": 95}]'::jsonb,
  '[{"date": "Week 1", "value": 88}, {"date": "Week 2", "value": 90}, {"date": "Week 3", "value": 92}, {"date": "Week 4", "value": 94}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Consistently high attendance above 90%", "Completed all 3 recent assignments on time"]'::jsonb,
  NOW()
),
(
  'in333333-3333-3333-3333-333333333333',
  's5555555-5555-5555-5555-555555555555', -- Vikram Verma (STU1058)
  'critical',
  'critical',
  'attention_required',
  'declining',
  'attention_required',
  '[{"date": "Aug", "value": 60}, {"date": "Sep", "value": 55}, {"date": "Oct", "value": 51}, {"date": "Nov", "value": 48}]'::jsonb,
  '[{"date": "Week 1", "value": 65}, {"date": "Week 2", "value": 58}, {"date": "Week 3", "value": 52}, {"date": "Week 4", "value": 47}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Attendance has dropped below 50%", "4 active backlogs reported", "Has not submitted the last 2 assignments"]'::jsonb,
  NOW()
);

-- 12. PREDICTIONS (Internal ML model output)
INSERT INTO predictions (student_id, risk_score, risk_level, features_used) VALUES
('s1111111-1111-1111-1111-111111111111', 0.12, 'low', '{"gpa": 8.75, "attendance": 94, "backlogs": 0}'::jsonb),
('s2222222-2222-2222-2222-222222222222', 0.68, 'high', '{"gpa": 6.20, "attendance": 69, "backlogs": 2, "income": 180000}'::jsonb),
('s3333333-3333-3333-3333-333333333333', 0.44, 'medium', '{"gpa": 6.90, "attendance": 76, "backlogs": 1}'::jsonb),
('s4444444-4444-4444-4444-444444444444', 0.08, 'low', '{"gpa": 9.10, "attendance": 96, "backlogs": 0}'::jsonb),
('s5555555-5555-5555-5555-555555555555', 0.84, 'high', '{"gpa": 5.10, "attendance": 47, "backlogs": 4, "income": 150000}'::jsonb),
('s6666666-6666-6666-6666-666666666666', 0.15, 'low', '{"gpa": 8.40, "attendance": 91, "backlogs": 0}'::jsonb);

-- 13. SCHOLARSHIPS
INSERT INTO scholarships (name, provider, eligibility, benefits, deadline, required_documents, application_link, min_income, max_income, min_percentage) VALUES
(
  'Merit-cum-Means Post-Matric Scholarship',
  'Ministry of Minority Affairs / State Higher Education',
  'Students scoring >= 65% in qualifying examination with annual family income under ₹2,50,000.',
  '100% tuition fee waiver up to ₹70,000 per academic year plus maintenance allowance of ₹10,000.',
  CURRENT_DATE + INTERVAL '45 days',
  ARRAY['Income Certificate', 'Previous Year Marksheet', 'College ID Card', 'Bank Passbook Copy'],
  'https://scholarships.gov.in',
  0, 250000, 65.0
),
(
  'National Science & Engineering Merit Scholarship',
  'National Science Foundation',
  'Enrolled in technical/engineering degree with 12th score >= 80% and current GPA >= 7.5.',
  '₹50,000 annual scholarship for research, laptops, and technical course materials.',
  CURRENT_DATE + INTERVAL '60 days',
  ARRAY['12th Marksheet', 'College Bonafide Certificate', 'Research Interest Statement'],
  'https://scholarships.gov.in/science',
  0, 800000, 80.0
),
(
  'Pragati Scholarship Scheme for Girls',
  'AICTE (All India Council for Technical Education)',
  'Female students admitted to first or second year technical degree with family income <= ₹8,00,000.',
  '₹50,000 per annum towards college fee, books, equipment, and hostel expenses.',
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Income Certificate', 'Admission Letter', 'Aadhaar Card', 'Tuition Fee Receipt'],
  'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
  0, 800000, 60.0
);

-- 14. EDUCATIONAL LOANS
INSERT INTO educational_loans (name, provider, loan_info, eligibility, interest_rate, max_amount, important_conditions, application_link) VALUES
(
  'Vidya Lakshmi Education Loan',
  'State Bank of India / NSDL portal',
  'Comprehensive student loan covering tuition fees, examination, library, lab charges, and hostel expenses.',
  'Indian national admitted to higher education technical program through entrance examination.',
  8.65,
  1500000.00,
  'No collateral required for loans up to ₹7.5 Lakhs. Repayment begins 1 year after course completion.',
  'https://www.vidyalakshmi.co.in'
),
(
  'Pradhan Mantri Vidya Lakshmi Student Support Loan',
  'Canara Bank',
  'Subsidized interest rate education loan for undergraduate engineering and science students.',
  'Enrolled in AICTE/UGC approved technical institution with verified family income below ₹4.5 Lakhs for interest subsidy.',
  8.25,
  1000000.00,
  'Full interest subsidy during the moratorium period (course duration + 1 year) for eligible families.',
  'https://www.canarabank.com/education-loan'
);

-- 15. COUNSELLORS
INSERT INTO counsellors (name, specialization, email, mobile, availability, office_location) VALUES
(
  'Dr. Aruna Sharma, Ph.D.',
  'Student Wellness, Academic Stress & Anxiety Management',
  'wellness.counsellor@prismedu.com',
  '+91 9822334455',
  'Mon - Fri: 10:00 AM - 4:00 PM (In-person & Confidential Video Call)',
  'Student Welfare Centre, Block B, Room 204'
),
(
  'Prof. Rajesh Ramanathan',
  'Career Transitions, Motivation & Personal Mentorship',
  'mentorship@prismedu.com',
  '+91 9822334456',
  'Tue, Thu, Sat: 2:00 PM - 5:00 PM',
  'Academic Block C, Room 112'
);

-- 16. CAREER OPPORTUNITIES
INSERT INTO career_opportunities (type, title, organization, description, required_skills, application_link, deadline, relevant_courses) VALUES
(
  'internship',
  'Full Stack Software Engineering Intern',
  'ThoughtWorks Technologies',
  'Work with experienced agile engineers building cloud-native web applications using TypeScript, React, and Node.js.',
  ARRAY['JavaScript', 'TypeScript', 'React', 'Git', 'Data Structures'],
  'https://thoughtworks.com/careers',
  CURRENT_DATE + INTERVAL '25 days',
  ARRAY['BTECH-CSE', 'BTECH-IT']
),
(
  'job',
  'Junior Backend Developer',
  'Persistent Systems',
  'Design and implement REST APIs, microservices, and database schemas with relational and NoSQL databases.',
  ARRAY['Python', 'SQL', 'PostgreSQL', 'FastAPI', 'Docker'],
  'https://persistentsystems.com/careers',
  CURRENT_DATE + INTERVAL '40 days',
  ARRAY['BTECH-CSE', 'BTECH-IT']
),
(
  'certification',
  'AWS Certified Cloud Practitioner (Academic Track)',
  'Amazon Web Services (AWS)',
  'Foundational understanding of AWS cloud services, architecture, security, and pricing with subsidized institutional exam vouchers.',
  ARRAY['Cloud Computing', 'AWS', 'Security', 'Networking'],
  'https://aws.amazon.com/certification/certified-cloud-practitioner',
  CURRENT_DATE + INTERVAL '90 days',
  ARRAY['BTECH-CSE', 'BTECH-IT']
),
(
  'skill_resource',
  'Database Internals & Advanced Normalization Masterclass',
  'PRISM Academic Career Cell',
  'Curated deep-dive into database storage engines, B+ Trees, WAL, and enterprise normalization patterns.',
  ARRAY['SQL', 'DBMS', 'Normalization', 'Indexing'],
  'https://prismedu.internal/masterclasses/dbms',
  NULL,
  ARRAY['BTECH-CSE', 'BTECH-IT']
);

-- 17. INTERVENTIONS (Sample for demo)
INSERT INTO interventions (id, student_id, faculty_id, type, description, status, follow_up_date, outcome) VALUES
(
  'iv111111-1111-1111-1111-111111111111',
  's2222222-2222-2222-2222-222222222222', -- Priya Patel
  'f1111111-1111-1111-1111-111111111111', -- Dr. Sarah Mitchell
  'academic',
  'Scheduled 1-on-1 tutoring on DBMS Normalization concepts. Provided structured practice worksheets.',
  'in_progress',
  CURRENT_DATE + INTERVAL '5 days',
  'Student attended first session, completed 2 practice problems with good progress.'
),
(
  'iv222222-2222-2222-2222-222222222222',
  's2222222-2222-2222-2222-222222222222',
  'f1111111-1111-1111-1111-111111111111',
  'financial',
  'Guided student to apply for the Merit-cum-Means Scholarship. Verified necessary documents with student affairs cell.',
  'pending',
  CURRENT_DATE + INTERVAL '10 days',
  NULL
);

-- 18. NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type, is_read, action_url) VALUES
('u2222222-0000-0000-0000-000000000002', 'Academic Mentorship Session Scheduled', 'Dr. Sarah Mitchell has scheduled a follow-up review for DBMS on Friday.', 'intervention', false, '/student/support'),
('u2222222-0000-0000-0000-000000000002', 'Scholarship Deadline Approaching', 'Merit-cum-Means Post-Matric Scholarship application closes in 45 days. Review requirements today.', 'financial', false, '/student/financial'),
('u2222222-0000-0000-0000-000000000002', 'New Assignment Available', 'Assignment 1: Database Schema Normalization Exercise is due in 7 days.', 'learning', false, '/student/learning'),
('u1111111-0000-0000-0000-000000000001', 'Student Requires Attention', 'Priya Patel (STU1024) attendance declined to 69%. Academic indicators suggest intervention.', 'alert', false, '/faculty/students/s2222222-2222-2222-2222-222222222222');
