import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getExactCurrentPosition,
  formatCoordinates,
  getGoogleMapsUrl,
  formatAccuracy,
  reverseGeocodeCoords,
} from './geolocation';

describe('Geolocation Utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats coordinates and maps URL accurately', () => {
    const formatted = formatCoordinates(13.08268, 80.27072);
    expect(formatted).toBe('13.082680, 80.270720');

    const mapsUrl = getGoogleMapsUrl(13.08268, 80.27072);
    expect(mapsUrl).toBe('https://www.google.com/maps?q=13.08268,80.27072');
  });

  it('formats accuracy levels appropriately', () => {
    expect(formatAccuracy(8)).toContain('High Precision GPS');
    expect(formatAccuracy(25)).toContain('Standard GPS');
    expect(formatAccuracy(85)).toContain('Cellular');
  });

  it('returns exact location when high-accuracy GPS succeeds', async () => {
    const mockPos = {
      coords: {
        latitude: 18.52043,
        longitude: 73.85674,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as unknown as GeolocationPosition;

    const getCurrentPosition = vi.fn((success) => success(mockPos));
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
      onLine: true,
    });

    const result = await getExactCurrentPosition();

    expect(result.success).toBe(true);
    expect(result.source).toBe('gps');
    expect(result.location?.lat).toBe(18.52043);
    expect(result.location?.lng).toBe(73.85674);
    expect(result.location?.accuracy).toBe(10);
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: true })
    );
  });

  it('falls back to Tier 2 network positioning when high-accuracy GPS times out', async () => {
    const mockTimeoutError = {
      code: 3, // TIMEOUT
      message: 'GPS timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as unknown as GeolocationPositionError;

    const mockNetworkPos = {
      coords: {
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 45,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as unknown as GeolocationPosition;

    let callCount = 0;
    const getCurrentPosition = vi.fn((success, failure) => {
      callCount++;
      if (callCount === 1) {
        // High accuracy fails with timeout
        failure(mockTimeoutError);
      } else {
        // Fallback network positioning succeeds
        success(mockNetworkPos);
      }
    });

    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
      onLine: true,
    });

    const result = await getExactCurrentPosition();

    expect(result.success).toBe(true);
    expect(result.source).toBe('network');
    expect(result.location?.lat).toBe(12.9716);
    expect(result.location?.lng).toBe(77.5946);
    expect(result.warning).toContain('cellular/Wi-Fi');
    expect(callCount).toBe(2);
  });

  it('returns actionable error when user explicitly denies location permissions', async () => {
    const mockDeniedError: GeolocationPositionError = {
      code: 1, // PERMISSION_DENIED
      message: 'User denied Geolocation',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    const getCurrentPosition = vi.fn((_, failure) => failure(mockDeniedError));
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
      onLine: true,
    });

    const result = await getExactCurrentPosition();

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('PERMISSION_DENIED');
    expect(result.error).toContain('Location access is blocked by your browser');
    expect(getCurrentPosition).toHaveBeenCalledTimes(1); // Does not waste time retrying if denied
  });

  it('falls back cleanly when reverse geocoding network fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const address = await reverseGeocodeCoords(13.0827, 80.2707, 12);
    expect(address).toContain('Lat: 13.082700, Lng: 80.270700');
  });
});
