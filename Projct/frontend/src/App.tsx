import { Routes, Route } from "react-router-dom";
import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentResumeForm from "./pages/student/ResumeForm";
import StudentResumeView from "./pages/student/ResumeView";
import JobList from "./pages/student/JobList";
import JobDetail from "./pages/student/JobDetail";
import StudentApplications from "./pages/student/Applications";

// Enterprise pages
import EnterpriseDashboard from "./pages/enterprise/Dashboard";
import EnterpriseRegistration from "./pages/enterprise/Registration";
import EnterpriseProfile from "./pages/enterprise/Profile";
import PostJob from "./pages/enterprise/PostJob";
import ManageJobs from "./pages/enterprise/ManageJobs";
import EnterpriseApplicants from "./pages/enterprise/Applicants";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUserManagement from "./pages/admin/UserManagement";
import AdminStudentVerification from "./pages/admin/StudentVerification";
import AdminEnterpriseApproval from "./pages/admin/EnterpriseApproval";
import AdminJobAudit from "./pages/admin/JobAudit";
import AdminBannerManagement from "./pages/admin/BannerManagement";
import AdminAnnouncements from "./pages/admin/Announcements";

/**
 * Root application component.
 *
 * Public routes: Home, Login, Register, ForgotPassword, Job list/detail
 * Protected routes: Student, Enterprise, and Admin dashboards
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* ── Public routes ──────────────────────────────── */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />

        {/* Jobs — public viewing, auth required for applying */}
        <Route path="jobs" element={<JobList />} />
        <Route path="jobs/:id" element={<JobDetail />} />

        {/* ── Student-only routes ────────────────────────── */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="student" element={<StudentDashboard />} />
          <Route path="student/profile" element={<StudentProfile />} />
          <Route path="student/resume/new" element={<StudentResumeForm />} />
          <Route path="student/resume/:id/edit" element={<StudentResumeForm />} />
          <Route path="student/resume/:id" element={<StudentResumeView />} />
          <Route path="applications" element={<StudentApplications />} />
        </Route>

        {/* ── Enterprise-only routes ─────────────────────── */}
        <Route element={<ProtectedRoute allowedRole="enterprise" />}>
          <Route path="enterprise" element={<EnterpriseDashboard />} />
          <Route path="enterprise/register" element={<EnterpriseRegistration />} />
          <Route path="enterprise/profile" element={<EnterpriseProfile />} />
          <Route path="enterprise/post-job" element={<PostJob />} />
          <Route path="enterprise/jobs" element={<ManageJobs />} />
          <Route path="enterprise/applicants" element={<EnterpriseApplicants />} />
        </Route>

        {/* ── Admin-only routes ──────────────────────────── */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/users" element={<AdminUserManagement />} />
          <Route path="admin/verify-students" element={<AdminStudentVerification />} />
          <Route path="admin/approve-enterprises" element={<AdminEnterpriseApproval />} />
          <Route path="admin/jobs" element={<AdminJobAudit />} />
          <Route path="admin/banners" element={<AdminBannerManagement />} />
          <Route path="admin/announcements" element={<AdminAnnouncements />} />
        </Route>
      </Route>
    </Routes>
  );
}
