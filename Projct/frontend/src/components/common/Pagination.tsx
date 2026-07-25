import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  hasNext: boolean;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, hasNext, total, onPageChange }: PaginationProps) {
  if (page === 1 && !hasNext) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t">
      <p className="text-xs text-gray-500">
        {total !== undefined ? `~${total} results` : ""}
        {page > 1 && ` · Page ${page}`}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-3 py-1 text-sm font-medium rounded bg-primary-50 text-primary-700">{page}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
