import { useAnimations, useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Box3, Color, LoopRepeat, type Group, type Material, type Object3D, type SkinnedMesh } from 'three';
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

const TARGET_HEIGHT = 1.75;

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

function applyTint(root: Object3D, tint?: string) {
  if (!tint) return;
  const color = new Color(tint);
  root.traverse((child) => {
    const mesh = child as SkinnedMesh;
    if (!mesh.isSkinnedMesh || !mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      const standard = material as Material & { color?: Color; emissive?: Color };
      if (standard.color) {
        standard.color.lerp(color, 0.35);
      }
      if (standard.emissive) {
        standard.emissive.set(color).multiplyScalar(0.08);
      }
    }
  });
}

function prepareCharacterClone(scene: Object3D, tint?: string) {
  // Regular Object3D.clone breaks skinned-mesh bone bindings (floating limbs).
  const clone = SkeletonUtils.clone(scene) as Group;
  clone.traverse((child) => {
    if ('castShadow' in child) child.castShadow = true;
    if ('receiveShadow' in child) child.receiveShadow = true;
  });
  applyTint(clone, tint);

  const box = new Box3().setFromObject(clone);
  const height = Math.max(box.max.y - box.min.y, 0.001);
  clone.scale.setScalar(TARGET_HEIGHT / height);

  const grounded = new Box3().setFromObject(clone);
  return { clone, groundOffset: -grounded.min.y };
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
  const { actions, names } = useAnimations(animations, modelRef);

  const { clone, groundOffset } = useMemo(
    () => prepareCharacterClone(scene, tint),
    [scene, tint],
  );

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

    if (activity === 'sleeping') {
      rootRef.current.rotation.set(-Math.PI / 2, rotation, 0);
      rootRef.current.position.y = 0.35;
      return;
    }

    rootRef.current.rotation.set(0, rotation, 0);
    rootRef.current.position.y = activity === 'walking' ? Math.sin(Date.now() * 0.012) * 0.02 : 0;
  });

  return (
    <group ref={rootRef} onPointerDown={onPointerDown}>
      <group ref={modelRef} position={[0, groundOffset, 0]}>
        <primitive object={clone} />
      </group>
    </group>
  );
}
