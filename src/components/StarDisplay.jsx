import React from "react";
import { FaStar } from "react-icons/fa";

export default function StarDisplay({ value = 0, size = "sm", interactive = false, onChange }) {
  const display = interactive ? value : Math.round(Number(value) || 0);
  const sizeClass = size === "lg" ? "text-2xl" : "text-base";

  return (
    <div className="flex gap-0.5 items-center" role={interactive ? "group" : "img"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${sizeClass} ${
            interactive ? "cursor-pointer hover:scale-110 transition" : "cursor-default"
          } ${star <= display ? "text-yellow-400" : "text-gray-300"}`}
          aria-label={`${star} de 5`}
        >
          <FaStar />
        </button>
      ))}
    </div>
  );
}
