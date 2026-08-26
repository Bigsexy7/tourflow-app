import { useEffect, useState } from "react";

export type Route =
  | { name: "root" }
  | { name: "cockpit" }
  | { name: "guest"; id: string };

export function parseHash(): Route {
  if (typeof window === "undefined") return { name: "root" };
  const rawHash = window.location.hash || "";
  const cleaned = rawHash.replace(/^#\/?/, "");

  if (!cleaned || cleaned === "/") return { name: "root" };
  
  const guestMatch = cleaned.match(/^guest\/(.+)$/);
  if (guestMatch) {
    return { name: "guest", id: decodeURIComponent(guestMatch[1]) };
  }
  
  if (cleaned.startsWith("cockpit")) {
    return { name: "cockpit" };
  }

  return { name: "root" };
}

export function navigate(route: Route): void {
  if (typeof window === "undefined") return;
  switch (route.name) {
    case "cockpit":
      window.location.hash = "#/cockpit";
      break;
    case "guest":
      window.location.hash = `#/guest/${encodeURIComponent(route.id)}`;
      break;
    case "root":
      window.location.hash = "#/";
      break;
  }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}