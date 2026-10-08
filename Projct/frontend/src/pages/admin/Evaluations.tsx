import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import evaluationService from "@/services/evaluationService";
import type { Evaluation } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import StarRating from "@/components/common/StarRating";
import { toast } from "react-hot-toast";

export default function AdminEvaluations() {
  const { t } = useTranslation();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = () =>
    evaluationService
      .getAll()
      .then((e) => setEvaluations(Array.isArray(e) ? e : []))
      .finally(() => setIsLoading(false));

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t("evaluation.deleteConfirm"))) return;
    try {
      await evaluationService.deleteEvaluation(id);
      toast.success(t("evaluation.deleted"));
      fetch();
    } catch {
      toast.error(t("admin.failedToast"));
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("evaluation.adminTitle")}</h1>
      {evaluations.length === 0 ? (
        <p className="text-gray-500 mt-4">{t("common.noData")}</p>
      ) : (
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">{t("evaluation.from")}</th>
                <th className="py-2 pr-4">{t("evaluation.to")}</th>
                <th className="py-2 pr-4">{t("evaluation.rating")}</th>
                <th className="py-2 pr-4">{t("evaluation.comment")}</th>
                <th className="py-2 pr-4">{t("common.delete")}</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((e) => (
                <tr key={e.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4 text-gray-700">
                    {e.fromRole === "student" ? t("evaluation.fromStudent") : t("evaluation.fromRecruiter")}
                  </td>
                  <td className="py-2 pr-4 text-gray-700">
                    {e.toRole === "student" ? t("evaluation.fromStudent") : t("evaluation.fromRecruiter")}
                  </td>
                  <td className="py-2 pr-4"><StarRating value={e.rating} size={14} /></td>
                  <td className="py-2 pr-4 text-gray-600 max-w-xs">{e.comment || "—"}</td>
                  <td className="py-2 pr-4">
                    <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
