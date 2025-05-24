"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreateReviewPage() {
  const { eventId } = useParams() as { eventId: string };
  const router = useRouter();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.sub);
    }
  }, []);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8080/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        eventId,
        userId,
        rating,
        comment,
      }),
    });

    if (res.ok) {
      router.push(`/review/${eventId}`);
    } else {
      alert("Gagal membuat review.");
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 p-6">
      <CardHeader>
        <CardTitle>Buat Review</CardTitle>
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
        <Button onClick={handleSubmit} className="bg-green-600 text-white">
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}
