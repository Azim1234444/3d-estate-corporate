"use client";
import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  PMREMGenerator,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Group,
  Color,
  ACESFilmicToneMapping,
} from "three";
import type { MotionValue } from "motion/react";
import { cameraPose, sampleTour } from "./tour-config";

type SceneProps = {
  progress: MotionValue<number>;
  active: boolean;
  onReady: () => void;
  onFailure: () => void;
};

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.5;
    return () => {
      scene.environment = null;
      environment.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Estate({ progress, onReady, active }: Omit<SceneProps, "onFailure">) {
  const gltf = useLoader(GLTFLoader, "/assets/estate-web.glb");
  const { invalidate, camera, size } = useThree();
  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.material = (obj.material as MeshStandardMaterial).clone();
        const material = obj.material as MeshStandardMaterial;
        if (material.name === "Lawn") material.color = new Color("#829271");
        if (material.name === "Tree foliage")
          material.color = new Color("#667851");
        if (material.name === "Asphalt") material.color = new Color("#747774");
        if (material.name === "Graphite aluminium")
          material.color = new Color("#3e4544");
        if (material.name === "Smoky blue glazing") {
          material.color = new Color("#6f9094");
          material.roughness = 0.24;
        }
        if (obj.name === "car-902" || obj.name === "car-904")
          material.color = new Color("#bd8b3e");
      }
    });
    return clone;
  }, [gltf]);
  const car = useMemo(
    () => model.getObjectByName("tour-car") as Group,
    [model],
  );
  const wheels = useMemo(
    () => car.children.filter((obj) => obj.name.startsWith("wheel-")),
    [car],
  );
  useEffect(() => {
    onReady();
    return () => {
      model.traverse((obj) => {
        if (obj instanceof Mesh)
          (obj.material as MeshStandardMaterial).dispose();
      });
    };
  }, [model, onReady]);
  useEffect(() => {
    if (!active) return;
    invalidate();
    return progress.on("change", () => invalidate());
  }, [progress, invalidate, active]);
  useFrame(() => {
    const p = progress.get();
    const sample = sampleTour(p);
    car.position.copy(sample.position);
    car.rotation.y = sample.heading;
    wheels.forEach((wheel) => {
      wheel.rotation.x = sample.wheelAngle;
    });
    const pose = cameraPose(p, size.width < 600);
    camera.position.copy(pose.position);
    camera.lookAt(pose.target);
    (camera as PerspectiveCamera).fov = pose.fov;
    camera.updateProjectionMatrix();
  });
  return <primitive object={model} dispose={null} />;
}

function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const fail = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener("webglcontextlost", fail);
    return () => canvas.removeEventListener("webglcontextlost", fail);
  }, [gl, onFailure]);
  return null;
}

export default function EstateScene(props: SceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [43, 32, 48], fov: 40, near: 0.1, far: 220 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
      }}
      fallback={
        <span className="sr-only">
          3D view unavailable. Estate preview shown.
        </span>
      }
    >
      <ContextGuard onFailure={props.onFailure} />
      <Environment />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#edf3fb", "#b4ad92", 1.7]} />
      <directionalLight
        position={[20, 40, 25]}
        intensity={3.2}
        color="#fff1d8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-far={140}
        shadow-normalBias={0.07}
        shadow-bias={-0.0001}
      />
      <Suspense fallback={null}>
        <Estate {...props} />
      </Suspense>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.69, 0]}
        receiveShadow
      >
        <planeGeometry args={[180, 180]} />
        <shadowMaterial transparent opacity={0.13} />
      </mesh>
    </Canvas>
  );
}
