import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthErrorProps {
  message: string;
}

export function AuthError({ message }: AuthErrorProps) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
