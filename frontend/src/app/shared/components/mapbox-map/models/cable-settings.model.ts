export interface CableAnchorConfig {
  id: string;
  label: string;
  phase?: string; // Phase A, B, C, Para-raio, etc.
  h: number;      // Horizontal offset in meters (negative = left, positive = right)
  vRatio: number; // Vertical position as ratio of tower height (0-1)
  vOffset?: number; // Additional vertical offset in meters
  color: string;
  width: number;  // Line width in pixels
  enabled: boolean;
  manualAnchorName?: string; // Explicit anchor name from Lab 3D
}

export interface ModelTransform {
  displayName?: string;
  scale: [number, number, number];    // x, y, z
  rotation: [number, number, number]; // x, y, z
  offset: [number, number, number];   // x, y, z (z is usually displacement to ground origin)
  intrinsicHeight: number;            // The natural height of the model in its own coordinate system
}

export interface CableSettings {
  tension: number;
  globalOpacity: number;
  towerVerticalOffset: number;
  anchors: CableAnchorConfig[];
  customModelUrl?: string;
  customTexture?: string;
  modelConfigs?: Record<string, ModelTransform>;
}
