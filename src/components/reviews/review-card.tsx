import React from "react";

export interface ReviewCardProps {
  rating: number;
  comment: string;
  userId: string;
  status?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ rating, comment, userId, status }) => {
  return (
    <div className="border p-4 rounded-md shadow-sm mb-4">
      <div>
        <strong>User:</strong> {userId}
      </div>
      <div>
        <strong>Rating:</strong> {rating} / 5
      </div>
      <div>
        <strong>Comment:</strong> {comment}
      </div>
      {status && (
        <div>
          <strong>Status:</strong> {status}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
