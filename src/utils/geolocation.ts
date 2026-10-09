/**
 * Akira Metrology - Production-Grade Geolocation & Reverse Geocoding Utility
 * 
 * Provides resilient, multi-tier location acquisition:
 *  - Tier 1: Hardware GPS high-accuracy fix (for precision outdoor/field checks).
 *  - Tier 2: Fast cellular / Wi-Fi IP triangulation fallback if GPS times out indoors.
 *  - Reverse geocoding to human-readable street/area/city addresses.
 *  - Explicit permission diagnostics and actionable error messages for production.
 */

export interface ExactLocation {
  lat: number;
  lng: number;
  accuracy: number; // in meters (e.g. 5m = high precision, 50m = cell network)
  altitude?: number | null;
  timestamp: number;
  address?: string;
  formattedCoords: string;
  mapsUrl: string;
}

export type GeolocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED'
  | 'INSECURE_CONTEXT';

export interface GeolocationResult {
  success: boolean;
  location: ExactLocation | null;
  error: string | null;
  errorCode?: GeolocationErrorCode;
  source: 'gps' | 'network' | 'cached' | 'none';
  warning?: string;
}

// In-memory cache for reverse-geocoded addresses to avoid redundant API queries
const addressCache = new Map<string, string>();

/**
 * Formats latitude and longitude coordinates into a standard 6-decimal string.
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Builds a universal Google Maps navigation URL for the given coordinates.
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Returns human-readable accuracy indicator with standard tolerances.
 */
export function formatAccuracy(accuracyMeters: number): string {
  const rounded = Math.round(accuracyMeters);
  if (rounded <= 15) {
    return `±${rounded}m (High Precision GPS)`;
  } else if (rounded <= 50) {
    return `±${rounded}m (Standard GPS)`;
  }
  return `±${rounded}m (Approximate / Cellular)`;
}

/**
 * Attempts to reverse geocode coordinates into a human-readable street address.
 * Uses OpenStreetMap Nominatim with an aggressive timeout and graceful fallback.
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number,
  accuracyMeters?: number
): Promise<string> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (addressCache.has(cacheKey)) {
    return addressCache.get(cacheKey)!;
  }

  const fallbackAddress = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}${
    accuracyMeters != null ? ` (±${Math.round(accuracyMeters)}m)` : ''
  }`;

  if (typeof window === 'undefined' || !navigator.onLine) {
    return fallbackAddress;
  }

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3500);

    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    window.clearTimeout(timeoutId);

    if (!res.ok) {
      return fallbackAddress;
    }

    const data = await res.json();
    if (!data || !data.address) {
      return fallbackAddress;
    }

    const addr = data.address;
    const parts: string[] = [];

    // Specific facility, building, or road
    const primary =
      addr.building ||
      addr.industrial ||
      addr.road ||
      addr.pedestrian ||
      addr.suburb ||
      addr.neighbourhood;
    if (primary) parts.push(primary);

    // City / Town / District
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state_district;
    if (city && !parts.includes(city)) parts.push(city);

    // State / Province
    if (addr.state && !parts.includes(addr.state)) {
      parts.push(addr.state);
    }

    // Postal code
    if (addr.postcode) {
      parts.push(addr.postcode);
    }

    const resolvedAddress = parts.length > 0 ? parts.join(', ') : data.display_name?.slice(0, 80) || fallbackAddress;
    addressCache.set(cacheKey, resolvedAddress);
    return resolvedAddress;
  } catch {
    // If Nominatim is unreachable, blocked, or timed out, return cleanly formatted coordinates
    return fallbackAddress;
  }
}

/**
 * Acquires the user's exact current location using a resilient multi-tier strategy.
 * 
 * Strategy:
 *  1. Checks for secure context (HTTPS) and navigator.geolocation availability.
 *  2. Tier 1: Requests high-accuracy hardware GPS with a 10s timeout.
 *  3. Tier 2: If Tier 1 times out or GPS hardware is unavailable (e.g. indoors/factory floor),
 *     automatically falls back to network/Wi-Fi positioning (enableHighAccuracy: false).
 *  4. Resolves human-readable street/area address asynchronously.
 */
export async function getExactCurrentPosition(options: {
  timeoutMs?: number;
  highAccuracyTimeoutMs?: number;
  maximumAge?: number;
} = {}): Promise<GeolocationResult> {
  const {
    timeoutMs = 12000,
    highAccuracyTimeoutMs = 8000,
    maximumAge = 30000,
  } = options;

  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      success: false,
      location: null,
      error: 'Geolocation is not supported by your browser or device.',
      errorCode: 'NOT_SUPPORTED',
      source: 'none',
    };
  }

  // Check secure context in production (non-localhost)
  if (
    typeof window !== 'undefined' &&
    window.isSecureContext === false &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return {
      success: false,
      location: null,
      error: 'Geolocation requires a secure HTTPS connection. Please access Akira over HTTPS.',
      errorCode: 'INSECURE_CONTEXT',
      source: 'none',
    };
  }

  // Tier 1: Attempt High-Accuracy Hardware GPS
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: highAccuracyTimeoutMs,
        maximumAge: 0,
      });
    });

    const address = await reverseGeocodeCoords(
      pos.coords.latitude,
      pos.coords.longitude,
      pos.coords.accuracy
    );

    return {
      success: true,
      location: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        timestamp: pos.timestamp || Date.now(),
        address,
        formattedCoords: formatCoordinates(pos.coords.latitude, pos.coords.longitude),
        mapsUrl: getGoogleMapsUrl(pos.coords.latitude, pos.coords.longitude),
      },
      error: null,
      source: 'gps',
    };
  } catch (err: unknown) {
    const geoErr = err as GeolocationPositionError | undefined;

    // If permission was explicitly denied, do NOT retry; return immediately with user guidance
    if (geoErr && geoErr.code === 1) {
      return {
        success: false,
        location: null,
        error:
          'Location access is blocked by your browser. Please allow location permissions in your browser or device settings to accurately record attendance and site visits.',
        errorCode: 'PERMISSION_DENIED',
        source: 'none',
      };
    }

    // Tier 2 Fallback: Fast Network / Wi-Fi / Cell positioning
    try {
      const fallbackPos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: timeoutMs,
          maximumAge: maximumAge,
        });
      });

      const fallbackAddress = await reverseGeocodeCoords(
        fallbackPos.coords.latitude,
        fallbackPos.coords.longitude,
        fallbackPos.coords.accuracy
      );

      return {
        success: true,
        location: {
          lat: fallbackPos.coords.latitude,
          lng: fallbackPos.coords.longitude,
          accuracy: fallbackPos.coords.accuracy,
          altitude: fallbackPos.coords.altitude,
          timestamp: fallbackPos.timestamp || Date.now(),
          address: fallbackAddress,
          formattedCoords: formatCoordinates(fallbackPos.coords.latitude, fallbackPos.coords.longitude),
          mapsUrl: getGoogleMapsUrl(fallbackPos.coords.latitude, fallbackPos.coords.longitude),
        },
        error: null,
        source: 'network',
        warning: 'Hardware GPS satellite lock timed out; captured approximate location via cellular/Wi-Fi network.',
      };
    } catch (fallbackErr: unknown) {
      const finalErr = fallbackErr as GeolocationPositionError | undefined;
      const errorCode: GeolocationErrorCode =
        finalErr?.code === 1
          ? 'PERMISSION_DENIED'
          : finalErr?.code === 2
            ? 'POSITION_UNAVAILABLE'
            : finalErr?.code === 3
              ? 'TIMEOUT'
              : 'NOT_SUPPORTED';

      const errorMsg =
        finalErr?.code === 1
          ? 'Location access was denied. Please allow location permissions in browser settings.'
          : finalErr?.code === 2
            ? 'Location is temporarily unavailable on this device. Please check GPS or network connection.'
            : finalErr?.code === 3
              ? 'Location acquisition timed out. Please verify device GPS is enabled and try again.'
              : 'Unable to capture location coordinates.';

      return {
        success: false,
        location: null,
        error: errorMsg,
        errorCode,
        source: 'none',
      };
    }
  }
}
