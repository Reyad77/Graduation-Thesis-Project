import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Search, MapPin, DollarSign, Clock } from "lucide-react";
import studentService from "@/services/studentService";
import type { Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function JobList() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await studentService.getJobs({ keyword, location, page_size: 50 });
      setJobs(Array.isArray(res) ? res : []);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchJobs(); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("navigation.jobs")}</h1>

      {/* Filter bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mt-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search jobs..." value={keyword}
            onChange={e => setKeyword(e.target.value)} />
        </div>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-9" placeholder="Location" value={location}
            onChange={e => setLocation(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary">{t("common.search")}</button>
      </form>

      {isLoading ? <LoadingSpinner /> : jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t("jobs.noJobs")}</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`}
              className="card hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <div className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</div>
                <div className="flex items-center gap-1"><MapPin size={14} /> {job.location}</div>
                <div className="flex items-center gap-1"><Clock size={14} /> {job.workingHours}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {job.skillRequirements.slice(0,3).map(s => (
                  <span key={s} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
