import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-xl text-muted-foreground mb-8">
        You don&apos;t have permission to access this page.
      </p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
