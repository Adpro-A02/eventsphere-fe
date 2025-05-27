"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Review = {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  status: string;
};

export default function OrganizerReviewPage() {
  const { eventId } = useParams() as { eventId: string };
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchReviews = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/event-reviews/my/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Gagal mengambil review");
      const json = await res.json();
      setReviews(json.data?.reviews || []);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil review. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  // Flag review
  const flagReview = async (reviewId: string) => {
    if (!token) return alert("Anda harus login");
    try {
      const res = await fetch(
        `https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/${reviewId}/flag`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Gagal flag review");
      alert("Review berhasil di-flag");
      fetchReviews();
    } catch (err) {
      alert((err as Error).message || "Gagal flag review");
    }
  };

  const cancelFlagReview = async (reviewId: string) => {
    if (!token) return alert("Anda harus login");
    try {
      const res = await fetch(
        `https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/${reviewId}/cancel-flag`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Gagal batalkan flag review");
      alert("Flag review berhasil dibatalkan");
      fetchReviews();
    } catch (err) {
      alert((err as Error).message || "Gagal batalkan flag review");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6">Loading reviews...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <Button
        onClick={() => router.push("/review/organizer")}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
      >
        ← Back to Organizer Reviews
      </Button>

      <h1 className="text-2xl font-bold mb-6">Review untuk Event Anda</h1>

      {reviews.length === 0 && (
        <p className="text-gray-600">Belum ada review untuk event ini.</p>
      )}

      {reviews.map((review) => (
        <Card key={review.id} className="p-4">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Rating: {review.rating}/5</CardTitle>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                review.status === "FLAGGED"
                  ? "bg-red-200 text-red-800"
                  : "bg-green-200 text-green-800"
              }`}
            >
              {review.status}
            </span>
          </CardHeader>
          <CardContent>
            <p>{review.comment}</p>
            <p className="text-xs text-gray-500 mt-2">
              User ID: {review.userId}
            </p>

            <div className="mt-4 flex gap-2">
              {review.status !== "FLAGGED" ? (
                <Button
                  variant="destructive"
                  onClick={() => flagReview(review.id)}
                >
                  Flag Review
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => cancelFlagReview(review.id)}
                >
                  Cancel Flag
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
