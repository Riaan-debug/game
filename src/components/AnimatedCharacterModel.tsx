import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { Box3, Color, LoopRepeat, type Group, type Material, type SkinnedMesh } from 'three';
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

function applyTint(root: Group, tint?: string) {
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

export function AnimatedCharacterModel({
  activity,
  position,
  rotation,
  tint,
  onPointerDown,
}: AnimatedCharacterModelProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATHS.character);
  const { actions, names } = useAnimations(animations, groupRef);

  const { clonedScene, groundOffset } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ('castShadow' in child) child.castShadow = true;
      if ('receiveShadow' in child) child.receiveShadow = true;
    });
    applyTint(clone, tint);

    const box = new Box3().setFromObject(clone);
    const height = Math.max(box.max.y - box.min.y, 0.001);
    const scale = TARGET_HEIGHT / height;
    clone.scale.setScalar(scale);

    const grounded = new Box3().setFromObject(clone);
    return { clonedScene: clone, groundOffset: -grounded.min.y };
  }, [scene, tint]);

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
    if (!groupRef.current) return;
    groupRef.current.position.set(position[0], position[1], position[2]);

    if (activity === 'sleeping') {
      groupRef.current.rotation.set(-Math.PI / 2, rotation, 0);
      groupRef.current.position.y = 0.35;
      return;
    }

    groupRef.current.rotation.set(0, rotation, 0);
    groupRef.current.position.y = activity === 'walking' ? Math.sin(Date.now() * 0.012) * 0.02 : 0;
  });

  return (
    <group ref={groupRef} onPointerDown={onPointerDown}>
      <group position={[0, groundOffset, 0]}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}
