import { useAnimations, useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  Color,
  LoopRepeat,
  type Group,
  type Material,
  type Object3D,
  type SkinnedMesh,
} from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { MODEL_PATHS } from '../game/modelPaths';
import type { SimActivity } from '../game/types';

interface AnimatedCharacterModelProps {
  activity: SimActivity;
  position: [number, number, number];
  rotation: number;
  /** Optional tint for shirt/body materials (NPC differentiation). */
  tint?: string;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
}

/** RobotExpressive in our asset is ~4.8 units tall; normalize to ~1.75m sim height. */
const CHARACTER_SCALE = 1.75 / 4.79;
const FOOT_CLEARANCE = 0.02;

function pickClipName(activity: SimActivity, names: string[]): string | null {
  const lower = names.map((name) => name.toLowerCase());
  if (activity === 'walking') {
    const idx = lower.findIndex((name) => name.includes('walk') || name.includes('run'));
    if (idx >= 0) return names[idx];
  }
  if (activity === 'sitting' || activity === 'watching' || activity === 'reading') {
    const idx = lower.findIndex((name) => name.includes('sit'));
    if (idx >= 0) return names[idx];
  }
  if (activity === 'sleeping') {
    const idx = lower.findIndex((name) => name.includes('death') || name.includes('idle'));
    if (idx >= 0) return names[idx];
  }
  const idleIdx = lower.findIndex((name) => name.includes('idle') || name.includes('stand'));
  return idleIdx >= 0 ? names[idleIdx] : names[0] ?? null;
}

function prepareClone(scene: Object3D, tint?: string) {
  const clone = SkeletonUtils.clone(scene) as Group;
  clone.traverse((child) => {
    if ('castShadow' in child) child.castShadow = true;
    if ('receiveShadow' in child) child.receiveShadow = true;
    if ('frustumCulled' in child) child.frustumCulled = false;
  });

  if (tint) {
    const color = new Color(tint);
    clone.traverse((child) => {
      const mesh = child as SkinnedMesh;
      if (!mesh.isSkinnedMesh || !mesh.material) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const clonedMaterials = materials.map((material) => {
        const clonedMat = material.clone() as Material & { color?: Color; emissive?: Color };
        if (clonedMat.color) clonedMat.color.lerp(color, 0.35);
        if (clonedMat.emissive) clonedMat.emissive.set(color).multiplyScalar(0.08);
        return clonedMat;
      });
      mesh.material = Array.isArray(mesh.material) ? clonedMaterials : clonedMaterials[0];
    });
  }

  return clone;
}

export function AnimatedCharacterModel({
  activity,
  position,
  rotation,
  tint,
  onPointerDown,
}: AnimatedCharacterModelProps) {
  const rootRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATHS.character);
  const clone = useMemo(() => prepareClone(scene, tint), [scene, tint]);
  const { actions, names } = useAnimations(animations, modelRef);

  useEffect(() => {
    const clipName = pickClipName(activity, names);
    if (!clipName) return;

    for (const [name, action] of Object.entries(actions)) {
      if (!action) continue;
      if (name === clipName) {
        action.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.2).play();
      } else {
        action.fadeOut(0.15);
      }
    }

    return () => {
      actions[clipName]?.fadeOut(0.15);
    };
  }, [actions, activity, names]);

  useFrame(() => {
    if (!rootRef.current) return;
    rootRef.current.position.set(position[0], position[1], position[2]);
    rootRef.current.rotation.set(0, rotation, 0);

    if (activity === 'sleeping') {
      rootRef.current.position.y = 0.35;
      return;
    }

    rootRef.current.position.y =
      activity === 'walking' ? Math.sin(Date.now() * 0.012) * 0.02 : 0;
  });

  return (
    <group ref={rootRef} dispose={null} onPointerDown={onPointerDown}>
      <group dispose={null} scale={CHARACTER_SCALE} position={[0, FOOT_CLEARANCE, 0]}>
        <primitive ref={modelRef} object={clone} />
      </group>
    </group>
  );
}
