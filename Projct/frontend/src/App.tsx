import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy-loaded pages: each route chunk is fetched only when visited,
// keeping the initial bundle small.
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Student pages
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentProfile = lazy(() => import("./pages/student/Profile"));
const StudentResumeForm = lazy(() => import("./pages/student/ResumeForm"));
const StudentResumeView = lazy(() => import("./pages/student/ResumeView"));
const JobList = lazy(() => import("./pages/student/JobList"));
const JobDetail = lazy(() => import("./pages/student/JobDetail"));
const StudentApplications = lazy(() => import("./pages/student/Applications"));
const SavedJobs = lazy(() => import("./pages/student/SavedJobs"));

// Recruiter pages
const RecruiterDashboard = lazy(() => import("./pages/recruiter/Dashboard"));
const RecruiterRegistration = lazy(() => import("./pages/recruiter/Registration"));
const RecruiterProfile = lazy(() => import("./pages/recruiter/Profile"));
const PostJob = lazy(() => import("./pages/recruiter/PostJob"));
const ManageJobs = lazy(() => import("./pages/recruiter/ManageJobs"));
const RecruiterApplicants = lazy(() => import("./pages/recruiter/Applicants"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AdminVerifyUsers = lazy(() => import("./pages/admin/VerifyUsers"));
const AdminJobAudit = lazy(() => import("./pages/admin/JobAudit"));
const AdminBannerManagement = lazy(() => import("./pages/admin/BannerManagement"));
const AdminAnnouncements = lazy(() => import("./pages/admin/Announcements"));
const AdminEvaluations = lazy(() => import("./pages/admin/Evaluations"));

/**
 * Root application component.
 *
 * Public routes: Home, Login, Register, ForgotPassword, Job list/detail
 * Protected routes: Student, Recruiter, and Admin dashboards
 */
export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
    <Routes>
      <Route element={<Layout />}>
        {/* ── Public routes ──────────────────────────────── */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Jobs — public viewing, auth required for applying */}
        <Route path="jobs" element={<JobList />} />
        <Route path="jobs/:id" element={<JobDetail />} />

        {/* ── Student-only routes ────────────────────────── */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="student" element={<StudentDashboard />} />
          <Route path="student/dashboard" element={<StudentDashboard />} />
          <Route path="student/profile" element={<StudentProfile />} />
          <Route path="student/resume/new" element={<StudentResumeForm />} />
          <Route path="student/resume/:id/edit" element={<StudentResumeForm />} />
          <Route path="student/resume/:id" element={<StudentResumeView />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
        </Route>

        {/* ── Recruiter-only routes ──────────────────────── */}
        <Route element={<ProtectedRoute allowedRole="recruiter" />}>
          <Route path="recruiter" element={<RecruiterDashboard />} />
          <Route path="recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="recruiter/register" element={<RecruiterRegistration />} />
          <Route path="recruiter/profile" element={<RecruiterProfile />} />
          <Route path="recruiter/post-job" element={<PostJob />} />
          <Route path="recruiter/jobs" element={<ManageJobs />} />
          <Route path="recruiter/applicants" element={<RecruiterApplicants />} />
        </Route>

        {/* ── 404 catch-all ──────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ── Admin routes (separate layout — control panel) ──── */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/users" element={<AdminUserManagement />} />
          <Route path="admin/verify-students" element={<AdminVerifyUsers />} />
          <Route path="admin/approve-recruiters" element={<AdminVerifyUsers />} />
          <Route path="admin/verify-users" element={<AdminVerifyUsers />} />
          <Route path="admin/jobs" element={<AdminJobAudit />} />
          <Route path="admin/evaluations" element={<AdminEvaluations />} />
          <Route path="admin/banners" element={<AdminBannerManagement />} />
          <Route path="admin/announcements" element={<AdminAnnouncements />} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
  );
}
