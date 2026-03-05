"use client";

interface TrackEventPayload {
  eventName: string;
  metadata?: Record<string, unknown>;
  path?: string;
}

function currentPath(override?: string): string {
  if (override) return override;
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

async function send(payload: Record<string, unknown>) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
  }
}

export function trackPageView(path?: string): void {
  void send({
    type: "page_view",
    path: currentPath(path),
  });
}

export function trackEvent({ eventName, metadata, path }: TrackEventPayload): void {
  void send({
    type: "event",
    eventName,
    metadata: metadata || {},
    path: currentPath(path),
  });
}
