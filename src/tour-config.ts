import { CurvePath, LineCurve3, CubicBezierCurve3, Vector3 } from "three";

export const tourSettings = {
  laps: 2,
  wheelRadius: 0.38,
  // Y-up coordinates. This loop uses the unobstructed forecourt around the main block.
  route: { left: -9.2, right: 9.2, front: 8.8, rear: -20.1, radius: 3 },
  poses: [
    { at: 0, position: [43, 32, 48], target: [-2, 3, 0], fov: 40 },
    { at: 0.5, position: [25, 15, 32], target: [0, 5, 1], fov: 43 },
    { at: 1, position: [30, 55, 35], target: [-2, 0, -2], fov: 45 },
  ],
} as const;

export function createDrivingRoute() {
  const {
    left: l,
    right: r,
    front: f,
    rear: b,
    radius: d,
  } = tourSettings.route;
  const k = 0.5522847498 * d;
  const v = (x: number, z: number) => new Vector3(x, 0, z);
  const path = new CurvePath<Vector3>();
  const line = (a: Vector3, c: Vector3) => path.add(new LineCurve3(a, c));
  const corner = (a: Vector3, c: Vector3, e: Vector3, g: Vector3) =>
    path.add(new CubicBezierCurve3(a, c, e, g));
  line(v(l + d, f), v(r - d, f));
  corner(v(r - d, f), v(r - d + k, f), v(r, f - d + k), v(r, f - d));
  line(v(r, f - d), v(r, b + d));
  corner(v(r, b + d), v(r, b + d - k), v(r - d + k, b), v(r - d, b));
  line(v(r - d, b), v(l + d, b));
  corner(v(l + d, b), v(l + d - k, b), v(l, b + d - k), v(l, b + d));
  line(v(l, b + d), v(l, f - d));
  corner(v(l, f - d), v(l, f - d + k), v(l + d - k, f), v(l + d, f));
  path.arcLengthDivisions = 1000;
  return path;
}

export const drivingRoute = createDrivingRoute();
export const routeLength = drivingRoute.getLength();
export const clampProgress = (p: number) => Math.min(1, Math.max(0, p));
export function sampleTour(progress: number) {
  const p = clampProgress(progress),
    distance = p * tourSettings.laps * routeLength;
  const u = (p * tourSettings.laps) % 1;
  // CurvePath.getPoint already distributes distance over its component curves.
  const position = drivingRoute.getPoint(u);
  const lengths = drivingRoute.getCurveLengths();
  const along = u * routeLength;
  const segment = Math.max(
    0,
    lengths.findIndex((end) => end >= along),
  );
  const previous = segment === 0 ? 0 : lengths[segment - 1];
  const local = (along - previous) / (lengths[segment] - previous);
  const tangent = drivingRoute.curves[segment].getTangentAt(local).normalize();
  return {
    position,
    heading: Math.atan2(tangent.x, tangent.z),
    wheelAngle: distance / tourSettings.wheelRadius,
  };
}

export function cameraPose(progress: number, mobile: boolean) {
  const p = clampProgress(progress),
    index = p <= 0.5 ? 0 : 1;
  const from = tourSettings.poses[index],
    to = tourSettings.poses[index + 1];
  let t = (p - from.at) / (to.at - from.at);
  t = t * t * (3 - 2 * t);
  const target = new Vector3(...from.target).lerp(new Vector3(...to.target), t);
  const position = new Vector3(...from.position).lerp(
    new Vector3(...to.position),
    t,
  );
  if (mobile) position.sub(target).multiplyScalar(1.35).add(target);
  return { position, target, fov: from.fov + (to.fov - from.fov) * t };
}
