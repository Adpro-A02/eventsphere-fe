/* eslint-disable-line @typescript-eslint/no-explicit-any */
export default function ReviewCard({ review }: { review: any }) {
  return (
    <div className="border p-4 rounded shadow-sm">
      <p className="font-semibold">Rating: {review.rating}</p>
      <p>{review.comment}</p>
      <p className="text-sm text-gray-500">Status: {review.status}</p>
    </div>
  );
}
