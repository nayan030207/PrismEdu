from dataclasses import dataclass
from typing import Optional, Union


@dataclass
class PredictionFeatures:
    tenth_percentage: float = 0.0
    twelfth_percentage: float = 0.0
    previous_gpa: float = 0.0
    previous_backlogs: int = 0
    family_income: float = 0.0
    financial_assistance: Union[str, float] = "not_required"  # encoded to float during array conversion
    attendance_rate: float = 100.0
    avg_quiz_score: float = 100.0
    assignment_completion_rate: float = 1.0
    learning_frequency: float = 1.0  # sessions per week
    inactive_days: int = 0
    engagement_score: float = 1.0


def extract_features(student_data: dict, activity_summary: dict) -> PredictionFeatures:
    """Extract and normalise features from student profile + activity summary data."""
    # Map financial_assistance string labels to numeric values
    fa_map: dict[str, float] = {
        "required": 1.0,
        "partial": 0.5,
        "not_required": 0.0,
    }

    return PredictionFeatures(
        tenth_percentage=float(student_data.get("tenth_percentage", 75.0) or 75.0),
        twelfth_percentage=float(student_data.get("twelfth_percentage", 75.0) or 75.0),
        previous_gpa=float(student_data.get("previous_gpa", 7.0) or 7.0),
        previous_backlogs=int(student_data.get("previous_backlogs", 0) or 0),
        family_income=min(float(student_data.get("family_income", 500_000) or 500_000), 2_000_000),
        financial_assistance=fa_map.get(
            student_data.get("financial_assistance", "not_required"), 0.0
        ),
        attendance_rate=float(activity_summary.get("attendance_rate", 100.0)),
        avg_quiz_score=float(activity_summary.get("avg_quiz_score", 80.0)),
        assignment_completion_rate=float(activity_summary.get("assignment_completion_rate", 1.0)),
        learning_frequency=float(activity_summary.get("learning_frequency", 3.0)),
        inactive_days=int(activity_summary.get("inactive_days", 0)),
        engagement_score=float(activity_summary.get("engagement_score", 0.8)),
    )


def features_to_array(f: PredictionFeatures) -> list[float]:
    """
    Convert a PredictionFeatures dataclass to a normalised float list ready for
    the ML model.  All values are scaled to the [0, 1] range.

    Index mapping (12 features total):
        0  – tenth_percentage   / 100
        1  – twelfth_percentage / 100
        2  – previous_gpa       / 10
        3  – previous_backlogs  / 10 (capped at 1)
        4  – family_income      / 2_000_000 (capped at 1)
        5  – financial_assistance (already float 0/0.5/1)
        6  – attendance_rate    / 100
        7  – avg_quiz_score     / 100
        8  – assignment_completion_rate (already 0–1)
        9  – learning_frequency / 7 (capped at 1, i.e. daily)
        10 – inactive_days      / 30 (capped at 1)
        11 – engagement_score   (already 0–1)
    """
    fin_assist: float = (
        f.financial_assistance
        if isinstance(f.financial_assistance, float)
        else 0.0
    )

    return [
        f.tenth_percentage / 100.0,
        f.twelfth_percentage / 100.0,
        f.previous_gpa / 10.0,
        min(f.previous_backlogs / 10.0, 1.0),
        min(f.family_income / 2_000_000.0, 1.0),
        fin_assist,
        f.attendance_rate / 100.0,
        f.avg_quiz_score / 100.0,
        f.assignment_completion_rate,
        min(f.learning_frequency / 7.0, 1.0),
        min(f.inactive_days / 30.0, 1.0),
        f.engagement_score,
    ]
