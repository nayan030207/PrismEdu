import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from prediction.features import PredictionFeatures, features_to_array, extract_features
from prediction.model import RiskPredictor

def test_features_to_array_length():
    feats = PredictionFeatures()
    arr = features_to_array(feats)
    assert len(arr) == 12, f"Expected 12 features, got {len(arr)}"
    print("✓ test_features_to_array_length passed")

def test_heuristic_low_risk():
    predictor = RiskPredictor()
    predictor.load("heuristic_v1.0")

    # High performing student: 90% in 10th/12th, 9.0 GPA, 0 backlogs, 95% attendance, high quiz scores
    high_perf = [0.90, 0.90, 0.90, 0.0, 0.5, 0.0, 0.95, 0.90, 0.95, 0.8, 0.0, 0.90]
    res = predictor.predict(high_perf)
    assert res["risk_level"] == "low", f"Expected low risk, got {res['risk_level']}"
    assert res["risk_score"] < 0.35, f"Expected score < 0.35, got {res['risk_score']}"
    print("✓ test_heuristic_low_risk passed")

def test_heuristic_high_risk():
    predictor = RiskPredictor()
    predictor.load("heuristic_v1.0")

    # High risk student: 50% in 10th/12th, 4.8 GPA, 3 backlogs, 50% attendance, financial need
    at_risk = [0.45, 0.48, 0.48, 0.3, 0.05, 1.0, 0.50, 0.40, 0.30, 0.1, 0.8, 0.2]
    res = predictor.predict(at_risk)
    assert res["risk_level"] in ("medium", "high"), f"Expected medium/high risk, got {res['risk_level']}"
    assert res["risk_score"] >= 0.35, f"Expected score >= 0.35, got {res['risk_score']}"
    print("✓ test_heuristic_high_risk passed")

def test_extract_features_defaults():
    student_data = {
        "tenth_percentage": 82.5,
        "twelfth_percentage": 80.0,
        "previous_gpa": 7.8,
        "previous_backlogs": 0,
        "family_income": 400000,
        "financial_assistance": "not_required"
    }
    activity = {
        "attendance_rate": 88.0,
        "avg_quiz_score": 82.0,
        "assignment_completion_rate": 0.9,
        "learning_frequency": 4.0,
        "inactive_days": 2,
        "engagement_score": 0.85
    }
    extracted = extract_features(student_data, activity)
    assert extracted.tenth_percentage == 82.5
    assert extracted.attendance_rate == 88.0
    print("✓ test_extract_features_defaults passed")

if __name__ == "__main__":
    test_features_to_array_length()
    test_heuristic_low_risk()
    test_heuristic_high_risk()
    test_extract_features_defaults()
    print("All ML service tests passed successfully!")
