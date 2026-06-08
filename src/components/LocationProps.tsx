import type { ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { getPropsForLocation } from '../game/locationProps';
import { useGame } from '../game/GameContext';

export function LocationPropsMeshes() {
  const { world, useProp } = useGame();
  const props = getPropsForLocation(world.currentLocation);

  return (
    <group>
      {props.map((prop) => (
        <group key={prop.id} position={prop.position}>
          <mesh
            castShadow
            receiveShadow
            onPointerDown={(event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation();
              useProp(prop.id);
            }}
          >
            <boxGeometry args={prop.size} />
            <meshStandardMaterial color={prop.color} roughness={0.8} />
          </mesh>
          {prop.interaction && (
            <mesh position={[0, prop.size[1] + 0.2, prop.size[2] * 0.35]}>
              <boxGeometry args={[0.2, 0.08, 0.08]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.2} />
            </mesh>
          )}
          <Text
            position={[0, prop.size[1] + 0.45, 0]}
            fontSize={0.18}
            color="#f8f4ef"
            anchorX="center"
            anchorY="middle"
          >
            {prop.label}
          </Text>
        </group>
      ))}
    </group>
  );
}
