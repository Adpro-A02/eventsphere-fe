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
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.sub);
      } catch {
        setUserId(null);
      }
    }
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        const res = await fetch(
          `http://ec2-52-206-2-172.compute-1.amazonaws.com/api/events/${eventId}`,
        );
        if (!res.ok) throw new Error("Gagal fetch event");
        const data = await res.json();

        setOrganizerId(data.user_id || data.data?.user_id || null);
      } catch (e) {
        setOrganizerId(null);
        console.error("Error fetch event:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async () => {
    if (!userId) {
      alert("Anda harus login terlebih dahulu.");
      return;
    }
    if (!organizerId) {
      alert("Tidak dapat menentukan organizer event.");
      return;
    }

    const now = new Date().toISOString();

    const payload = {
      eventId,
      organizerId,
      userId,
      rating,
      comment,
      createdDate: now,
      updatedDate: now,
    };

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "https://personal-alys-gilbertkristiaan-f3b1cb41.koyeb.app/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        router.push(`/review/${eventId}`);
      } else {
        alert(
          "Gagal membuat review. Anda sudah pernah membuat review untuk event ini.",
        );
      }
    } catch {
      alert("Terjadi kesalahan saat membuat review.");
    }
  };

  if (loading) {
    return (
      <Card className="max-w-xl mx-auto mt-10 p-6">
        <CardHeader>
          <CardTitle>Memuat data event...</CardTitle>
        </CardHeader>
        <CardContent>Mohon tunggu...</CardContent>
      </Card>
    );
  }

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
