from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from ai.learning_agent import chat as learning_chat
from ai.support_agent import chat as support_agent_chat

router = APIRouter(prefix="/ai", tags=["AI Agents"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    student_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    response: str
    agent_type: str

@router.post("/learning-chat", response_model=ChatResponse)
async def academic_learning_chat(req: ChatRequest):
    """
    AI Learning Agent endpoint specifically for academic learning and doubt solving.
    Uses RAG architecture backed by institutional learning materials.
    """
    try:
        history_list = [{"role": m.role, "content": m.content} for m in req.history]
        answer = learning_chat(
            question=req.message,
            history=history_list,
            student_id=req.student_id
        )
        return ChatResponse(
            success=True,
            response=answer,
            agent_type="academic_learning"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Academic agent failed: {str(e)}")

@router.post("/support-chat", response_model=ChatResponse)
async def personal_support_chat(req: ChatRequest):
    """
    AI Support Agent endpoint for basic supportive guidance and institutional resource connection.
    Connects students to professional on-campus counsellors.
    """
    try:
        history_list = [{"role": m.role, "content": m.content} for m in req.history]
        answer = support_agent_chat(
            question=req.message,
            history=history_list,
            student_id=req.student_id
        )
        return ChatResponse(
            success=True,
            response=answer,
            agent_type="institutional_support"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Support agent failed: {str(e)}")
