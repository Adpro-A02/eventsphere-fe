"use client";

import React, { useEffect, useState } from "react";
import apiReview from "@/libs/axios/apiReview";
import ReviewCard from "@/components/reviews/review-card";

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  status: string;
}

const FlaggedReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = () => {
    setLoading(true);
    apiReview
      .get("/api/reviews/flagged")
      .then((res) => {
        setReviews(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil flagged reviews");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus review ini?")) return;

    try {
      await apiReview.delete(`/api/reviews/delete/${id}`);
      fetchReviews();
    } catch {
      alert("Gagal menghapus review");
    }
  };

  if (loading) return <p>Loading flagged reviews...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (reviews.length === 0) return <p>Tidak ada review yang di-flag.</p>;

  return (
    <div>
      <h1>Flagged Reviews (Admin)</h1>
      {reviews.map((r) => (
        <div
          key={r.id}
          className="mb-4 p-4 border rounded relative flex justify-between items-start"
        >
          <div className="flex-grow pr-4">
            <ReviewCard
              rating={r.rating}
              comment={r.comment}
              userId={r.userId}
              status={r.status}
            />
          </div>

          <button
            onClick={() => handleDelete(r.id)}
            className="self-start px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
};

export default FlaggedReviewsPage;
