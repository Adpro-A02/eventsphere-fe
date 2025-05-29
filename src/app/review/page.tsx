"use client";

import React, { useEffect, useState } from "react";
import apiReview from "@/libs/axios/apiReview";
import ReviewCard from "@/components/reviews/review-card";
import ReviewActions from "@/components/reviews/review-actions";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  status: string;
  eventId: string;
}

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchReviews = () => {
    setLoading(true);
    apiReview
      .get("/api/reviews/my-reviews")
      .then((res) => {
        setReviews(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil data review Anda");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus review ini?")) return;
    try {
      await apiReview.delete(`/api/reviews/delete/${id}`);
      fetchReviews();
    } catch {
      alert("Gagal menghapus review");
    }
  };

  const editReview = (review: Review) => {
    router.push(`/review/${review.eventId}/edit`);
  };

  if (loading) return <p>Loading your reviews...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (reviews.length === 0) return <p>Anda belum membuat review apapun.</p>;

  return (
    <div>
      <h1>Review Saya (Attendee)</h1>
      {reviews.map((r) => (
        <div key={r.id}>
          <ReviewCard
            rating={r.rating}
            comment={r.comment}
            userId={r.userId}
            status={r.status}
          />
          <ReviewActions
            canEdit={true}
            canDelete={true}
            onEdit={() => editReview(r)}
            onDelete={() => deleteReview(r.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default MyReviewsPage;
