"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Review = {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  status: string;
};

export default function FlaggedReviewPage() {
  const router = useRouter();
  const [flaggedReviews, setFlaggedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFlaggedReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/flagged",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch flagged reviews");
      const json = await res.json();
      setFlaggedReviews(json.data || []);
    } catch (error) {
      console.error("Error fetching flagged reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedReviews();
  }, []);

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus review ini?")) return;
    setDeletingId(reviewId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/delete/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) {
        alert("Gagal menghapus review.");
      } else {
        setFlaggedReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Terjadi kesalahan saat menghapus review.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white transition-transform duration-200"
          onClick={() => router.push("/dashboard")}
        >
          ← Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading flagged reviews...</p>
          ) : flaggedReviews.length === 0 ? (
            <p className="text-gray-500">Belum ada reviews yang di-flag.</p>
          ) : (
            <ul className="space-y-4">
              {flaggedReviews.map((review) => (
                <li
                  key={review.id}
                  className="border rounded p-4 bg-red-50 shadow-sm relative"
                >
                  <p>
                    <strong>User ID:</strong> {review.userId}
                  </p>
                  <p>
                    <strong>Rating:</strong> {review.rating} / 5
                  </p>
                  <p>
                    <strong>Comment:</strong> {review.comment}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="text-red-600 font-semibold">
                      {review.status}
                    </span>
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                  >
                    {deletingId === review.id ? "Deleting..." : "Delete"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
