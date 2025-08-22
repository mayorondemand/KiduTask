import { Star } from "lucide-react";

export const StarRating = ({
  rating,
  onRatingChange,
  readonly,
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 transition-colors ${readonly ? "" : "cursor-pointer"} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 hover:text-yellow-400"
          }`}
          onClick={() => !readonly && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};
