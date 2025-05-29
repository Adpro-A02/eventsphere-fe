"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import apiReview from "@/libs/axios/apiReview";
import ReviewForm from "@/components/reviews/review-form";

const NewReviewPage = () => {
  const router = useRouter();
  const { eventId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: { rating: number; comment: string }) => {
    setError(null);
    setLoading(true);
    try {
      const now = new Date().toISOString();
      await apiReview.post("/api/reviews", {
        eventId,
        rating: data.rating,
        comment: data.comment,
        createdDate: now,
        updatedDate: now,
      });
      router.push(`/review/${eventId}`);
    } catch (e: any) { // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(e.response?.data?.message || "Gagal membuat review");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <h1>Buat Review untuk Event {eventId}</h1>
      {error && <p className="text-red-600">{error}</p>}
      <ReviewForm onSubmit={handleSubmit} isSubmitting={loading} />
    </div>
  );
};

export default NewReviewPage;
