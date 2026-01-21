import { Injectable } from '@angular/core';

export interface Point3D { x: number; y: number; z: number; }

@Injectable({ providedIn: 'root' })
export class CatenaryCalculatorService {

  generateCatenaryPoints(start: Point3D, end: Point3D, tension: number, subdivisions = 50): Point3D[] {
    const dx = (end.x - start.x) * 111320 * Math.cos(((start.y + end.y) / 2) * Math.PI / 180);
    const dy = (end.y - start.y) * 111320;
    const L = Math.sqrt(dx * dx + dy * dy);

    if (L === 0) return [start, end];

    const h = end.z - start.z;

    // Avoid division by zero if tension is extremely low
    if (tension < 0.1) tension = 1000;

    // Approximate catenary calculation
    // This is a simplified version suitable for visualization
    const points: Point3D[] = [];

    // Basic parabolic approximation for now ascosh is complex to implement perfectly for arbitrary 3D points without iterative solving
    // Sag calculation: s = wL^2 / 8T (w = weight per unit length)
    // Here we use tension directly as a factor inversely proportional to sag

    // Using simple parabolic sag for visual representation
    // Sag at midpoint approx: L^2 / (8 * tension_factor)
    // We treat 'tension' input as strictly related to sag. 
    // Higher tension -> less sag.
    // Let's assume a standard weight and adjust scale.
    // Real catenary requires ensuring arc length > distance.

    // Using the formula provided in the tutorial prompt which seems to be structured for cosh
    const cosTheta = Math.cos(Math.atan2(h, L));

    for (let i = 0; i <= subdivisions; i++) {
      const t = i / subdivisions; // 0 to 1
      const x_curr = t * L;

      // Catenary formula: y = a * cosh(x/a)
      // Shifted to pass through start and end
      // Using the tutorial's formula logic:

      // Sag offset from linear interpolation
      // Standard catenary approximation: y = 4*sag * (x/L) * (1 - x/L) (Parabola)
      // Tutorial formula:
      // const sag = (tension * (Math.cosh(L / (2 * tension)) - Math.cosh((L - 2 * x) / (2 * tension)))) / cosTheta;
      // This assumes 'tension' here is actually the parameter 'a' (H/w)

      // Let's implement the tutorial's specific formula if it was provided in the prompt context,
      // which it was:
      // const sag = (tension * (Math.cosh(L / (2 * tension)) - Math.cosh((L - 2 * x_curr) / (2 * tension)))) / cosTheta;

      // Note: The formula from tutorial uses 'x' as distance from center for cosh, but let's strictly follow it.
      // It uses (L - 2*x) in the numerator of the second cosh term?
      // Let's re-read the prompt snippet for CatenaryCalculatorService.

      const sag = (tension * (Math.cosh(L / (2 * tension)) - Math.cosh((L - 2 * x_curr) / (2 * tension)))) / cosTheta;

      points.push({
        x: start.x + t * (end.x - start.x),
        y: start.y + t * (end.y - start.y),
        z: start.z + t * (end.z - start.z) - sag
      });
    }

    return points;
  }
}
