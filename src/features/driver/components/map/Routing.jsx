import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const decodePolyline = (encoded) => {
  const points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let shift = 0, result = 0, byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
};

const Routing = ({ from, to, color = "#4361ee", dashed = false }) => {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    if (!from || !to) return;

    let cancelled = false;

    const fetchRoute = async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${from[1]},${from[0]};${to[1]},${to[0]}` +
          `?overview=full&geometries=polyline`;

        const res  = await fetch(url);
        const data = await res.json();

        if (cancelled) return;
        if (data.code !== "Ok" || !data.routes?.[0]) return;

        const coords = decodePolyline(data.routes[0].geometry);

        // Remove previous layers
        layersRef.current.forEach((l) => {
          try { map.removeLayer(l); } catch {}
        });
        layersRef.current = [];

        // White outline for depth
        const outline = L.polyline(coords, {
          color: "#ffffff",
          weight: 9,
          opacity: 0.55,
          lineCap: "round",
          lineJoin: "round",
        });

        // Coloured route on top
        const route = L.polyline(coords, {
          color,
          weight: 5,
          opacity: 1,
          dashArray: dashed ? "10 7" : null,
          lineCap: "round",
          lineJoin: "round",
        });

        // Add to map in order: outline first, route on top
        outline.addTo(map);
        route.addTo(map);

        // Bring both to front so they sit above the tile layer
        outline.bringToFront();
        route.bringToFront();

        layersRef.current = [outline, route];
      } catch (err) {
        console.warn("Route fetch failed:", err);
      }
    };

    fetchRoute();

    return () => {
      cancelled = true;
      layersRef.current.forEach((l) => {
        try { map.removeLayer(l); } catch {}
      });
      layersRef.current = [];
    };
  }, [from?.[0], from?.[1], to?.[0], to?.[1], map, color, dashed]);

  return null;
};

export default Routing;