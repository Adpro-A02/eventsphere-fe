"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import apiReview from "@/libs/axios/apiReview";
import ReviewForm from "@/components/reviews/review-form";

const EditReviewPage = () => {
  const router = useRouter();
  const { eventId } = useParams();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<{ rating: number; comment: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiReview
      .get(`/api/reviews/my-review/event/${eventId}`)
      .then((res) => {
        const r = res.data.data;
        setInitialData({ rating: r.rating, comment: r.comment });
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil review Anda");
        setLoading(false);
      });
  }, [eventId]);

  const handleSubmit = async (data: { rating: number; comment: string }) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiReview.put(`/api/reviews/my-review/event/${eventId}`, {
        ...data,
        updatedDate: new Date().toISOString(),
      });
      router.push(`/review/${eventId}`);
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e.response?.data?.message || "Gagal memperbarui review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!initialData) return <p>Review tidak ditemukan.</p>;

  return (
    <div>
      <h1>Edit Review untuk Event {eventId}</h1>
      <ReviewForm
        initialRating={initialData.rating}
        initialComment={initialData.comment}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
    </div>
  );
};

export default EditReviewPage;
