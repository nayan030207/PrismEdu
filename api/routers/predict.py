from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from prediction.features import extract_features, features_to_array, PredictionFeatures
from prediction.model import predictor
from analytics.engine import AnalyticsEngine

router = APIRouter(tags=["Predictions & Analytics"])
engine = AnalyticsEngine()

class PredictRequest(BaseModel):
    student_id: str
    admission_data: Dict[str, Any] = Field(default_factory=dict)
    activity_summary: Optional[Dict[str, Any]] = None

class PredictResponse(BaseModel):
    success: bool
    risk_score: float
    risk_level: str
    model_version: str
    features: Dict[str, Any]

@router.post("/predict", response_model=PredictResponse)
async def predict_student_risk(req: PredictRequest):
    """
    Predict dropout risk using admission factors and platform activity.
    Internal background prediction engine: never shown directly as a dropout probability to students.
    """
    try:
        activity = req.activity_summary
        if activity is None:
            activity = engine.compute_student_features(req.student_id)

        features: PredictionFeatures = extract_features(req.admission_data, activity)
        feature_array = features_to_array(features)
        prediction_result = predictor.predict(feature_array)

        return PredictResponse(
            success=True,
            risk_score=prediction_result["risk_score"],
            risk_level=prediction_result["risk_level"],
            model_version=prediction_result["model_version"],
            features=features.__dict__
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction evaluation failed: {str(e)}")

@router.post("/analytics/compute/{student_id}")
async def compute_student_analytics(student_id: str):
    """
    Compute continuous activity-based derived features and update student_insights in database.
    Surfaces actionable indicators (Academic, Attendance, Financial, Career) to faculty.
    """
    try:
        insights = engine.update_student_insights(student_id)
        return {
            "success": True,
            "student_id": student_id,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics computation failed: {str(e)}")
