import { useRouter } from "next/router"
import { useEffect } from "react"

export const gaTrackingId = process.env.NEXT_PUBLIC_GA_ID!;
/*
 * this should be called in _app.tsx
 */
export const useInitTelemetry = () => {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(gaTrackingId, url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
}

const pageview = (gaTrackingId: string, url: string) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("GA pageview", url);
    return;
  }
  if (!gaTrackingId) {
    console.warn("No GA tracking ID found");
    return;
  }

  try {
    (window as any)?.gtag("config", gaTrackingId, {
      page_path: url,
      debug_mode: true,
    });
  } catch (e) {
    console.error("Error sending pageview to Analytics server", e);
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (action: string, payload: {
  category: string;
  label: string;
  value?: string | number;
}) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("GA event", action, payload);
    return;
  }
  try {
    (window as any).gtag("event", action, {
      event_category: payload.category,
      event_label: payload.label,
      value: payload.value,
    });
  } catch (e) {
    console.error("Error sending event to Analytics server", e);
  }
};