import { Link, Navigate } from "react-router-dom";
import { Search, Briefcase, ShieldCheck, Users, GraduationCap, Building2, Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, role } = useAuth();

  // Show spinner while checking session
  if (isLoading) return <LoadingSpinner fullPage />;

  // If logged in, redirect to role dashboard
  if (isAuthenticated) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "enterprise") return <Navigate to="/enterprise" replace />;
    return <Navigate to="/student" replace />;
  }

  // ── Logged-out landing page ─────────────────────────────
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <GraduationCap size={16} />
            {t("home.heroBadge")}
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 leading-tight">
            {t("home.heroTitle")}
          </h1>
          <p className="text-lg text-primary-100 mb-10 max-w-xl mx-auto leading-relaxed">
            {t("home.heroSub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-black/10">
              <Search size={18} /> {t("home.lookingJob")}
            </Link>
            <Link to="/register" className="bg-white/10 border-2 border-white/30 text-white hover:bg-white hover:text-primary-700 px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2">
              <Users size={18} /> {t("home.lookingHire")}
            </Link>
          </div>
          <p className="text-sm text-primary-200 mt-4">
            {t("home.haveAccount")} <Link to="/login" className="text-white underline font-medium">{t("home.logIn")}</Link>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t("home.howItWorks")}</h2>
          <p className="text-gray-500 mt-2">{t("home.howSub")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard number="1" icon={<GraduationCap size={28} />} title={t("home.step1Title")} description={t("home.step1Desc")} />
          <StepCard number="2" icon={<Search size={28} />} title={t("home.step2Title")} description={t("home.step2Desc")} />
          <StepCard number="3" icon={<CheckCircle size={28} />} title={t("home.step3Title")} description={t("home.step3Desc")} />
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t("home.whyTitle")}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<Briefcase size={24} />} title={t("home.feat1Title")} desc={t("home.feat1Desc")} />
            <FeatureCard icon={<ShieldCheck size={24} />} title={t("home.feat2Title")} desc={t("home.feat2Desc")} />
            <FeatureCard icon={<Building2 size={24} />} title={t("home.feat3Title")} desc={t("home.feat3Desc")} />
            <FeatureCard icon={<Clock size={24} />} title={t("home.feat4Title")} desc={t("home.feat4Desc")} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">{t("home.ctaTitle")}</h2>
          <p className="text-primary-200 mb-8">{t("home.ctaSub")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 rounded-xl font-semibold transition-all">
              {t("home.ctaButton")}
            </Link>
            <Link to="/login" className="border-2 border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-all">
              {t("home.logIn")}
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-white text-lg mb-2">{t("app.name")}</p>
          <p>{t("home.footerTagline")}</p>
          <p className="mt-4 text-gray-600">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, icon, title, description }: {
  number: string; icon: React.ReactNode; title: string; description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-4">
        {icon}
      </div>
      <div className="text-xs font-bold text-primary-500 mb-2">STEP {number}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
