export interface Span {
  id: string;
  projectId: string;
  towerStartId: string;
  towerEndId: string;
  spanName: string;
  spanLength: number;
  tension: number;
  cablePhases: number;
  cableColor: string;
  heightStart: number;
  heightEnd: number;
}
