import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500 hover:bg-green-600";
      case "DRAFT":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "CANCELLED":
        return "bg-red-500 hover:bg-red-600";
      case "COMPLETED":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Badge className={cn(getStatusColor(status), className)}>{status}</Badge>
  );
}
