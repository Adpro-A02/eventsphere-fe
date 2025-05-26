import { register, httpRequestTotal, httpRequestDuration } from "@/lib/metrics";
import { NextResponse } from "next/server";

// Simulate some metrics for testing
function generateTestMetrics() {
  // Simulate some HTTP requests
  httpRequestTotal.inc({ method: "GET", route: "/", status_code: "200" }, 10);
  httpRequestTotal.inc(
    { method: "GET", route: "/events", status_code: "200" },
    5,
  );
  httpRequestTotal.inc(
    { method: "POST", route: "/api/auth/login", status_code: "200" },
    3,
  );
  httpRequestTotal.inc(
    { method: "GET", route: "/api/events", status_code: "404" },
    1,
  );

  // Simulate some response times
  httpRequestDuration.observe(
    { method: "GET", route: "/", status_code: "200" },
    0.1,
  );
  httpRequestDuration.observe(
    { method: "GET", route: "/", status_code: "200" },
    0.2,
  );
  httpRequestDuration.observe(
    { method: "GET", route: "/events", status_code: "200" },
    0.5,
  );
  httpRequestDuration.observe(
    { method: "POST", route: "/api/auth/login", status_code: "200" },
    1.2,
  );
}

export async function GET() {
  try {
    // Generate test metrics (remove this in production)
    generateTestMetrics();

    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      headers: {
        "Content-Type": register.contentType,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate metrics" },
      { status: 500 },
    );
  }
}
