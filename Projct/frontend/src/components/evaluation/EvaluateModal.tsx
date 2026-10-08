import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import StarRating from "@/components/common/StarRating";
import evaluationService from "@/services/evaluationService";
import { getApiErrorMessage } from "@/utils/apiError";

interface EvaluateModalProps {
  applicationId: string;
  /** Criteria hints shown under the title (what to evaluate). */
  criteria: string[];
  onClose: () => void;
  onSubmitted: () => void;
}

/**
 * Modal for submitting an evaluation (rating + comment) about the other
 * party of a completed application.
 */
export default function EvaluateModal({
  applicationId,
  criteria,
  onClose,
  onSubmitted,
}: EvaluateModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (rating === 0) {
      toast.error(t("evaluation.ratingRequired"));
      return;
    }
    setIsSubmitting(true);
    try {
      await evaluationService.create({ applicationId, rating, comment });
      toast.success(t("evaluation.submitSuccess"));
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("evaluation.submitFailed")));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-1">{t("evaluation.title")}</h3>
        <p className="text-xs text-gray-500 mb-4">{criteria.join(" · ")}</p>
        <div className="mb-3">
          <StarRating value={rating} onChange={setRating} />
        </div>
        <textarea
          className="input-field"
          rows={3}
          placeholder={t("evaluation.commentPlaceholder")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <button onClick={submit} disabled={isSubmitting} className="btn-primary text-sm">
            {isSubmitting ? t("common.loading") : t("evaluation.submit")}
          </button>
          <button onClick={onClose} className="btn-secondary text-sm">
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
