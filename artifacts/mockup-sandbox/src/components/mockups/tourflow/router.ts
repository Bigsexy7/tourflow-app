import { useEffect, useState } from "react";

export type Route =
  | { name: "root" }
  | { name: "cockpit" }
  | { name: "guest"; id: string };

export function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === "/" || hash === "") return { name: "root" };
  const guestMatch = hash.match(/^\/guest\/(.+)$/);
  if (guestMatch) return { name: "guest", id: guestMatch[1] };
  if (hash === "/cockpit") return { name: "cockpit" };
  return { name: "root" };
}

export function navigate(route: Route): void {
  switch (route.name) {
    case "cockpit":
      window.location.hash = "/cockpit";
      break;
    case "guest":
      window.location.hash = `/guest/${route.id}`;
      break;
    case "root":
      window.location.hash = "/";
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
