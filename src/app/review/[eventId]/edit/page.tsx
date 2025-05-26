"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function EditReviewPage() {
  const { eventId } = useParams() as { eventId: string };
  const router = useRouter();

  const [reviewId, setReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const userId = payload?.sub;

    if (!userId) return;

    fetch(
      `https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/event/${eventId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        const existing = data.data.reviews.find(
          /* eslint-disable-next-line */
          (r: any) => r.userId === userId,
        );
        if (existing) {
          setReviewId(existing.id);
          setRating(existing.rating);
          setComment(existing.comment);
        }
      });
  }, [eventId]);

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    if (!reviewId) return;

    const res = await fetch(
      `https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews/update/${reviewId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment,
        }),
      },
    );

    if (res.ok) {
      router.push(`/review/${eventId}`);
    } else {
      alert("Gagal update review.");
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 p-6">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Edit Review</CardTitle>
        <Button
          variant="outline"
          onClick={() => router.push(`/review/${eventId}`)}
          className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors duration-200"
        >
          ← Back to Reviews
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          placeholder="Rating (1-5)"
        />
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tulis komentar..."
        />
        <Button onClick={handleUpdate} className="bg-blue-600 text-white">
          Update
        </Button>
      </CardContent>
    </Card>
  );
}
