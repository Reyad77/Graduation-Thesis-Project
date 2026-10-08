import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Evaluation } from "@/types";
import evaluationService from "@/services/evaluationService";
import StarRating from "@/components/common/StarRating";

/**
 * Card showing the evaluations the current user has received:
 * average rating plus the list of comments.
 */
export default function EvaluationsCard() {
  const { t } = useTranslation();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    evaluationService
      .getReceived()
      .then((e) => setEvaluations(Array.isArray(e) ? e : []))
      .catch(() => setEvaluations([]));
  }, []);

  const average =
    evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length
      : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">{t("evaluation.received")}</h2>
        {evaluations.length > 0 && (
          <span className="flex items-center gap-2 text-sm text-gray-600">
            <StarRating value={Math.round(average)} size={14} />
            {average.toFixed(1)}
          </span>
        )}
      </div>
      {evaluations.length === 0 ? (
        <p className="text-sm text-gray-500 mt-3">{t("evaluation.none")}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {evaluations.map((e) => (
            <div key={e.id} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
              <div className="flex items-center justify-between">
                <StarRating value={e.rating} size={14} />
                <span className="text-xs text-gray-400">
                  {e.fromRole === "student"
                    ? t("evaluation.fromStudent")
                    : t("evaluation.fromRecruiter")}
                  {" · "}
                  {e.createdAt?.slice(0, 10)}
                </span>
              </div>
              {e.comment && <p className="text-sm text-gray-600 mt-1">{e.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
