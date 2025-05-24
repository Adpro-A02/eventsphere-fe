"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Review = {
  id: string;
  userId: string;
  rating: number;
  comment: string;
};

export default function ReviewByEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const getCurrentUserIdFromToken = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || payload.userId || payload.id || null;
    } catch (e) {
      console.error("Invalid JWT:", e);
      return null;
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      const userId = getCurrentUserIdFromToken();
      setCurrentUserId(userId);

      try {
        const res = await fetch(`http://localhost:8080/api/reviews/event/${eventId}`);
        const json = await res.json();
        setReviews(json.data?.reviews || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchReviews();
  }, [eventId]);

  const myReview = reviews.find((r) => r.userId === currentUserId);

  const handleDeleteMyReview = async () => {
    if (!myReview) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Kamu harus login untuk menghapus review.");

    try {
      const res = await fetch(`http://localhost:8080/api/reviews/delete/${myReview.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
      } else {
        alert("Gagal saat menghapus review.");
      }
    } catch (err) {
      console.error("Gagal hapus review:", err);
      alert("Gagal saat menghapus review.");
    }
  };

  if (loading) {
    return (
      <Card className="max-w-3xl mx-auto mt-10 p-6">
        <CardHeader>
          <CardTitle>Loading Reviews...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-2/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto mt-10 p-6">
      <CardHeader className="flex justify-between items-center gap-2 flex-wrap">
        <CardTitle>Review untuk Event</CardTitle>
        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => router.push(`/review/${eventId}/new`)}
          >
            Tambah Review
          </Button>

          {myReview && (
            <>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push(`/review/${eventId}/edit`)}
              >
                Edit Review Saya
              </Button>

              <Button
                variant="destructive"
                onClick={handleDeleteMyReview}
              >
                Hapus Review Saya
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-gray-500">Belum ada review untuk event ini.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border p-4 rounded relative bg-white shadow">
              <div className="mb-2 font-semibold">Rating: {review.rating}/5</div>
              <p>{review.comment}</p>
              <p className="text-xs text-gray-400 mt-1">User ID: {review.userId}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
