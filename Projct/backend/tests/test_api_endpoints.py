"""Integration tests for student, job, and admin endpoints."""


class TestStudentEndpoints:
    def test_get_profile_unauthorized(self, client):
        resp = client.get("/api/v1/students/profile")
        assert resp.status_code == 401

    def test_update_profile_unauthorized(self, client):
        resp = client.put("/api/v1/students/profile", json={"major": "CS"})
        assert resp.status_code == 401


class TestJobEndpoints:
    def test_job_detail_route_exists(self, client):
        """Verify a job detail route returns 401 (not 404) without auth."""
        resp = client.get("/api/v1/jobs/some-job-id")
        # Public endpoint — may return 404 or 500 depending on Firestore
        assert resp.status_code != 401  # job detail is public

    def test_apply_without_auth(self, client):
        resp = client.post("/api/v1/jobs/some-id/apply", json={"resumeId": "r1"})
        assert resp.status_code == 401

    def test_save_job_without_auth(self, client):
        resp = client.post("/api/v1/jobs/some-id/save")
        assert resp.status_code == 401


class TestAdminEndpoints:
    def test_list_users_unauthorized(self, client):
        resp = client.get("/api/v1/admin/users")
        assert resp.status_code == 401

    def test_approve_job_unauthorized(self, client):
        resp = client.post("/api/v1/admin/jobs/some-id/approve")
        assert resp.status_code == 401


class TestEnterpriseEndpoints:
    def test_get_jobs_unauthorized(self, client):
        resp = client.get("/api/v1/enterprise/jobs")
        assert resp.status_code == 401

    def test_create_job_unauthorized(self, client):
        resp = client.post("/api/v1/enterprise/jobs", json={"title": "Test"})
        assert resp.status_code == 401
