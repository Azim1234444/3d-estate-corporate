import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  sampleTour,
  routeLength,
  drivingRoute,
  cameraPose,
} from "../src/tour-config.ts";

test("two laps close at the start, midpoint and end", () => {
  const start = sampleTour(0);
  for (const p of [0.5, 1])
    assert.ok(sampleTour(p).position.distanceTo(start.position) < 1e-7);
  assert.ok(
    Math.abs(sampleTour(1).wheelAngle - (2 * routeLength) / 0.38) < 1e-8,
  );
});
test("forward and reverse scrolling retrace the same pose without drift", () => {
  const poses = [0, 0.12, 0.29, 0.49999, 0.5, 0.7, 0.93, 1].map((p) =>
    sampleTour(p),
  );
  for (const [index, p] of [
    0, 0.12, 0.29, 0.49999, 0.5, 0.7, 0.93, 1,
  ].entries()) {
    const again = sampleTour(p);
    assert.deepEqual(again, poses[index]);
  }
  assert.deepEqual(sampleTour(-1), sampleTour(0));
  assert.deepEqual(sampleTour(2), sampleTour(1));
  assert.ok(sampleTour(0.39).wheelAngle < sampleTour(0.4).wheelAngle);
});
test("loop has a continuous heading and stable travelled distance across its seam", () => {
  const before = sampleTour(0.5 - 1e-6),
    after = sampleTour(0.5 + 1e-6);
  assert.ok(before.position.distanceTo(after.position) < 0.002);
  assert.ok(Math.abs(before.heading - after.heading) < 0.001);
  const steps = 500;
  const lengths = Array.from({ length: steps }, (_, i) =>
    drivingRoute
      .getPoint(i / steps)
      .distanceTo(drivingRoute.getPoint((i + 1) / steps)),
  );
  assert.ok(Math.max(...lengths) / Math.min(...lengths) < 1.03);
});
test("camera is finite, continuous and above ground across every stage", () => {
  for (let i = 0; i <= 1000; i++)
    for (const mobile of [false, true]) {
      const pose = cameraPose(i / 1000, mobile);
      assert.ok(pose.position.y > 0);
      assert.ok(pose.position.distanceTo(pose.target) > 10);
      assert.ok(pose.position.toArray().every(Number.isFinite));
    }
  assert.ok(
    cameraPose(0.499999, false).position.distanceTo(
      cameraPose(0.500001, false).position,
    ) < 0.001,
  );
});

type Obstacle = { name: string; min: number[]; max: number[] };
const obstacles: Obstacle[] = JSON.parse(
  fs.readFileSync("scripts/model-obstacles.json", "utf8"),
);
// Separating-axis check: moving car's oriented footprint against each source mesh's world bounds.
function overlaps(px: number, pz: number, heading: number, o: Obstacle) {
  const cx = (o.min[0] + o.max[0]) / 2,
    cz = (o.min[2] + o.max[2]) / 2;
  const ex = (o.max[0] - o.min[0]) / 2,
    ez = (o.max[2] - o.min[2]) / 2;
  const ux = Math.cos(heading),
    uz = -Math.sin(heading),
    vx = Math.sin(heading),
    vz = Math.cos(heading);
  const dx = cx - px,
    dz = cz - pz;
  const hw = 1.04,
    hl = 2.14;
  return [
    [1, 0],
    [0, 1],
    [ux, uz],
    [vx, vz],
  ].every(
    ([ax, az]) =>
      Math.abs(dx * ax + dz * az) <
      hw * Math.abs(ux * ax + uz * az) +
        hl * Math.abs(vx * ax + vz * az) +
        ex * Math.abs(ax) +
        ez * Math.abs(az),
  );
}
test("car footprint clears buildings, planters, parked cars and boundary walls for a full lap", () => {
  const solid = obstacles.filter(
    (o) => o.max[1] > 0.2 && o.min[1] < 1.54 && !/marking/i.test(o.name),
  );
  const hits = new Set<string>();
  for (let i = 0; i < 2000; i++) {
    const pose = sampleTour(i / 4000);
    for (const obstacle of solid)
      if (overlaps(pose.position.x, pose.position.z, pose.heading, obstacle))
        hits.add(`${obstacle.name} at progress ${(i / 4000).toFixed(3)}`);
    assert.ok(
      pose.position.x >= -16.5 &&
        pose.position.x <= 22.5 &&
        pose.position.z >= -21.5 &&
        pose.position.z <= 13.5,
    );
  }
  assert.equal(hits.size, 0, [...hits].slice(0, 20).join("\n"));
});
