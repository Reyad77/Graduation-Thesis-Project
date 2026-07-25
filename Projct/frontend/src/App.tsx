import { Routes, Route } from "react-router-dom";
import Layout from "./components/common/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
 * Defines all routes wrapped in the shared Layout (navbar + footer).
 * Role-specific pages are nested under their respective URL prefixes.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Student routes */}
        <Route path="student">
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="resume/new" element={<StudentResumeForm />} />
          <Route path="resume/:id/edit" element={<StudentResumeForm />} />
          <Route path="resume/:id" element={<StudentResumeView />} />
        </Route>
        <Route path="jobs" element={<JobList />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="applications" element={<StudentApplications />} />

        {/* Enterprise routes */}
        <Route path="enterprise">
          <Route index element={<EnterpriseDashboard />} />
          <Route path="register" element={<EnterpriseRegistration />} />
          <Route path="profile" element={<EnterpriseProfile />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="applicants" element={<EnterpriseApplicants />} />
        </Route>

        {/* Admin routes */}
        <Route path="admin">
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="verify-students" element={<AdminStudentVerification />} />
          <Route path="approve-enterprises" element={<AdminEnterpriseApproval />} />
          <Route path="jobs" element={<AdminJobAudit />} />
          <Route path="banners" element={<AdminBannerManagement />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
        </Route>
      </Route>
    </Routes>
  );
}
