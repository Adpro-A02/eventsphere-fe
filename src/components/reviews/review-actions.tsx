"use client";

export default function ReviewActions({ review }: { review: any }) {  /* eslint-disable-line @typescript-eslint/no-explicit-any */
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const deleteReview = async () => {
    await fetch(`/api/reviews/delete/${review.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  const flagReview = async () => {
    await fetch(`/api/reviews/${review.id}/flag`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  const cancelFlag = async () => {
    await fetch(`/api/reviews/${review.id}/cancel-flag`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  return (
    <div className="flex space-x-2 mt-2">
      <button onClick={deleteReview} className="text-red-600">
        Hapus
      </button>
      <button onClick={flagReview} className="text-yellow-600">
        Flag
      </button>
      <button onClick={cancelFlag} className="text-green-600">
        Cancel Flag
      </button>
    </div>
  );
}
