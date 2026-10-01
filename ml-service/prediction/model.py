import os
import joblib
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

MODEL_DIR: str = os.getenv("MODEL_PATH", "./models")

# ---------------------------------------------------------------------------
# Feature index constants (matches features_to_array output order)
# ---------------------------------------------------------------------------
IDX_TENTH = 0
IDX_TWELFTH = 1
IDX_GPA = 2
IDX_BACKLOGS = 3
IDX_INCOME = 4
IDX_FIN_ASSIST = 5
IDX_ATTENDANCE = 6
IDX_QUIZ_AVG = 7
IDX_ASSIGN_RATE = 8
IDX_LEARN_FREQ = 9
IDX_INACTIVE = 10
IDX_ENGAGEMENT = 11


class RiskPredictor:
    """
    Singleton risk predictor.  Loads a trained scikit-learn Pipeline from disk
    when available; otherwise falls back to a rule-based heuristic so the API
    remains functional before the first training run.
    """

    def __init__(self) -> None:
        self.model: Pipeline | None = None
        self.version: str | None = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def load(self, version: str = "latest") -> None:
        """
        Load a saved model from MODEL_DIR/model_{version}.joblib.
        Falls back to the built-in heuristic if the file does not exist.
        """
        path = os.path.join(MODEL_DIR, f"model_{version}.joblib")
        if os.path.exists(path):
            self.model = joblib.load(path)
            self.version = version
        else:
            # No trained model on disk – rely on rule-based heuristic
            self.model = None
            self.version = "heuristic_v1.0"

    def predict(self, features: list[float]) -> dict:
        """
        Return dropout probability, risk level, and the model version used.

        Risk thresholds:
            ≥ 0.65  → high
            ≥ 0.35  → medium
            <  0.35 → low
        """
        if self.model is not None:
            X = np.array(features, dtype=np.float64).reshape(1, -1)
            prob: float = float(self.model.predict_proba(X)[0][1])
        else:
            prob = self._heuristic_predict(features)

        risk_level = (
            "high" if prob >= 0.65
            else ("medium" if prob >= 0.35 else "low")
        )

        return {
            "risk_score": round(prob, 4),
            "risk_level": risk_level,
            "model_version": self.version,
        }

    # ------------------------------------------------------------------
    # Heuristic fallback
    # ------------------------------------------------------------------

    def _heuristic_predict(self, features: list[float]) -> float:
        """
        Rule-based dropout risk estimation.  Each rule contributes a fixed
        additive weight; the sum is capped at 0.99.

        Feature vector order (all values normalised to [0, 1]):
            [tenth, twelfth, gpa, backlogs, income, fin_assist,
             attendance, quiz_avg, assign_rate, learn_freq, inactive, engagement]
        """
        tenth       = features[IDX_TENTH]
        twelfth     = features[IDX_TWELFTH]
        gpa         = features[IDX_GPA]
        backlogs    = features[IDX_BACKLOGS]
        income      = features[IDX_INCOME]
        fin_assist  = features[IDX_FIN_ASSIST]
        attendance  = features[IDX_ATTENDANCE]
        quiz_avg    = features[IDX_QUIZ_AVG]
        assign_rate = features[IDX_ASSIGN_RATE]
        learn_freq  = features[IDX_LEARN_FREQ]
        inactive    = features[IDX_INACTIVE]
        engagement  = features[IDX_ENGAGEMENT]

        risk = 0.0

        # --- Academic factors ---
        if tenth < 0.50:        risk += 0.15
        if twelfth < 0.50:      risk += 0.15
        if gpa < 0.55:          risk += 0.20   # GPA < 5.5 / 10
        if backlogs > 0.10:     risk += 0.15   # > 1 backlog

        # --- Financial factors ---
        if fin_assist >= 0.50:  risk += 0.10   # partial or full financial aid
        if income < 0.10:       risk += 0.10   # very low income bracket

        # --- Engagement / behavioural factors ---
        if attendance < 0.75:   risk += 0.20
        if assign_rate < 0.50:  risk += 0.15
        if quiz_avg < 0.50:     risk += 0.10
        if inactive > 0.33:     risk += 0.15   # > ~10 inactive days out of 30
        if engagement < 0.40:   risk += 0.15

        return min(risk, 0.99)


# ---------------------------------------------------------------------------
# Module-level singleton used by the FastAPI app
# ---------------------------------------------------------------------------
predictor = RiskPredictor()
