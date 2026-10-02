import os
import joblib
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


class ModelTrainer:
    """
    Trains a Logistic Regression dropout-risk classifier and persists it to
    disk under MODEL_PATH/model_{version}.joblib.

    Usage
    -----
    >>> trainer = ModelTrainer()
    >>> metrics = trainer.train(X, y, version='2024_10_01')
    """

    def train(self, X: np.ndarray, y: np.ndarray, version: str) -> dict:
        """
        Train, evaluate, and save the model.

        Parameters
        ----------
        X : np.ndarray of shape (n_samples, 12)
            Feature matrix (see prediction/features.py for column order).
        y : np.ndarray of shape (n_samples,)
            Binary dropout labels (1 = dropout, 0 = retained).
        version : str
            Unique version string used in the saved filename.

        Returns
        -------
        dict with accuracy, precision, recall, f1, training_samples, version.
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        pipeline = Pipeline(
            [
                ("scaler", StandardScaler()),
                (
                    "clf",
                    LogisticRegression(
                        max_iter=1000,
                        class_weight="balanced",
                        solver="lbfgs",
                        random_state=42,
                    ),
                ),
            ]
        )
        pipeline.fit(X_train, y_train)

        y_pred = pipeline.predict(X_test)

        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, zero_division=0)),
            "recall": float(recall_score(y_test, y_pred, zero_division=0)),
            "f1": float(f1_score(y_test, y_pred, zero_division=0)),
            "training_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "version": version,
        }

        # Persist
        model_dir = os.getenv("MODEL_PATH", "./models")
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, f"model_{version}.joblib")
        joblib.dump(pipeline, model_path)

        return metrics
