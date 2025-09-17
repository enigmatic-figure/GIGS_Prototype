/**
 * Geospatial utilities based on the Haversine formula.
 *
 * Provides helpers to calculate distances between coordinates and determine
 * whether a destination falls within a permitted travel radius.
 */

const EARTH_RADIUS_KM = 6371; // Average radius of Earth in kilometres

export type Coordinates = {
  lat: number;
  lng: number;
};

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * Calculates the Haversine distance between two coordinate pairs.
 *
 * @param origin - The starting latitude and longitude.
 * @param destination - The destination latitude and longitude.
 * @returns The distance in kilometres.
 */
export function haversineDistance(origin: Coordinates, destination: Coordinates): number {
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);

  const originLatRad = toRadians(origin.lat);
  const destinationLatRad = toRadians(destination.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originLatRad) *
      Math.cos(destinationLatRad) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Determines whether a coordinate pair is within a maximum travel radius.
 *
 * @param origin - The starting coordinates.
 * @param destination - The destination coordinates.
 * @param maxDistanceKm - The maximum acceptable distance in kilometres.
 * @returns True if the destination is within range.
 */
export function isWithinRadius(
  origin: Coordinates,
  destination: Coordinates,
  maxDistanceKm: number
): boolean {
  if (!Number.isFinite(maxDistanceKm) || maxDistanceKm <= 0) {
    return false;
  }

  return haversineDistance(origin, destination) <= maxDistanceKm;
}
