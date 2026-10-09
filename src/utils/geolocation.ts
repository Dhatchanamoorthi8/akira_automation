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
/**
 * Attempts to acquire approximate location via client IP network triangulation.
 * Useful when mobile browser blocks hardware GPS due to HTTP or when satellite lock is unavailable indoors.
 */
async function getNetworkIpLocation(): Promise<ExactLocation | null> {
  if (typeof window === 'undefined' || !navigator.onLine) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      const lat = data.latitude;
      const lng = data.longitude;
      const locality = [data.locality, data.city, data.principalSubdivision, data.countryName]
        .filter(Boolean)
        .join(', ');
      return {
        lat,
        lng,
        accuracy: 1000,
        timestamp: Date.now(),
        address: locality ? `${locality} (Approximate Network Location)` : 'Approximate Network Location',
        formattedCoords: formatCoordinates(lat, lng),
        mapsUrl: getGoogleMapsUrl(lat, lng),
      };
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

/**
 * Acquires the user's exact current location using a resilient multi-tier strategy.
 * 
 * Strategy:
 *  1. Checks for secure context (HTTPS) or falls back to network IP location for mobile dev.
 *  2. Tier 1: Requests high-accuracy hardware GPS with recent fix tolerance.
 *  3. Tier 2: If Tier 1 times out or GPS hardware is unavailable indoors,
 *     automatically falls back to network/Wi-Fi positioning (enableHighAccuracy: false).
 *  4. Tier 3: If hardware positioning is unavailable, falls back to IP-based location.
 *  5. Resolves human-readable street/area address asynchronously.
 */
export async function getExactCurrentPosition(options: {
  timeoutMs?: number;
  highAccuracyTimeoutMs?: number;
  maximumAge?: number;
} = {}): Promise<GeolocationResult> {
  const {
    timeoutMs = 15000,
    highAccuracyTimeoutMs = 10000,
    maximumAge = 30000,
  } = options;

  // Insecure context check (e.g. testing mobile over local network HTTP: http://192.168.x.x:3000)
  if (
    typeof window !== 'undefined' &&
    window.isSecureContext === false &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    const ipLocation = await getNetworkIpLocation();
    if (ipLocation) {
      return {
        success: true,
        location: ipLocation,
        error: null,
        source: 'network',
        warning: 'Mobile browsers require HTTPS for hardware GPS. Used approximate network location.',
      };
    }

    return {
      success: false,
      location: null,
      error: 'Mobile browsers require a secure HTTPS connection for GPS hardware access. Please open over HTTPS.',
      errorCode: 'INSECURE_CONTEXT',
      source: 'none',
    };
  }

  if (typeof window === 'undefined' || !navigator.geolocation) {
    const ipLocation = await getNetworkIpLocation();
    if (ipLocation) {
      return {
        success: true,
        location: ipLocation,
        error: null,
        source: 'network',
        warning: 'Hardware GPS not supported; acquired approximate network location.',
      };
    }

    return {
      success: false,
      location: null,
      error: 'Geolocation is not supported by your browser or device.',
      errorCode: 'NOT_SUPPORTED',
      source: 'none',
    };
  }

  // Tier 1: Attempt High-Accuracy Hardware GPS
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: highAccuracyTimeoutMs,
        maximumAge: Math.min(maximumAge, 15000), // Permit recent 15s fix for fast mobile lock
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
          'Location access is blocked by your browser. Please tap the lock/settings icon in your browser address bar and allow Location permissions.',
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
          maximumAge: 60000,
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
      // Tier 3 Fallback: IP-based network location if hardware/Wi-Fi positioning timed out
      const ipLocation = await getNetworkIpLocation();
      if (ipLocation) {
        return {
          success: true,
          location: ipLocation,
          error: null,
          source: 'network',
          warning: 'Hardware GPS unavailable indoors; captured approximate site location via network.',
        };
      }

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
          ? 'Location access was denied. Please allow location permissions in your mobile browser settings.'
          : finalErr?.code === 2
            ? 'Location is temporarily unavailable. Please verify your phone GPS toggle is turned ON.'
            : finalErr?.code === 3
              ? 'Location acquisition timed out. Please check that GPS is enabled and try again.'
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
