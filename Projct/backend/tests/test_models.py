"""Unit tests for Pydantic model validation."""

import pytest
from pydantic import ValidationError

from app.models.user import UserRegisterRequest, UserLoginRequest, UserRole
from app.models.job import JobCreateRequest, JobStatus
from app.models.application import ApplicationCreateRequest, ApplicationStatusUpdateRequest, ApplicationStatus
from app.models.resume import ResumeCreateRequest


class TestUserModels:
    def test_valid_registration(self):
        req = UserRegisterRequest(
            email="test@example.com",
            password="password123",
            displayName="Alice",
            role=UserRole.STUDENT,
        )
        assert req.email == "test@example.com"
        assert req.role == UserRole.STUDENT

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            UserRegisterRequest(
                email="not-an-email",
                password="password123",
                displayName="Alice",
                role=UserRole.STUDENT,
            )

    def test_short_password(self):
        with pytest.raises(ValidationError):
            UserRegisterRequest(
                email="test@example.com",
                password="123",  # too short
                displayName="Alice",
                role=UserRole.STUDENT,
            )

    def test_empty_display_name(self):
        with pytest.raises(ValidationError):
            UserRegisterRequest(
                email="test@example.com",
                password="password123",
                displayName="",  # empty
                role=UserRole.STUDENT,
            )

    def test_login_request(self):
        req = UserLoginRequest(email="test@example.com", password="password123")
        assert req.email == "test@example.com"


class TestJobModels:
    def test_valid_job_create(self):
        req = JobCreateRequest(
            title="Barista",
            responsibilities="Make coffee",
            salary="$15/hour",
            workingHours="Flexible",
            quota=2,
            location="Campus",
            duration="3 months",
        )
        assert req.title == "Barista"
        assert req.quota == 2

    def test_empty_title(self):
        with pytest.raises(ValidationError):
            JobCreateRequest(
                title="",
                responsibilities="...",
                salary="$15",
                workingHours="9-5",
                quota=1,
                location="Here",
                duration="3m",
            )


class TestApplicationModels:
    def test_application_create(self):
        req = ApplicationCreateRequest(resumeId="resume-123")
        assert req.resumeId == "resume-123"

    def test_status_update(self):
        req = ApplicationStatusUpdateRequest(status=ApplicationStatus.HIRED)
        assert req.status == ApplicationStatus.HIRED


class TestResumeModels:
    def test_resume_create(self):
        req = ResumeCreateRequest(
            major="Computer Science",
            grade="Junior",
            skills=["Python", "React"],
            availableHours="20h/week",
            experience="Internship",
        )
        assert len(req.skills) == 2
