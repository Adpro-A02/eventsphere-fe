"use client";

import { useState, useEffect } from "react";

interface Advertisement {
  id: string;
  title: string;
  description: string;
  advertiser_name: string;
  status: string;
  budget: number;
  start_date: string;
  end_date: string;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch("/api/v1/advertisements");
        const data = await response.json();
        setAds(data.data || []);
      } catch (error) {
        console.error("Error:", error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manajemen Iklan</h1>

      <div className="grid gap-4">
        {ads.length === 0 ? (
          <p className="text-gray-500">No advertisements found.</p>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-2">{ad.title}</h2>
              <p className="text-gray-600 mb-4">{ad.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Advertiser:</span>{" "}
                  {ad.advertiser_name}
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      ad.status === "active"
                        ? "bg-green-100 text-green-800"
                        : ad.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ad.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Budget:</span> Rp{" "}
                  {ad.budget?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Period:</span> {ad.start_date} -{" "}
                  {ad.end_date}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
