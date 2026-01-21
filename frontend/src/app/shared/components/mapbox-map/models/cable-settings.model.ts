export interface CableAnchor {
  id: string;
  label: string;
  horizontalOffset: number;
  verticalRatio: number;
  color: string;
  width: number;
  enabled: boolean;
}

export interface CableSettings {
  tension: number;
  globalOpacity: number;
  towerVerticalOffset: number;
  anchors: CableAnchor[];
}
