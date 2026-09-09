import fs from "node:fs";
import {
  BufferGeometry,
  BufferAttribute,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Source GLB has baked mesh positions under one Z-up -> Y-up root.
// Preserve it as the source; create a compact web copy with static meshes merged by material.
const source = fs.readFileSync(".source-assets/corporate_estate.glb");
const jsonLength = source.readUInt32LE(12);
const input = JSON.parse(source.toString("utf8", 20, 20 + jsonLength));
const binStart = 20 + jsonLength + 8;
const rotation = new Matrix4().makeRotationFromQuaternion(
  new Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2),
);
const geometryFor = (primitive) => {
  const geometry = new BufferGeometry();
  for (const [semantic, key] of [
    ["POSITION", "position"],
    ["NORMAL", "normal"],
  ]) {
    const a = input.accessors[primitive.attributes[semantic]];
    const view = input.bufferViews[a.bufferView];
    const bytes = source.subarray(
      binStart + (view.byteOffset || 0) + (a.byteOffset || 0),
      binStart + (view.byteOffset || 0) + (a.byteOffset || 0) + a.count * 12,
    );
    geometry.setAttribute(
      key,
      new BufferAttribute(
        new Float32Array(
          bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length),
        ),
        3,
      ),
    );
  }
  if (primitive.indices !== undefined) {
    const a = input.accessors[primitive.indices],
      v = input.bufferViews[a.bufferView];
    const Type = a.componentType === 5125 ? Uint32Array : Uint16Array;
    const bytes = source.subarray(
      binStart + (v.byteOffset || 0) + (a.byteOffset || 0),
      binStart +
        (v.byteOffset || 0) +
        (a.byteOffset || 0) +
        a.count * Type.BYTES_PER_ELEMENT,
    );
    geometry.setIndex(
      new BufferAttribute(
        new Type(
          bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length),
        ),
        1,
      ),
    );
  }
  return geometry.applyMatrix4(rotation);
};
const buckets = new Map(),
  pieces = [],
  obstacles = [];
const carOrigin = new Vector3(-16, 0, 16.8);
// Keep every parked vehicle centred inside the existing painted bay.
// Each source car consists of nine consecutive meshes, with world-space vertices.
const parkedCars = [
  { first: 911, from: [-10, 0, 16.8], to: [-10.5, 0, 17], angle: 0 },
  { first: 920, from: [-1, 0, 16.8], to: [-1.5, 0, 17], angle: 0 },
  { first: 929, from: [13.1, 0, 6], to: [13.5, 0, 5.6], angle: -Math.PI / 2 },
  { first: 938, from: [13.1, 0, 0], to: [13.5, 0, 0], angle: -Math.PI / 2 },
  { first: 947, from: [13.1, 0, -6], to: [13.5, 0, -5.6], angle: -Math.PI / 2 },
  {
    first: 956,
    from: [13.1, 0, -12],
    to: [13.5, 0, -11.2],
    angle: -Math.PI / 2,
  },
];
for (const node of input.nodes) {
  if (node.mesh === undefined) continue;
  const p = input.meshes[node.mesh].primitives[0];
  const geometry = geometryFor(p);
  const parking = parkedCars.find(
    (car) => node.mesh >= car.first && node.mesh < car.first + 9,
  );
  if (parking) {
    geometry.translate(-parking.from[0], -parking.from[1], -parking.from[2]);
    geometry.rotateY(parking.angle);
    geometry.translate(...parking.to);
  }
  geometry.computeBoundingBox();
  if (!/Site|marking|Landscape \/ canopy|Landscape \/ soil/i.test(node.name)) {
    const b = geometry.boundingBox;
    if (!(node.mesh >= 902 && node.mesh <= 910))
      obstacles.push({
        name: node.name,
        min: b.min.toArray(),
        max: b.max.toArray(),
      });
  }
  if (node.mesh >= 902 && node.mesh <= 910) {
    geometry.translate(-carOrigin.x, 0, -carOrigin.z);
    let position = [0, 0, 0];
    const wheel = node.name.includes("wheel");
    if (wheel) {
      geometry.computeBoundingBox();
      const c = geometry.boundingBox.getCenter(new Vector3());
      position = c.toArray();
      geometry.translate(-c.x, -c.y, -c.z);
    }
    pieces.push({
      name: wheel ? `wheel-${node.mesh}` : `car-${node.mesh}`,
      geometry,
      material: p.material,
      position,
      car: true,
    });
  } else {
    if (!buckets.has(p.material)) buckets.set(p.material, []);
    buckets.get(p.material).push(geometry);
  }
}
for (const [material, list] of buckets)
  pieces.unshift({
    name: `static-${material}`,
    geometry: mergeGeometries(list),
    material,
    position: [0, 0, 0],
    car: false,
  });
const out = {
  asset: {
    version: "2.0",
    generator: "Corporate Estate web asset preparation",
  },
  scene: 0,
  scenes: [{ nodes: [] }],
  nodes: [],
  meshes: [],
  accessors: [],
  bufferViews: [],
  buffers: [],
  materials: input.materials,
};
// Subtle architectural palette; use a visible gold moving car.
const movingCarMaterial =
  out.materials.push({
    name: "Vehicle gold",
    pbrMetallicRoughness: {
      baseColorFactor: [0.55, 0.32, 0.085, 1],
      metallicFactor: 0.4,
      roughnessFactor: 0.3,
    },
  }) - 1;
const chunks = [];
let byteLength = 0;
function accessor(array, type, componentType, min, max, target) {
  const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  const pad = (4 - (bytes.length % 4)) % 4;
  const bufferView =
    out.bufferViews.push({
      buffer: 0,
      byteOffset: byteLength,
      byteLength: bytes.length,
      target,
    }) - 1;
  chunks.push(bytes, Buffer.alloc(pad));
  byteLength += bytes.length + pad;
  return (
    out.accessors.push({
      bufferView,
      componentType,
      count: array.length / (type === "VEC3" ? 3 : 1),
      type,
      ...(min ? { min, max } : {}),
    }) - 1
  );
}
const carChildren = [];
for (const piece of pieces) {
  const g = piece.geometry;
  g.computeBoundingBox();
  const attributes = {
    POSITION: accessor(
      g.attributes.position.array,
      "VEC3",
      5126,
      g.boundingBox.min.toArray(),
      g.boundingBox.max.toArray(),
      34962,
    ),
    NORMAL: accessor(
      g.attributes.normal.array,
      "VEC3",
      5126,
      undefined,
      undefined,
      34962,
    ),
  };
  const indices = g.index
    ? accessor(
        new Uint32Array(g.index.array),
        "SCALAR",
        5125,
        undefined,
        undefined,
        34963,
      )
    : undefined;
  const material =
    piece.car && piece.material === 12 ? movingCarMaterial : piece.material;
  const mesh =
    out.meshes.push({
      primitives: [
        { attributes, ...(indices !== undefined ? { indices } : {}), material },
      ],
    }) - 1;
  const index =
    out.nodes.push({ name: piece.name, mesh, translation: piece.position }) - 1;
  (piece.car ? carChildren : out.scenes[0].nodes).push(index);
}
out.scenes[0].nodes.push(
  out.nodes.push({ name: "tour-car", children: carChildren }) - 1,
);
out.buffers.push({ byteLength });
let json = Buffer.from(JSON.stringify(out));
json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 32)]);
const bin = Buffer.concat(chunks);
const header = Buffer.alloc(12);
header.write("glTF");
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);
const jh = Buffer.alloc(8);
jh.writeUInt32LE(json.length);
jh.writeUInt32LE(0x4e4f534a, 4);
const bh = Buffer.alloc(8);
bh.writeUInt32LE(bin.length);
bh.writeUInt32LE(0x004e4942, 4);
fs.writeFileSync(
  "public/assets/estate-web.glb",
  Buffer.concat([header, jh, json, bh, bin]),
);
fs.writeFileSync("scripts/model-obstacles.json", JSON.stringify(obstacles));
console.log(
  `Merged ${input.meshes.length} meshes into ${out.meshes.length}; car has ${carChildren.length} individually rigged parts.`,
);
