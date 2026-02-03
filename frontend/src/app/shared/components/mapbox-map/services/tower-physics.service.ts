import { Injectable, inject } from '@angular/core';
import { TowerMap } from '../models';
import { CatenaryCalculatorService } from './catenary-calculator.service';

export interface Point3D {
  lng: number;
  lat: number;
  alt: number;
}

@Injectable({ providedIn: 'root' })
export class TowerPhysicsService {
  private catenary = inject(CatenaryCalculatorService);

  /**
   * Calculates the bearing for a tower in a sequence.
   * Returns angle in degrees CW from North (Mapbox style).
   */
  calculateTowerBearing(index: number, data: TowerMap[]): number {
    const d = data[index];
    if (!d) return 0;

    const prev = data[index - 1];
    const next = data[index + 1];

    if (prev && next) {
      const b1 = this.calculateBearing(prev.lat, prev.lng, d.lat, d.lng);
      const b2 = this.calculateBearing(d.lat, d.lng, next.lat, next.lng);

      // Average bearing (bisector)
      let diff = b2 - b1;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      return (b1 + diff / 2 + 360) % 360;
    } else if (prev) {
      return this.calculateBearing(prev.lat, prev.lng, d.lat, d.lng);
    } else if (next) {
      return this.calculateBearing(d.lat, d.lng, next.lat, next.lng);
    }

    return 0;
  }

  /**
   * Calculates the 3D position of an anchor point, respecting tower rotation.
   */
  calculateAnchorPosition(
    tower: TowerMap,
    bearing: number,
    hOffset: number,
    vRatio: number,
    vOffset: number,
    towerVerticalOffset: number,
    terrainAlt: number
  ): Point3D {
    // The cross-arms (mísulas) are perpendicular to the tower's "front" direction (bearing)
    // So we apply the offset 'h' along the axis (bearing + 90)
    const crossArmBearingRad = (bearing + 90) * (Math.PI / 180);

    const metersX = hOffset * Math.sin(crossArmBearingRad);
    const metersY = hOffset * Math.cos(crossArmBearingRad);

    return {
      lng: tower.lng + this.catenary.metersToLng(metersX, tower.lat),
      lat: tower.lat + this.catenary.metersToLat(metersY),
      alt: terrainAlt + tower.height * vRatio + vOffset + towerVerticalOffset
    };
  }

  /**
   * Calculates local offsets (h: horizontal, v: vertical height from ground)
   * from a global point relative to a tower.
   */
  calculateLocalOffset(
    tower: TowerMap,
    bearing: number,
    point: Point3D,
    terrainAlt: number,
    towerVerticalOffset: number
  ): { h: number; v: number } {
    // 1. Calculate distance from tower to point
    const dist = this.catenary.getDistance(
      { x: tower.lng, y: tower.lat, z: 0 },
      { x: point.lng, y: point.lat, z: 0 }
    );

    // 2. Calculate bearing from tower to point
    const angleToPoint = this.calculateBearing(tower.lat, tower.lng, point.lat, point.lng);

    // 3. Calculate difference in angle relative to tower's "front" (bearing)
    // Tower cross-arms are at bearing + 90
    // We want 'h' to be the projection onto the cross-arm axis.
    // Relative angle = angleToPoint - (bearing + 90) ? 
    // Wait, let's reverse the anchor logic:
    // metersX = h * sin(bearing + 90)
    // metersY = h * cos(bearing + 90)

    // Easier: Project vector (Tower->Point) onto the Cross-Arm Unit Vector.
    // Cross-Arm angle = bearing + 90
    const crossArmRad = ((bearing + 90) * Math.PI) / 180;

    // Vector T->P in meters
    // We can assume dist is small enough for flat approximation or use diff in meters
    const dLat = point.lat - tower.lat;
    const dLng = point.lng - tower.lng;
    const metersX_Global = this.catenary.lngToMeters(dLng, tower.lat);
    const metersY_Global = this.catenary.latToMeters(dLat);

    // Rotate this vector by -(bearing+90) to align with X axis?
    // Or just project: Dot Product with CrossArm vector
    // CrossArm Vector: X = sin(rad), Y = cos(rad)  (Note: Mapbox bearing 0 is North?)
    // Bearing 0 = North (Up). 90 = East (Right).
    // X axis (East) corresponds to lng. Y axis (North) corresponds to lat.
    // sin(0)=0, cos(0)=1 -> North. Correct.

    const unitX = Math.sin(crossArmRad);
    const unitY = Math.cos(crossArmRad);

    const h = (metersX_Global * unitX) + (metersY_Global * unitY);

    // 4. Calculate V (Distance FROM TOP)
    // We want to return the positive distance *down* from the top.
    // Top Absolute Elevation = terrainAlt + towerVerticalOffset + tower.height
    // Point Elevation = point.alt
    // Dist From Top = Top - Point

    const towerTop = terrainAlt + towerVerticalOffset + (tower.height || 0);
    const v = towerTop - point.alt;

    return { h, v };
  }

  calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lng2 - lng1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return (toDeg(θ) + 360) % 360;
  }
}
