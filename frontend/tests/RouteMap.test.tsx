import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouteMap } from '../src/components/Map/RouteMap';
import type { Route } from '../src/api/navigation';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position }: { children: React.ReactNode; position: [number, number] }) => (
    <div data-testid="marker" data-position={position.join(',')}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({
    fitBounds: vi.fn(),
  }),
}));

// Mock polyline decoder
vi.mock('../src/utils/polyline', () => ({
  decodePolyline: vi.fn((encoded: string) => {
    if (!encoded) return [];
    // Return mock coordinates for testing
    return [
      [35.6812, 139.7671],
      [35.2474, 139.1549],
      [35.2074, 139.1028],
      [35.2321, 139.1067],
    ];
  }),
}));

const mockRouteWithWaypoints: Route = {
  origin: '東京駅',
  destination: '箱根湯本駅',
  waypoints: ['小田原城', '芦ノ湖'],
  waypoint_coords: [
    { latitude: 35.2474, longitude: 139.1549 },
    { latitude: 35.2074, longitude: 139.1028 },
  ],
  duration_seconds: '5400',
  distance_meters: 95000,
  encoded_polyline: 'abc123',
  google_maps_url: 'https://www.google.com/maps/dir/',
};

const mockRouteWithoutWaypoints: Route = {
  origin: '東京駅',
  destination: '横浜駅',
  waypoints: [],
  waypoint_coords: [],
  duration_seconds: '3600',
  distance_meters: 50000,
  encoded_polyline: 'def456',
  google_maps_url: 'https://www.google.com/maps/dir/',
};

describe('RouteMap', () => {
  it('should render map container', () => {
    render(<RouteMap route={null} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('should render waypoint markers when route has waypoints', () => {
    render(<RouteMap route={mockRouteWithWaypoints} />);

    const markers = screen.getAllByTestId('marker');
    // origin + 2 waypoints + destination = 4 markers
    expect(markers.length).toBe(4);
  });

  it('should display waypoint names in popups', () => {
    render(<RouteMap route={mockRouteWithWaypoints} />);

    const popups = screen.getAllByTestId('popup');
    const popupTexts = popups.map((p) => p.textContent);

    expect(popupTexts).toContain('小田原城');
    expect(popupTexts).toContain('芦ノ湖');
  });

  it('should render only origin and destination markers when no waypoints', () => {
    render(<RouteMap route={mockRouteWithoutWaypoints} />);

    const markers = screen.getAllByTestId('marker');
    // origin + destination = 2 markers
    expect(markers.length).toBe(2);
  });

  it('should render polyline when route exists', () => {
    render(<RouteMap route={mockRouteWithWaypoints} />);
    expect(screen.getByTestId('polyline')).toBeInTheDocument();
  });
});
