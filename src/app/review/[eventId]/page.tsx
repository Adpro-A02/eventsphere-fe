"use client";

import { useEffect, useState, useCallback } from "react";
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

type Event = {
  id: string;
  status: string; // misal "COMPLETED", "PUBLISHED", etc
};

export default function ReviewByEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    null,
  ); /* eslint-disable-line */

  const parseToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch (e) {
      console.error("Invalid JWT:", e);
      return null;
    }
  };

  // Wrap functions in useCallback to prevent dependency cycle
  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/events/${eventId}`);
      if (!res.ok) throw new Error("Event tidak ditemukan");
      const json = await res.json();
      setEvent(json);
    } catch {
      setError("Gagal memuat data event.");
      setEvent(null);
    }
  }, [eventId, setEvent, setError]);

  const fetchAverageRating = useCallback(async () => {
    try {
      const avgRes = await fetch(
        `https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/event/${eventId}/average`,
      );
      const avgJson = await avgRes.json();
      setAverageRating(avgJson.data?.averageRating || null);
    } catch (err) {
      console.error("Error fetching average rating:", err);
      setAverageRating(null);
    }
  }, [eventId, setAverageRating]);

  const fetchReviews = useCallback(async () => {
    try {
      const reviewsRes = await fetch(
        `https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/event/${eventId}`,
      );
      const reviewsJson = await reviewsRes.json();
      setReviews(reviewsJson.data?.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    }
  }, [eventId, setReviews]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const payload = parseToken();
      if (payload) {
        setCurrentUserId(payload.sub || payload.userId || payload.id || null);
        setCurrentUserRole(
          payload.role || (payload.roles ? payload.roles[0] : null),
        );
      } else {
        setCurrentUserId(null);
        setCurrentUserRole(null);
      }

      await fetchEvent();
      setLoading(false);
    };

    if (eventId) fetchData();
  }, [eventId, fetchEvent]); // Add fetchEvent to dependencies

  useEffect(() => {
    if (event && event.status === "COMPLETED") {
      fetchReviews();
      fetchAverageRating();
    }
  }, [event, fetchReviews, fetchAverageRating]); // Add missing dependencies

  const myReview = reviews.find((r) => r.userId === currentUserId);

  const handleDeleteMyReview = async () => {
    if (!myReview) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Kamu harus login untuk menghapus review.");

    try {
      const res = await fetch(
        `https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/delete/${myReview.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
        alert("Review berhasil dihapus");
        await fetchAverageRating();
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

  if (!event) {
    return (
      <Card className="max-w-3xl mx-auto mt-10 p-6">
        <CardContent>
          <p className="text-red-600">Event tidak ditemukan.</p>
        </CardContent>
      </Card>
    );
  }

  if (event.status !== "COMPLETED") {
    return (
      <Card className="max-w-3xl mx-auto mt-10 p-6">
        <CardContent>
          <p className="text-yellow-700 font-semibold">
            Review hanya bisa dilihat setelah event selesai (status COMPLETED).
          </p>
        </CardContent>
      </Card>
    );
  }

  const canEditOrCreate = currentUserRole === "Attendee";

  return (
    <Card className="max-w-3xl mx-auto mt-10 p-6">
      <div className="mb-4 flex justify-between items-center">
        <Button
          onClick={() => router.push(`/event/${eventId}`)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
        >
          ← Back
        </Button>
        {averageRating !== null && (
          <div className="text-lg font-semibold">
            Rating untuk Event Ini: {averageRating.toFixed(2)}
          </div>
        )}
      </div>

      <CardHeader className="flex justify-between items-center gap-2 flex-wrap">
        <CardTitle>Review untuk Event</CardTitle>
        <div className="flex gap-2">
          {canEditOrCreate && !myReview && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => router.push(`/review/${eventId}/new`)}
            >
              Tambah Review
            </Button>
          )}

          {canEditOrCreate && myReview && (
            <>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push(`/review/${eventId}/edit`)}
              >
                Edit Review Saya
              </Button>

              <Button variant="destructive" onClick={handleDeleteMyReview}>
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
            <div
              key={review.id}
              className={`border p-4 rounded relative bg-white shadow ${
                review.userId === currentUserId
                  ? "bg-green-50 border-green-300"
                  : ""
              }`}
            >
              <div className="mb-2 font-semibold">Rating: {review.rating}</div>
              <p>{review.comment}</p>
              <p className="text-xs text-gray-400 mt-1">
                User ID: {review.userId}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
