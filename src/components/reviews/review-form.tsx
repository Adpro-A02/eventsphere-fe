"use client";

import React, { useState } from "react";

export interface ReviewFormProps {
  initialRating?: number;
  initialComment?: string;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  isSubmitting?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  initialRating = 0,
  initialComment = "",
  onSubmit,
  isSubmitting = false,
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [comment, setComment] = useState<string>(initialComment);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating < 1 || rating > 5) {
      setError("Rating harus antara 1 sampai 5");
      return;
    }
    if (comment.trim().length === 0) {
      setError("Komentar tidak boleh kosong");
      return;
    }
    try {
      await onSubmit({ rating, comment });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat submit");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded">
      <div>
        <label htmlFor="rating" className="block font-semibold mb-1">
          Rating (1-5):
        </label>
        <input
          id="rating"
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border p-2 w-full"
          disabled={isSubmitting}
          required
        />
      </div>
      <div className="mt-4">
        <label htmlFor="comment" className="block font-semibold mb-1">
          Komentar:
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 w-full"
          disabled={isSubmitting}
          required
          rows={4}
        />
      </div>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
};

export default ReviewForm;
