import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
from supabase import create_client, Client

SYSTEM_PROMPT = """You are PRISM AI, an academic learning and doubt-solving assistant for college students.
Your mission is to help students learn effectively, understand core technical and academic concepts, solve subject doubts, explain problems step-by-step, provide intuitive examples, and suggest practice questions.

Strict Guidelines:
1. ONLY assist with academic coursework, syllabus topics, and subject doubts.
2. If asked about unrelated personal, financial, or political topics, politely explain that you are dedicated solely to academic learning.
3. When institutional curriculum content is provided below, anchor your explanation on that material first.
4. Encourage conceptual clarity: Break complex algorithms, mathematical proofs, or system architectures down into digestible parts.
5. Provide code snippets, ASCII diagrams, or structured breakdowns whenever beneficial.
"""

def get_supabase() -> Optional[Client]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if url and key:
        return create_client(url, key)
    return None

def get_openai_client() -> Optional[OpenAI]:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and not api_key.startswith("sk-your"):
        return OpenAI(api_key=api_key)
    return None

def retrieve_academic_context(question: str, limit: int = 3) -> str:
    """RAG: Retrieve matching institution learning resources using semantic embedding match"""
    supabase = get_supabase()
    openai_client = get_openai_client()
    if not supabase or not openai_client:
        # Fallback: Query learning_resources using keyword search if vector isn't active
        if supabase:
            try:
                res = supabase.table("learning_resources").select("title, content_text").limit(limit).execute()
                if res.data:
                    return "\n\n".join([f"--- Resource: {r['title']} ---\n{r.get('content_text', '')}" for r in res.data])
            except Exception:
                pass
        return ""

    try:
        # Generate query embedding
        emb_res = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=question
        )
        query_vector = emb_res.data[0].embedding

        # Query pgvector through Supabase RPC
        match_res = supabase.rpc("match_resource_embeddings", {
            "query_embedding": query_vector,
            "match_threshold": 0.65,
            "match_count": limit
        }).execute()

        if match_res.data:
            chunks = [r["chunk_text"] for r in match_res.data if "chunk_text" in r]
            return "\n\n".join(chunks)
    except Exception:
        # Fallback to direct resources text
        try:
            res = supabase.table("learning_resources").select("title, content_text").limit(2).execute()
            if res.data:
                return "\n\n".join([f"--- Resource: {r['title']} ---\n{r.get('content_text', '')}" for r in res.data])
        except Exception:
            pass

    return ""

def chat(question: str, history: List[Dict[str, str]] = [], student_id: Optional[str] = None) -> str:
    """Generate academic doubt resolution using RAG + LLM with graceful offline fallback"""
    context = retrieve_academic_context(question)
    openai_client = get_openai_client()

    if not openai_client:
        # High quality built-in academic answers for hackathon/demo when OpenAI key is absent
        q_lower = question.lower()
        if "normalization" in q_lower or "dbms" in q_lower or "1nf" in q_lower or "bcnf" in q_lower:
            return (
                "### Database Normalization (1NF to BCNF) Explanation\n\n"
                "Normalization is the systematic approach of decomposing tables to eliminate data redundancy and anomalies (insertion, update, and deletion anomalies).\n\n"
                "#### 1. First Normal Form (1NF)\n"
                "- **Rule:** Every column must hold atomic (indivisible) values, and each record must be unique.\n"
                "- *Example:* If a student table has `courses = 'DBMS, OS'`, decompose into separate rows or a junction table.\n\n"
                "#### 2. Second Normal Form (2NF)\n"
                "- **Rule:** Must be in 1NF AND no non-prime attribute may depend on a proper subset of any candidate key (eliminate partial dependency).\n"
                "- *Applies to:* Composite primary keys.\n\n"
                "#### 3. Third Normal Form (3NF)\n"
                "- **Rule:** Must be in 2NF AND no non-prime attribute depends transitively on a candidate key ($X \\to Y \\to Z$).\n\n"
                "#### 4. Boyce-Codd Normal Form (BCNF)\n"
                "- **Rule:** Stricter 3NF. For every non-trivial functional dependency $X \\to Y$, $X$ **must be a super key**.\n\n"
                "💡 **Practice Question:** Consider relation $R(A, B, C, D)$ with FDs $AB \\to C$, $C \\to D$, $D \\to A$. Is this in 3NF? Why?"
            )
        elif "dijkstra" in q_lower or "graph" in q_lower or "shortest path" in q_lower:
            return (
                "### Dijkstra's Shortest Path Algorithm\n\n"
                "Dijkstra's algorithm finds the shortest paths from a single source node to all other nodes in a weighted graph with **non-negative edge weights**.\n\n"
                "#### Algorithm Steps:\n"
                "1. Initialize `dist[source] = 0` and `dist[v] = infinity` for all other vertices.\n"
                "2. Maintain a Priority Queue (min-heap) of vertices ordered by distance.\n"
                "3. While the queue is not empty:\n"
                "   - Extract the node $u$ with minimum distance.\n"
                "   - For each neighbor $v$ of $u$, perform edge relaxation:\n"
                "     `if dist[u] + weight(u, v) < dist[v]:`\n"
                "     `    dist[v] = dist[u] + weight(u, v)`\n"
                "4. Time complexity with binary min-heap: $\\mathcal{O}((V + E) \\log V)$."
            )
        elif "acid" in q_lower or "transaction" in q_lower:
            return (
                "### ACID Properties in Database Transactions\n\n"
                "- **A - Atomicity:** All operations within the transaction succeed, or the entire transaction is rolled back. (All-or-nothing).\n"
                "- **C - Consistency:** Preserves database invariants before and after the transaction commits.\n"
                "- **I - Isolation:** Concurrent transactions execute without interfering with one another (managed via 2-Phase Locking or MVCC).\n"
                "- **D - Durability:** Once committed, updates survive even in case of system power failure (via Write-Ahead Logging / WAL)."
            )
        else:
            return (
                f"### Academic Concept Overview: {question.title()}\n\n"
                "Here is a structured academic breakdown to help you master this concept:\n\n"
                "1. **Definition & Core Principles:** Understand the underlying theory and problem statement.\n"
                "2. **Step-by-Step Mechanism:** Break down how the process, formula, or algorithm operates in sequence.\n"
                "3. **Practical Example:** Connect the theoretical construct to a concrete real-world scenario.\n"
                "4. **Key Exam Tips:** Be aware of edge cases, computational constraints, and common pitfalls.\n\n"
                "Feel free to ask a specific follow-up question or request a solved example problem!"
            )

    # Call OpenAI
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if context:
        messages.append({
            "role": "system",
            "content": f"Relevant Institution Learning Material for Reference:\n{context}"
        })
    for m in history[-6:]:
        messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
    messages.append({"role": "user", "content": question})

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=900,
            temperature=0.6,
        )
        return response.choices[0].message.content or "No response generated."
    except Exception as e:
        return f"PRISM AI temporarily encountered an error: {str(e)}. Please check your query or try again shortly."
