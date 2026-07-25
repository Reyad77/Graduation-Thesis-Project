import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Search, Briefcase, ShieldCheck, Users } from "lucide-react";

/**
 * Landing / home page for the platform.
 *
 * Shows a hero section, feature highlights, and calls-to-action
 * that adapt based on authentication state.
 */
export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {t("app.name")}
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {t("app.tagline")} — connect with employers offering flexible,
            part-time positions tailored for college students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs" className="btn-primary bg-white !text-primary-700 hover:!bg-primary-50">
              <Search size={18} className="inline mr-1" />
              {t("navigation.jobs")}
            </Link>
            <Link to="/register" className="btn-secondary border-white !text-white hover:!bg-primary-700">
              {t("auth.register")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Briefcase size={32} />}
            title="Browse Jobs"
            description="Search hundreds of part-time jobs filtered by skills, location, and schedule."
          />
          <FeatureCard
            icon={<ShieldCheck size={32} />}
            title="Verified Employers"
            description="All enterprises are verified by our admin team to ensure safe opportunities."
          />
          <FeatureCard
            icon={<Users size={32} />}
            title="Built for Students"
            description="Flexible hours, short-term gigs, and internships designed around your class schedule."
          />
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <Link to="/register" className="btn-primary">
            {t("auth.register")}
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
