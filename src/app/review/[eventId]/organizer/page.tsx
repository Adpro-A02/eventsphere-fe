"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiReview from "@/libs/axios/apiReview";
import ReviewCard from "@/components/reviews/review-card";
import ReviewActions from "@/components/reviews/review-actions";

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  status: string;
}

const OrganizerEventReviewsPage = () => {
  const { eventId } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = () => {
    setLoading(true);
    apiReview
      .get(`/api/reviews/event-reviews/my/${eventId}`)
      .then((res) => {
        setReviews(res.data.data.reviews);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil review untuk event");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  const flagReview = async (id: string) => {
    try {
      await apiReview.put(`/api/reviews/${id}/flag`);
      fetchReviews();
    } catch {
      alert("Gagal flag review");
    }
  };

  const cancelFlagReview = async (id: string) => {
    try {
      await apiReview.put(`/api/reviews/${id}/cancel-flag`);
      fetchReviews();
    } catch {
      alert("Gagal membatalkan flag review");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (reviews.length === 0) return <p>Tidak ada review untuk event ini.</p>;

  return (
    <div>
      <h1>Review Event {eventId} (Organizer View)</h1>
      {reviews.map((r) => (
        <div key={r.id}>
          <ReviewCard
            rating={r.rating}
            comment={r.comment}
            userId={r.userId}
            status={r.status}
          />
          <ReviewActions
            canFlag={r.status !== "FLAGGED"}
            canCancelFlag={r.status === "FLAGGED"}
            onFlag={() => flagReview(r.id)}
            onCancelFlag={() => cancelFlagReview(r.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default OrganizerEventReviewsPage;
