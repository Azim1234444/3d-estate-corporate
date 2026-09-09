import fs from "node:fs";
const buffer = fs.readFileSync(".source-assets/corporate_estate.glb");
const gltf = JSON.parse(
  buffer.toString("utf8", 20, 20 + buffer.readUInt32LE(12)),
);
for (const node of gltf.nodes) {
  if (node.mesh === undefined) continue;
  if (
    /Vehicle|Car|Site|Landscape \/ planter|Boundary \/ low wall|Boundary \/ pillar/.test(
      node.name,
    )
  ) {
    const pos =
      gltf.accessors[gltf.meshes[node.mesh].primitives[0].attributes.POSITION];
    console.log(
      node.mesh,
      node.name,
      JSON.stringify({ min: pos.min, max: pos.max }),
    );
  }
}
console.log("Materials", JSON.stringify(gltf.materials));
