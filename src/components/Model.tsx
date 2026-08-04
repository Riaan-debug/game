import { Clone, useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import { Box3, type Object3D, Vector3 } from 'three';

export interface ModelProps {
  path: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  /** Fit the model inside this box (width, height, depth). */
  fit?: [number, number, number];
  /** Lift so the bottom of the fitted box sits on y=0 within the group. */
  ground?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
}

function applyShadows(object: Object3D, castShadow: boolean, receiveShadow: boolean) {
  object.traverse((child) => {
    if ('castShadow' in child) {
      child.castShadow = castShadow;
    }
    if ('receiveShadow' in child) {
      child.receiveShadow = receiveShadow;
    }
  });
}

function computeFitScale(
  object: Object3D,
  fit: [number, number, number],
): { scale: [number, number, number]; offset: [number, number, number] } {
  const box = new Box3().setFromObject(object);
  const size = new Vector3();
  box.getSize(size);

  const sx = fit[0] / Math.max(size.x, 0.001);
  const sy = fit[1] / Math.max(size.y, 0.001);
  const sz = fit[2] / Math.max(size.z, 0.001);
  const uniform = Math.min(sx, sy, sz);

  const center = new Vector3();
  box.getCenter(center);

  return {
    scale: [uniform, uniform, uniform],
    offset: [-center.x * uniform, -box.min.y * uniform, -center.z * uniform],
  };
}

export function Model({
  path,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale,
  fit,
  ground = true,
  castShadow = true,
  receiveShadow = true,
  onPointerDown,
}: ModelProps) {
  const { scene } = useGLTF(path);

  const { fittedScene, offset } = useMemo(() => {
    const clone = scene.clone(true);
    applyShadows(clone, castShadow, receiveShadow);

    if (fit) {
      const result = computeFitScale(clone, fit);
      clone.scale.set(...result.scale);
      return { fittedScene: clone, offset: ground ? result.offset : ([0, 0, 0] as [number, number, number]) };
    }

    if (typeof scale === 'number') {
      clone.scale.setScalar(scale);
    } else if (scale) {
      clone.scale.set(...scale);
    }

    if (ground) {
      const box = new Box3().setFromObject(clone);
      return { fittedScene: clone, offset: [0, -box.min.y, 0] as [number, number, number] };
    }

    return { fittedScene: clone, offset: [0, 0, 0] as [number, number, number] };
  }, [scene, fit, scale, ground, castShadow, receiveShadow]);

  return (
    <group position={position} rotation={rotation} onPointerDown={onPointerDown}>
      <group position={offset}>
        <Clone object={fittedScene} />
      </group>
    </group>
  );
}
