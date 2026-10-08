import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import studentService from "@/services/studentService";
import type { Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { DollarSign, MapPin, Clock } from "lucide-react";

export default function SavedJobs() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    studentService
      .getSavedJobs()
      .then((j) => setJobs(Array.isArray(j) ? j : []))
      .catch(() => setJobs([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("jobs.savedJobs")}</h1>
      {jobs.length === 0 ? (
        <EmptyState title={t("jobs.noJobs")} description={t("common.noData")} />
      ) : (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <Link key={j.id} to={`/jobs/${j.id}`} className="card hover:shadow-md transition-shadow">
              <h2 className="font-semibold text-gray-900">{j.title}</h2>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1"><DollarSign size={12} className="text-green-600" />{j.salary}</span>
                <span className="flex items-center gap-1"><MapPin size={12} className="text-red-500" />{j.location}</span>
                <span className="flex items-center gap-1"><Clock size={12} className="text-blue-500" />{j.workingHours}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
