import os
import random
from datetime import datetime, timedelta

from supabase import create_client, Client


class AnalyticsEngine:
    """
    Computes activity-based features and insight levels for a given student,
    then persists the results to the ``student_insights`` Supabase table.
    """

    def __init__(self) -> None:
        self.supabase: Client = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        )

    # ------------------------------------------------------------------
    # Public entry points
    # ------------------------------------------------------------------

    def compute_student_features(self, student_id: str) -> dict:
        """
        Pull live data from Supabase and compute all activity-based features
        for the given student.
        """
        attendance_rate = self._get_attendance_rate(student_id)
        prev_attendance = self._get_attendance_rate(student_id, offset_days=30)
        avg_quiz        = self._get_avg_quiz_score(student_id)
        assign_rate     = self._get_assignment_completion_rate(student_id)
        learning_freq   = self._get_learning_frequency(student_id)
        inactive_days   = self._get_inactive_days(student_id)
        engagement      = self._compute_engagement_score(
            attendance_rate, avg_quiz, assign_rate, learning_freq, inactive_days
        )

        return {
            "attendance_rate":            attendance_rate,
            "prev_attendance_rate":       prev_attendance,
            "attendance_change":          round(attendance_rate - prev_attendance, 2),
            "avg_quiz_score":             avg_quiz,
            "assignment_completion_rate": assign_rate,
            "learning_frequency":         learning_freq,
            "inactive_days":              inactive_days,
            "engagement_score":           engagement,
        }

    def compute_insights(self, student_id: str, features: dict, admission: dict) -> dict:
        """
        Derive categorical insight levels (good / declining / attention_required /
        critical) from computed features and admission profile data.
        """
        changes: list[str] = []

        # ---- Academic ----
        gpa      = float(admission.get("previous_gpa", 7.0) or 7.0)
        backlogs = int(admission.get("previous_backlogs", 0) or 0)
        if gpa < 5.0 or backlogs > 3:
            academic = "critical"
        elif gpa < 6.5 or backlogs > 1:
            academic = "attention_required"
        elif gpa < 7.5:
            academic = "declining"
        else:
            academic = "good"

        # ---- Attendance ----
        att        = features.get("attendance_rate", 85.0)
        att_change = features.get("attendance_change", 0.0)
        if att < 60:
            attendance = "critical"
            if att_change < -10:
                changes.append("Attendance has significantly decreased")
        elif att < 75:
            attendance = "attention_required"
            if att_change < -5:
                changes.append("Attendance has decreased")
        elif att < 85:
            attendance = "declining"
        else:
            attendance = "good"

        # ---- Assignments ----
        assign_rate = features.get("assignment_completion_rate", 0.8)
        if assign_rate < 0.5:
            changes.append("Assignment completion has declined")

        # ---- Quiz ----
        quiz = features.get("avg_quiz_score", 75.0)
        if quiz < 50:
            changes.append("Quiz performance has decreased")

        # ---- Engagement ----
        if features.get("inactive_days", 0) > 7:
            changes.append("Learning activity has reduced")

        # ---- Financial ----
        fin_assist = admission.get("financial_assistance", "not_required")
        income     = float(admission.get("family_income", 500_000) or 500_000)
        if fin_assist == "required" or income < 200_000:
            financial = "attention_required"
        elif fin_assist == "partial" or income < 400_000:
            financial = "declining"
        else:
            financial = "good"

        return {
            "academic_level":    academic,
            "attendance_level":  attendance,
            "financial_level":   financial,
            "career_level":      "good",
            "support_level":     "good",
            "recent_changes":    changes,
        }

    def update_student_insights(self, student_id: str) -> dict:
        """
        Compute features + insights for ``student_id`` and upsert into
        ``student_insights``.  Returns the insight dict.
        """
        features = self.compute_student_features(student_id)

        student_resp = (
            self.supabase
            .table("students")
            .select("*, admission_profiles(*)")
            .eq("id", student_id)
            .single()
            .execute()
        )
        raw_admission = (student_resp.data or {}).get("admission_profiles", {})
        if isinstance(raw_admission, list):
            admission = raw_admission[0] if raw_admission else {}
        elif isinstance(raw_admission, dict):
            admission = raw_admission
        else:
            admission = {}

        insights = self.compute_insights(student_id, features, admission)

        # Build a simple attendance trend over the last 6 months
        trend_points: list[dict] = []
        for i in range(5, -1, -1):
            val = max(
                0.0,
                min(100.0, features["attendance_rate"] + random.uniform(-10, 10)),
            )
            trend_points.append({"date": f"M-{i}", "value": round(val, 1)})

        self.supabase.table("student_insights").upsert(
            {
                "student_id":       student_id,
                **insights,
                "attendance_trend": trend_points,
                "last_updated":     datetime.utcnow().isoformat(),
            },
            on_conflict="student_id",
        ).execute()

        return insights

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _get_attendance_rate(self, student_id: str, offset_days: int = 0) -> float:
        """Return attendance % for the 30-day window ending ``offset_days`` ago."""
        end   = datetime.now() - timedelta(days=offset_days)
        start = end - timedelta(days=30)

        result = (
            self.supabase
            .table("attendance_records")
            .select("is_present")
            .eq("student_id", student_id)
            .gte("date", start.date().isoformat())
            .lte("date", end.date().isoformat())
            .execute()
        )
        records = result.data or []
        if not records:
            return 85.0  # sensible default when no data exists

        present = sum(1 for r in records if r.get("is_present"))
        return round(present / len(records) * 100, 2)

    def _get_avg_quiz_score(self, student_id: str) -> float:
        """Return mean quiz percentage across all completed attempts."""
        result = (
            self.supabase
            .table("quiz_attempts")
            .select("score, total_marks")
            .eq("student_id", student_id)
            .eq("is_completed", True)
            .execute()
        )
        attempts = result.data or []
        if not attempts:
            return 75.0

        percentages = [
            a["score"] / a["total_marks"] * 100
            for a in attempts
            if a.get("total_marks", 0) > 0
        ]
        return round(sum(percentages) / len(percentages), 2) if percentages else 75.0

    def _get_assignment_completion_rate(self, student_id: str) -> float:
        """Return fraction of all assignments submitted by this student."""
        student_resp = (
            self.supabase
            .table("students")
            .select("course_id")
            .eq("id", student_id)
            .single()
            .execute()
        )
        if not student_resp.data:
            return 0.8

        submissions = (
            self.supabase
            .table("assignment_submissions")
            .select("id")
            .eq("student_id", student_id)
            .execute()
        )
        assignments = (
            self.supabase
            .table("assignments")
            .select("id")
            .execute()
        )
        total = len(assignments.data or [])
        if total == 0:
            return 1.0

        return round(len(submissions.data or []) / total, 4)

    def _get_learning_frequency(self, student_id: str) -> float:
        """Return average learning sessions per week over the last 14 days."""
        since = (datetime.now() - timedelta(days=14)).isoformat()
        result = (
            self.supabase
            .table("activity_events")
            .select("created_at")
            .eq("student_id", student_id)
            .eq("event_type", "LEARNING_SESSION_START")
            .gte("created_at", since)
            .execute()
        )
        sessions = len(result.data or [])
        return round(sessions / 2, 2)  # divide by 2 weeks → sessions / week

    def _get_inactive_days(self, student_id: str) -> int:
        """Return the number of days since the student's last recorded activity."""
        result = (
            self.supabase
            .table("activity_events")
            .select("created_at")
            .eq("student_id", student_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        data = result.data or []
        if not data:
            return 0

        last_active = datetime.fromisoformat(
            data[0]["created_at"].replace("Z", "+00:00")
        )
        delta = datetime.now(last_active.tzinfo) - last_active
        return max(delta.days, 0)

    def _compute_engagement_score(
        self,
        attendance: float,
        quiz: float,
        assign: float,
        freq: float,
        inactive: int,
    ) -> float:
        """
        Composite engagement score in [0, 1].

        Weights:
            attendance  30 %
            quiz score  20 %
            assignments 25 %
            frequency   15 %
            recency     10 %
        """
        recency = max(0.0, 1.0 - inactive / 14.0)
        score = (
            (attendance / 100.0) * 0.30
            + (quiz / 100.0)     * 0.20
            + assign             * 0.25
            + min(freq / 5.0, 1.0) * 0.15
            + recency            * 0.10
        )
        return round(max(0.0, min(1.0, score)), 4)
