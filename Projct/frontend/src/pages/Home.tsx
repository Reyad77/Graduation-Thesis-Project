import { Link } from "react-router-dom";
import { Search, Briefcase, ShieldCheck, Users } from "lucide-react";

export default function Home() {

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Find Your Perfect Part-Time Job
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            The platform connecting students with flexible part-time work — and helping employers find the right people.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white border border-white text-primary-700 hover:bg-primary-50 hover:border-primary-200 px-4 py-2 rounded-lg transition-colors duration-200 font-medium inline-flex items-center">
              <Search size={18} className="inline mr-1" />
              I'm looking for a job
            </Link>
            <Link to="/register" className="bg-white/10 border border-white text-white hover:bg-white hover:text-primary-700 px-4 py-2 rounded-lg transition-colors duration-200 font-medium inline-flex items-center">
              <Users size={18} className="inline mr-1" />
              I'm looking to hire
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Briefcase size={32} />}
            title="Find Jobs"
            description="Browse part-time jobs filtered by skills, location, and schedule — all designed for students."
          />
          <FeatureCard
            icon={<ShieldCheck size={32} />}
            title="Verified Employers"
            description="Every company is verified by our admin team before posting, so you know opportunities are real."
          />
          <FeatureCard
            icon={<Users size={32} />}
            title="Hire Students"
            description="Post job openings, review applications, schedule interviews — all in one place."
          />
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <div className="flex gap-3 justify-center">
            <Link to="/register" className="btn-primary">I'm looking for a job</Link>
            <Link to="/register" className="btn-secondary">I'm looking to hire</Link>
          </div>
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
