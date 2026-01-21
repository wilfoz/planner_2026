export interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
  bounds?: [number, number, number, number];
}

export interface UserPermissions {
  canUpdate: boolean;
}
