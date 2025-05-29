"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiReview from "@/libs/axios/apiReview";
import ReviewCard from "@/components/reviews/review-card";

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  status: string;
}

const ReviewsPage = () => {
  const { eventId } = useParams();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiReview
      .get(`/api/reviews/event/${eventId}`)
      .then((res) => {
        setReviews(res.data.data.reviews);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil data review.");
        setLoading(false);
      });
  }, [eventId]);

  const handleAddReview = () => {
    router.push(`/review/${eventId}/new`);
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1>Reviews for Event {eventId}</h1>
      <button
        onClick={handleAddReview}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Tambah Review
      </button>

      {reviews.length === 0 && <p>Belum ada review untuk event ini.</p>}
      {reviews.map((r) => (
        <ReviewCard
          key={r.id}
          rating={r.rating}
          comment={r.comment}
          userId={r.userId}
          status={r.status}
        />
      ))}
    </div>
  );
};

export default ReviewsPage;
