"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Event = {
  id: string;
  title: string;
  description?: string;
  date?: string;
};

export default function OrganizerEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login untuk melihat halaman ini.");
      router.push("/login");
      return;
    }

    const fetchOrganizerEvents = async () => {
      try {
        const res = await fetch(
          "http://localhost:8081/api/events/organizer/my-events",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Gagal mengambil data event");

        const json = await res.json();
        setEvents(json.data?.events || []);
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data event. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerEvents();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6">
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <Button
        onClick={() => router.push("/dashboard")}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
      >
        ← Back to Dashboard
      </Button>

      <h1 className="text-2xl font-bold mb-6">Event yang Anda Kelola: </h1>

      {events.length === 0 && (
        <p className="text-gray-600">Anda belum mengelola event apapun.</p>
      )}

      {events.map((event) => (
        <Card
          key={event.id}
          className="cursor-pointer"
          onClick={() => router.push(`/review/${event.id}/organizer`)}
        >
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {event.description && <p className="mb-2">{event.description}</p>}
            {event.date && (
              <p className="text-sm text-gray-500">
                Tanggal: {new Date(event.date).toLocaleDateString()}
              </p>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/review/${event.id}/organizer`);
              }}
              className="mt-3"
            >
              Lihat Review
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
