import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Object3D } from 'three';
import {
  getHairColor,
  getHairStyle,
  getOutfit,
  getSkinTone,
} from '../game/casCatalog';
import type { SimState } from '../game/types';

interface SimCharacterProps {
  sim: SimState;
}

function resetPart(part: Object3D, base: { y: number; rotX?: number }) {
  part.position.y = base.y;
  part.rotation.x = base.rotX ?? 0;
  part.rotation.z = 0;
}

export function SimCharacter({ sim }: SimCharacterProps) {
  const groupRef = useRef<Group>(null);
  const walkPhase = useRef(0);

  const skin = getSkinTone(sim.appearance.skinToneId);
  const hairColor = getHairColor(sim.appearance.hairColorId);
  const hairStyle = getHairStyle(sim.appearance.hairStyleId);
  const outfit = getOutfit(sim.appearance.outfitId);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const root = groupRef.current;
    const body = root.getObjectByName('torso');
    const head = root.getObjectByName('head');
    const hair = root.getObjectByName('hair');
    const legL = root.getObjectByName('legL');
    const legR = root.getObjectByName('legR');
    const armL = root.getObjectByName('armL');
    const armR = root.getObjectByName('armR');

    const [x, , z] = sim.position;
    root.position.set(x, 0, z);
    root.rotation.set(0, sim.rotation, 0);

    if (body) resetPart(body, { y: 0.82 });
    if (head) resetPart(head, { y: 1.42 });
    if (hair) resetPart(hair, { y: hairStyle.type === 'bun' ? 1.62 : 1.52 });
    if (legL) resetPart(legL, { y: 0.28 });
    if (legR) resetPart(legR, { y: 0.28 });
    if (armL) resetPart(armL, { y: 0.82 });
    if (armR) resetPart(armR, { y: 0.82 });

    if (sim.activity === 'walking') {
      walkPhase.current += delta * 9;
      const bob = Math.sin(walkPhase.current) * 0.04;
      const swing = Math.sin(walkPhase.current) * 0.45;
      root.position.y = bob;
      if (legL) legL.rotation.x = swing;
      if (legR) legR.rotation.x = -swing;
      if (armL) armL.rotation.x = -swing * 0.5;
      if (armR) armR.rotation.x = swing * 0.5;
    } else {
      walkPhase.current = 0;
      root.position.y = 0;
    }

    switch (sim.activity) {
      case 'sleeping':
        root.rotation.x = -Math.PI / 2;
        root.position.y = 0.35;
        break;
      case 'sitting':
        if (body) body.position.y = 0.62;
        if (head) head.position.y = 1.18;
        if (hair) hair.position.y += -0.24;
        if (legL) {
          legL.position.y = 0.18;
          legL.rotation.x = -1.2;
        }
        if (legR) {
          legR.position.y = 0.18;
          legR.rotation.x = -1.2;
        }
        break;
      case 'eating': {
        const chew = Math.sin(sim.actionElapsed * 8) * 0.08;
        if (head) head.rotation.x = -0.12 + chew;
        if (armR) {
          armR.rotation.x = -0.9 + chew;
          armR.position.z = -0.18;
        }
        break;
      }
      case 'showering': {
        if (armL) armL.rotation.x = -2.2;
        if (armR) armR.rotation.x = -2.2;
        if (head) head.rotation.x = -0.2;
        break;
      }
      case 'watching':
        if (body) body.position.y = 0.62;
        if (head) head.position.y = 1.18;
        if (legL) {
          legL.position.y = 0.18;
          legL.rotation.x = -1.2;
        }
        if (legR) {
          legR.position.y = 0.18;
          legR.rotation.x = -1.2;
        }
        break;
      case 'chatting':
        if (body) body.position.y = 0.78;
        if (head) head.position.y = 1.42;
        if (armL) {
          armL.rotation.x = -0.5;
          armL.position.z = 0.1;
        }
        if (armR) {
          armR.rotation.x = -0.5;
          armR.position.z = 0.1;
        }
        break;
      case 'reading':
        if (body) body.position.y = 0.62;
        if (head) {
          head.position.y = 1.12;
          head.rotation.x = 0.35;
        }
        if (armL) {
          armL.rotation.x = -1.1;
          armL.position.y = 0.72;
        }
        if (armR) {
          armR.rotation.x = -1.1;
          armR.position.y = 0.72;
        }
        if (legL) {
          legL.position.y = 0.18;
          legL.rotation.x = -1.2;
        }
        if (legR) {
          legR.position.y = 0.18;
          legR.rotation.x = -1.2;
        }
        break;
      default:
        break;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh name="legL" castShadow position={[-0.12, 0.28, 0]}>
        <boxGeometry args={[0.12, 0.42, 0.14]} />
        <meshStandardMaterial color={outfit.bottomColor} roughness={0.85} />
      </mesh>
      <mesh name="legR" castShadow position={[0.12, 0.28, 0]}>
        <boxGeometry args={[0.12, 0.42, 0.14]} />
        <meshStandardMaterial color={outfit.bottomColor} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[-0.12, 0.08, 0.04]}>
        <boxGeometry args={[0.14, 0.08, 0.22]} />
        <meshStandardMaterial color={outfit.shoeColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.12, 0.08, 0.04]}>
        <boxGeometry args={[0.14, 0.08, 0.22]} />
        <meshStandardMaterial color={outfit.shoeColor} roughness={0.9} />
      </mesh>

      <mesh name="torso" castShadow position={[0, 0.82, 0]}>
        <boxGeometry args={[0.38, 0.52, 0.22]} />
        <meshStandardMaterial color={outfit.topColor} roughness={0.75} />
      </mesh>

      <mesh name="armL" castShadow position={[-0.26, 0.82, 0]}>
        <boxGeometry args={[0.1, 0.42, 0.12]} />
        <meshStandardMaterial color={outfit.topColor} roughness={0.75} />
      </mesh>
      <mesh name="armR" castShadow position={[0.26, 0.82, 0]}>
        <boxGeometry args={[0.1, 0.42, 0.12]} />
        <meshStandardMaterial color={outfit.topColor} roughness={0.75} />
      </mesh>

      <mesh name="head" castShadow position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.65} />
      </mesh>

      <HairMesh style={hairStyle.type} color={hairColor} />
    </group>
  );
}

function HairMesh({ style, color }: { style: 'short' | 'medium' | 'long' | 'bun'; color: string }) {
  if (style === 'short') {
    return (
      <mesh name="hair" castShadow position={[0, 1.52, -0.02]}>
        <sphereGeometry args={[0.23, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    );
  }

  if (style === 'medium') {
    return (
      <group name="hair" position={[0, 1.52, -0.03]}>
        <mesh castShadow position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.24, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.12, 0.06]}>
          <boxGeometry args={[0.34, 0.22, 0.18]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  if (style === 'long') {
    return (
      <group name="hair" position={[0, 1.5, -0.02]}>
        <mesh castShadow>
          <sphereGeometry args={[0.24, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.28, 0.05]}>
          <boxGeometry args={[0.36, 0.48, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  return (
    <group name="hair" position={[0, 1.62, -0.02]}>
      <mesh castShadow>
        <sphereGeometry args={[0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.08, -0.02]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}
