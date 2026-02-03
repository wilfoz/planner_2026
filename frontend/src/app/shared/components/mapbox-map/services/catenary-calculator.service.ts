import { Injectable } from '@angular/core';

export interface Point3D { x: number; y: number; z: number; }

@Injectable({ providedIn: 'root' })
export class CatenaryCalculatorService {

  generateCatenaryPoints(start: Point3D, end: Point3D, tension: number, subdivisions = 60): Point3D[] {
    const dx = (end.x - start.x) * 111320 * Math.cos(((start.y + end.y) / 2) * Math.PI / 180);
    const dy = (end.y - start.y) * 111320;
    const L = Math.sqrt(dx * dx + dy * dy);

    if (L === 0) return [start, end];

    // Avoid division by zero
    if (tension < 100) tension = 100;

    // Parabolic approximation for catenary sag
    // Formula: sag = w * L^2 / (8 * T)
    // Using ACSR conductor typical weight (~1.8 kg/m for 500kV lines)
    const cableWeightPerMeter = 1.8 * 9.81; // N/m (weight force)
    const maxSag = (cableWeightPerMeter * L * L) / (8 * tension);

    // Clamp max sag to realistic range (2-6% of span length)
    const minSag = Math.max(3, L * 0.015); // minimum 3m or 1.5% of span
    const maxAllowedSag = Math.min(60, L * 0.05); // max 60m or 5% of span
    const clampedSag = Math.min(Math.max(maxSag, minSag), maxAllowedSag);

    const points: Point3D[] = [];

    for (let i = 0; i <= subdivisions; i++) {
      const t = i / subdivisions; // 0 to 1

      // Standard parabolic sag formula: 4 * sag * t * (1 - t)
      // Maximum sag occurs at t = 0.5
      const sagAtPoint = 4 * clampedSag * t * (1 - t);

      points.push({
        x: start.x + t * (end.x - start.x),
        y: start.y + t * (end.y - start.y),
        z: start.z + t * (end.z - start.z) - sagAtPoint
      });
    }

    return points;
  }

  metersToLng(meters: number, lat: number): number {
    return meters / (111320 * Math.cos(lat * Math.PI / 180));
  }

  metersToLat(meters: number): number {
    return meters / 111320;
  }

  lngToMeters(lngDiff: number, lat: number): number {
    return lngDiff * 111320 * Math.cos(lat * Math.PI / 180);
  }

  latToMeters(latDiff: number): number {
    return latDiff * 111320;
  }

  getDistance(p1: Point3D, p2: Point3D): number {
    const dx = this.lngToMeters(p2.x - p1.x, p1.y);
    const dy = this.latToMeters(p2.y - p1.y);
    return Math.sqrt(dx * dx + dy * dy);
  }
}
