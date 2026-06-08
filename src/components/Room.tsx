import type { ThreeEvent } from '@react-three/fiber';
import { ROOM_HALF, ROOM_SIZE } from '../game/constants';

interface RoomProps {
  buildMode: boolean;
  onFloorClick: (x: number, z: number) => void;
}

export function Room({ buildMode, onFloorClick }: RoomProps) {
  const wallHeight = 2.8;
  const wallThickness = 0.12;

  const handleFloorPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onFloorClick(event.point.x, event.point.z);
  };

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onPointerDown={handleFloorPointerDown}
      >
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <meshStandardMaterial color="#c9b8a8" roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[ROOM_SIZE - 0.3, ROOM_SIZE - 0.3]} />
        <meshStandardMaterial color="#ddd0c4" roughness={0.95} />
      </mesh>

      {buildMode && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <planeGeometry args={[ROOM_SIZE - 0.3, ROOM_SIZE - 0.3]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.08} />
        </mesh>
      )}

      <Wall position={[0, wallHeight / 2, -ROOM_HALF]} size={[ROOM_SIZE, wallHeight, wallThickness]} />
      <Wall position={[0, wallHeight / 2, ROOM_HALF]} size={[ROOM_SIZE, wallHeight, wallThickness]} />
      <Wall position={[-ROOM_HALF, wallHeight / 2, 0]} size={[wallThickness, wallHeight, ROOM_SIZE]} />
      <Wall position={[ROOM_HALF, wallHeight / 2, 0]} size={[wallThickness, wallHeight, ROOM_SIZE]} />
    </group>
  );
}

function Wall({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#efe7dc" roughness={0.95} />
    </mesh>
  );
}
