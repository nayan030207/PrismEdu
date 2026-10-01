import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

const DEMO_SUBJECTS = [
  {
    id: 'sub11111-1111-1111-1111-111111111111',
    name: 'Database Management Systems',
    code: 'CS301',
    semester: 3,
    credits: 4,
    completedResources: 3,
    totalResources: 5,
    progress: 60,
    resources: {
      notes: [
        {
          id: 'lr111111-1111-1111-1111-111111111111',
          title: 'DBMS Lecture Notes - Normalization (1NF to BCNF)',
          description: 'Detailed analysis of functional dependencies, partial dependencies, and Boyce-Codd normal form.',
          duration_minutes: 45,
          completed: true,
          content: `Normalization is the process of organizing data in a database to reduce data redundancy and improve data integrity.

1. First Normal Form (1NF):
- Each column must contain atomic (indivisible) values.
- Each record needs to be unique (primary key).

2. Second Normal Form (2NF):
- Table must be in 1NF.
- All non-key attributes must be fully functionally dependent on the entire primary key. No partial dependencies on candidate keys allowed!

3. Third Normal Form (3NF):
- Table must be in 2NF.
- There must be no transitive functional dependency of non-prime attributes on candidate keys (if X -> Y and Y -> Z, then X -> Z is transitive).

4. Boyce-Codd Normal Form (BCNF):
- Strict version of 3NF.
- For every non-trivial functional dependency X -> Y, X must be a super key.`,
        },
      ],
      pdfs: [
        {
          id: 'lr222222-2222-2222-2222-222222222222',
          title: 'SQL Indexing & Cost-Based Query Optimization Handbook',
          description: 'B-tree index architectures, covering indexes, and execution plan cost evaluation.',
          duration_minutes: 60,
          completed: true,
          content: 'Indexes allow rapid logarithmic lookups across large relations without full-table sequential scans. B+ trees maintain sorted leaf nodes linked as a doubly-linked list for ultra-fast range queries.',
        },
      ],
      videos: [
        {
          id: 'lr333333-3333-3333-3333-333333333333',
          title: 'Video Lecture: ACID Properties and Concurrency Control',
          description: 'Atomicity, consistency, isolation, durability, and 2-phase locking protocol.',
          duration_minutes: 35,
          completed: false,
          video_url: 'https://www.youtube.com/watch?v=sample-acid',
        },
      ],
      assignments: [
        {
          id: 'as111111-1111-1111-1111-111111111111',
          title: 'Assignment 1: Relational Schema Normalization Exercise',
          description: 'Decompose relation R(A, B, C, D, E) with FDs AB -> C, C -> D, D -> E into 3NF and BCNF step by step.',
          max_marks: 100,
          due_date: '2026-09-24',
          submitted: false,
        },
      ],
      quizzes: [
        {
          id: 'qz111111-1111-1111-1111-111111111111',
          title: 'DBMS Normalization & Relational Theory Quiz',
          description: '5 questions covering functional dependencies, keys, and 1NF through BCNF.',
          total_questions: 5,
          total_marks: 50,
          duration_minutes: 20,
          completed: false,
          score: null,
          questions: [
            {
              id: 'q1',
              question: 'Which normal form requires eliminating partial functional dependencies on composite candidate keys?',
              options: ['1NF', '2NF', '3NF', 'BCNF'],
              correct_index: 1,
              explanation: '2NF mandates that all non-prime attributes are fully functionally dependent on every candidate key.',
            },
            {
              id: 'q2',
              question: 'In 3NF, what kind of functional dependencies are prohibited for non-prime attributes?',
              options: ['Trivial', 'Transitive', 'Multi-valued', 'Partial'],
              correct_index: 1,
              explanation: '3NF requires that no non-prime attribute depends transitively on a candidate key.',
            },
            {
              id: 'q3',
              question: 'For a relation to be in BCNF, for every non-trivial functional dependency X -> Y:',
              options: ['X must be a super key', 'Y must be a super key', 'X must be a prime attribute', 'Y must be non-prime'],
              correct_index: 0,
              explanation: 'BCNF requires that the determinant X is always a super key.',
            },
            {
              id: 'q4',
              question: 'Which ACID property guarantees that all operations within a transaction either completely succeed or completely fail?',
              options: ['Consistency', 'Atomicity', 'Isolation', 'Durability'],
              correct_index: 1,
              explanation: 'Atomicity ensures all-or-nothing execution of transactions.',
            },
            {
              id: 'q5',
              question: 'Which data structure is most commonly used for database indexes allowing efficient range scans?',
              options: ['Hash Table', 'Binary Search Tree', 'B+ Tree', 'Heap'],
              correct_index: 2,
              explanation: 'B+ Trees store all keys in leaves linked sequentially, making range queries exceptionally fast.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'sub22222-2222-2222-2222-222222222222',
    name: 'Data Structures and Algorithms',
    code: 'CS302',
    semester: 3,
    credits: 4,
    completedResources: 2,
    totalResources: 3,
    progress: 66,
    resources: {
      notes: [
        {
          id: 'lr444444-4444-4444-4444-444444444444',
          title: 'Graph Algorithms: BFS, DFS and Dijkstra Shortest Path',
          description: 'Graph representations, breadth-first traversal, depth-first traversal, and Dijkstra algorithm.',
          duration_minutes: 50,
          completed: true,
          content: 'Dijkstra solves the single-source shortest path problem on graphs with non-negative edge weights using a priority queue in O((V + E) log V) time.',
        },
      ],
      pdfs: [],
      videos: [],
      assignments: [
        {
          id: 'as222222-2222-2222-2222-222222222222',
          title: 'Assignment 2: Dijkstra Shortest Path Implementation',
          description: 'Implement Dijkstra algorithm in Python or C++ and test on provided benchmark graph datasets.',
          max_marks: 100,
          due_date: '2026-09-28',
          submitted: false,
        },
      ],
      quizzes: [],
    },
  },
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ subjects: DEMO_SUBJECTS });
}
