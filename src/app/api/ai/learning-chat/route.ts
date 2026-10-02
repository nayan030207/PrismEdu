import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { generateOpenAIChatCompletion } from '@/lib/services/openai.service';
import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const SYSTEM_PROMPT = `You are PRISM Academic AI Tutor, an intelligent, empathetic academic assistant for university computer science and engineering students. 
Your primary goal is to help students understand complex academic concepts, solve doubts, guide homework/assignment logic, and provide practice exam problems.

Guidelines:
- Provide clear, structured, step-by-step explanations.
- Use Markdown formatting: headings, bullet points, bold key terms, code blocks with language tags, and LaTeX math formatting ($...$ or $$...$$) where applicable.
- Keep responses encouraging, academic, clear, and focused.
- If asked code questions, write clean, well-commented code blocks.`;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // 1. Detect academic topic for privacy-preserving metadata analytics
    const lower = message.toLowerCase();
    let detectedTopic = 'General Academic Query';
    if (lower.includes('normalization') || lower.includes('1nf') || lower.includes('bcnf') || lower.includes('dbms')) {
      detectedTopic = 'DBMS → Normalization';
    } else if (lower.includes('dijkstra') || lower.includes('graph') || lower.includes('shortest path')) {
      detectedTopic = 'DSA → Graph Algorithms';
    } else if (lower.includes('acid') || lower.includes('transaction')) {
      detectedTopic = 'DBMS → Transactions & Concurrency';
    } else if (lower.includes('paging') || lower.includes('virtual memory') || lower.includes('deadlock')) {
      detectedTopic = 'Operating Systems → Memory Management';
    }

    // 2. Track activity telemetry (topic metadata ONLY)
    await activityService.recordEvent({
      student_id: session.entityId,
      event_type: 'AI_LEARNING_INTERACTION',
      event_data: {
        topic: detectedTopic,
        timestamp: new Date().toISOString(),
      },
    });

    // 3. Log high-level aggregate topic metadata into ai_conversations if Supabase configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');
    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        await supabase.from('ai_conversations').insert({
          student_id: session.entityId,
          agent_type: 'learning',
          topics: [detectedTopic],
          interaction_count: 1,
          metadata: { topic: detectedTopic },
        });
      } catch {
        // silent fail
      }
    }

    // 4. Primary AI Engine: Direct OpenAI API Integration
    const openAIResult = await generateOpenAIChatCompletion({
      systemPrompt: SYSTEM_PROMPT,
      message,
      history: history || [],
      model: 'gpt-4o-mini',
      temperature: 0.7,
    });

    if (openAIResult.success && openAIResult.content) {
      return NextResponse.json({
        response: openAIResult.content,
        topic: detectedTopic,
        engine: 'OpenAI GPT-4o-mini',
      });
    }

    // Determine specific reason for falling back
    const engineLabel = openAIResult.isQuotaError
      ? 'PRISM Engine (OpenAI Quota Exhausted)'
      : 'PRISM Knowledge Base';

    // 5. Fallback 1: Python FastAPI ML RAG service
    try {
      const mlResponse = await axios.post(
        `${ML_SERVICE_URL}/ai/learning-chat`,
        {
          message,
          history: history || [],
          student_id: session.entityId,
        },
        { timeout: 8000 }
      );

      if (mlResponse.data && mlResponse.data.response) {
        return NextResponse.json({
          response: mlResponse.data.response,
          topic: detectedTopic,
          engine: 'PRISM RAG Engine',
        });
      }
    } catch {
      // Fall through to resilient built-in curriculum answer
    }

    // 6. Fallback 2: Intelligent Curriculum Doubt Engine
    if (lower.includes('normalization') || lower.includes('dbms') || lower.includes('1nf') || lower.includes('bcnf')) {
      return NextResponse.json({
        response: `### Database Normalization (1NF to BCNF) Explanation\n\nNormalization is the systematic approach of decomposing tables to eliminate data redundancy and anomalies (insertion, update, and deletion anomalies).\n\n#### 1. First Normal Form (1NF)\n- **Rule:** Every column must hold atomic (indivisible) values, and each record must be unique.\n- *Example:* If a student table has \`courses = 'DBMS, OS'\`, decompose into separate rows or a junction table.\n\n#### 2. Second Normal Form (2NF)\n- **Rule:** Must be in 1NF AND no non-prime attribute may depend on a proper subset of any candidate key (eliminate partial dependency).\n- *Applies to:* Composite primary keys.\n\n#### 3. Third Normal Form (3NF)\n- **Rule:** Must be in 2NF AND no non-prime attribute depends transitively on a candidate key ($X \\to Y \\to Z$).\n\n#### 4. Boyce-Codd Normal Form (BCNF)\n- **Rule:** Stricter 3NF. For every non-trivial functional dependency $X \\to Y$, $X$ **must be a super key**.\n\n💡 **Practice Question:** Consider relation $R(A, B, C, D)$ with FDs $AB \\to C$, $C \\to D$, $D \\to A$. Is this in 3NF? Why?`,
        topic: detectedTopic,
        engine: engineLabel,
        errorNotice: openAIResult.error,
      });
    }

    if (lower.includes('dijkstra') || lower.includes('shortest path')) {
      return NextResponse.json({
        response: `### Dijkstra's Algorithm Concept Breakdown\n\nDijkstra's algorithm computes the shortest path from a single source vertex to all other vertices in a directed or undirected graph with **non-negative weights**.\n\n#### Core Mechanism:\n1. Maintain a min-priority queue of unvisited vertices sorted by tentative distance.\n2. Iteratively extract the vertex $u$ with minimum distance.\n3. Relax adjacent edges: \`if dist[u] + weight(u, v) < dist[v] then dist[v] = dist[u] + weight(u, v)\`.\n4. Complexity: $\\mathcal{O}((V + E) \\log V)$ using an adjacency list and binary heap.`,
        topic: detectedTopic,
        engine: engineLabel,
        errorNotice: openAIResult.error,
      });
    }

    return NextResponse.json({
      response: `### Academic Concept Breakdown: ${message}\n\nHere is a structured academic overview from your course materials:\n\n1. **Fundamental Definition:** Understand the theoretical framework and foundational terminology.\n2. **Step-by-step Analysis:** Break down how the mechanism operates mathematically or architecturally.\n3. **Practical Example:** Review how this principle applies to real-world software and engineering problems.\n4. **Recommended Next Steps:** Review the lecture notes and attempt the self-assessment quiz in the Learning tab.`,
      topic: detectedTopic,
      engine: engineLabel,
      errorNotice: openAIResult.error,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Learning agent error' }, { status: 500 });
  }
}
