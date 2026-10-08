import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  /** Current rating (1-5). */
  value: number;
  /** When provided, the row becomes interactive (1-5 clicks). */
  onChange?: (n: number) => void;
  size?: number;
}

/**
 * Five-star rating row. Interactive when `onChange` is set; read-only
 * display otherwise.
 */
export default function StarRating({ value, onChange, size = 22 }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={n <= display ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}
