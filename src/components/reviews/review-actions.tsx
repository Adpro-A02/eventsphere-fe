"use client";

import React from "react";

interface ReviewActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onFlag?: () => void;
  onCancelFlag?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canFlag?: boolean;
  canCancelFlag?: boolean;
}

const ReviewActions: React.FC<ReviewActionsProps> = ({
  onEdit,
  onDelete,
  onFlag,
  onCancelFlag,
  canEdit = false,
  canDelete = false,
  canFlag = false,
  canCancelFlag = false,
}) => {
  return (
    <div className="flex gap-2 mt-2">
      {canEdit && (
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Edit
        </button>
      )}
      {canDelete && (
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Hapus
        </button>
      )}
      {canFlag && (
        <button
          onClick={onFlag}
          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Flag
        </button>
      )}
      {canCancelFlag && (
        <button
          onClick={onCancelFlag}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Cancel Flag
        </button>
      )}
    </div>
  );
};

export default ReviewActions;
