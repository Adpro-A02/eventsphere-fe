"use client";

import React, { useEffect, useState } from "react";
import apiEvent from "@/libs/axios/apiEvent"; 
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  location: string;
  description: string;
}

const OrganizerEventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    apiEvent
      .get("/api/events/organizer/my-events")
      .then((res) => {
        console.log("Response data:", res.data.data);
        const eventsArray = res.data.data.events;
        if (Array.isArray(eventsArray)) {
          setEvents(eventsArray);
        } else {
          setEvents([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil data event organizer");
        setLoading(false);
      });
  }, []);


  if (loading) return <p>Loading events...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (events.length === 0) return <p>Tidak ada event yang dikelola.</p>;

return (
  <div>
    <h1 className="text-2xl font-bold mb-6">Event yang Anda Kelola:</h1>
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((e) => (
        <li
          key={e.id}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <button
            onClick={() => router.push(`/review/${e.id}/organizer`)}
            className="text-blue-700 font-semibold text-lg hover:underline mb-3 text-left"
          >
            {e.title}
          </button>

          <div className="text-gray-700 mb-2">
            <span className="font-semibold">Lokasi:</span> {e.location}
          </div>

          <div className="text-gray-600 flex-grow">
            <span className="font-semibold">Deskripsi:</span>{" "}
            {e.description.length > 100
              ? e.description.substring(0, 100) + "..."
              : e.description}
          </div>
        </li>
      ))}
    </ul>
  </div>
);
}

export default OrganizerEventsPage;
