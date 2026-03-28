import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";

export default function RatingStars({ serviceId }) {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`rating-${serviceId}`);
    if (saved) setRating(parseInt(saved));
  }, [serviceId]);

  const handleRate = (value) => {
    setRating(value);
    localStorage.setItem(`rating-${serviceId}`, value);
  };

  return (
    <div className="flex gap-1 mt-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar
          key={i}
          onClick={() => handleRate(i)}
          className={`cursor-pointer text-2xl transition ${
            i <= rating ? "text-yellow-400" : "text-gray-400 hover:text-yellow-200"
          }`}
        />
      ))}
    </div>
  );
}
