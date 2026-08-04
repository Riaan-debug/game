import type { ThreeEvent } from '@react-three/fiber';
import { LOCATION_BOUNDS, LOCATION_LABELS, STREET_PORTALS } from '../game/locations';
import type { LocationId } from '../game/types';
import { LocationPropsMeshes } from './LocationProps';
import { LocationSign } from './LocationSign';

interface StreetSceneProps {
  onFloorClick: (x: number, z: number) => void;
}

const FACADE_COLORS: Record<string, string> = {
  home: '#8a7260',
  park: '#4a6b42',
  work: '#7e8aa0',
  shop: '#b08968',
};

const TREE_POSITIONS: [number, number, number][] = [
  [-10.2, 0, -6],
  [10.2, 0, -6],
  [-10.2, 0, 6],
  [10.2, 0, 6],
  [-3.6, 0, -6.3],
  [4, 0, 6.2],
];

export function StreetScene({ onFloorClick }: StreetSceneProps) {
  const [width, depth] = LOCATION_BOUNDS.street;

  const handleGroundPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onFloorClick(event.point.x, event.point.z);
  };

  return (
    <group>
      {/* Grass ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onPointerDown={handleGroundPointerDown}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#6f8f5e" roughness={0.95} />
      </mesh>

      {/* Road along the x axis */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[width, 2.6]} />
        <meshStandardMaterial color="#55514f" roughness={0.92} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => -10 + i * 2.5).map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 0]}>
          <planeGeometry args={[1, 0.12]} />
          <meshStandardMaterial color="#d8d2c0" roughness={0.85} />
        </mesh>
      ))}

      {/* Sidewalks */}
      {[-1.8, 1.8].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]} receiveShadow>
          <planeGeometry args={[width, 0.9]} />
          <meshStandardMaterial color="#9b958c" roughness={0.95} />
        </mesh>
      ))}

      {/* Lot facades + entrance pads */}
      {STREET_PORTALS.map((portal) => (
        <LotEntrance
          key={portal.location}
          location={portal.location}
          padPosition={portal.position}
          onPadClick={() => onFloorClick(portal.position[0], portal.position[2])}
        />
      ))}

      {/* Fountain dressing (the basin itself is a clickable LocationProp) */}
      <group position={[0, 0, -3.5]}>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.06, 20]} />
          <meshStandardMaterial color="#7fb2e0" roughness={0.15} metalness={0.2} />
        </mesh>
        <mesh castShadow position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 0.5, 10]} />
          <meshStandardMaterial color="#8d99a6" roughness={0.6} />
        </mesh>
      </group>

      {/* Trees along the edges */}
      {TREE_POSITIONS.map((pos, index) => (
        <group key={index} position={pos}>
          <mesh castShadow position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 1.2, 8]} />
            <meshStandardMaterial color="#5a4a38" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.55, 10, 10]} />
            <meshStandardMaterial color="#4f7a4a" roughness={0.85} />
          </mesh>
        </group>
      ))}

      <LocationPropsMeshes />
    </group>
  );
}

function LotEntrance({
  location,
  padPosition,
  onPadClick,
}: {
  location: LocationId;
  padPosition: [number, number, number];
  onPadClick: () => void;
}) {
  const [px, , pz] = padPosition;
  const outward = Math.sign(pz);
  const facadeZ = pz + outward * 1.5;
  const color = FACADE_COLORS[location] ?? '#8a7260';

  const handlePadPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onPadClick();
  };

  return (
    <group>
      {/* Facade */}
      <mesh castShadow receiveShadow position={[px, 1.1, facadeZ]}>
        <boxGeometry args={[3.2, 2.2, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Door */}
      <mesh position={[px, 0.75, facadeZ - outward * 0.21]}>
        <boxGeometry args={[0.8, 1.5, 0.05]} />
        <meshStandardMaterial color="#3d3429" roughness={0.7} />
      </mesh>
      {/* Glowing entrance pad — click to walk in */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[px, 0.03, pz]}
        onPointerDown={handlePadPointerDown}
      >
        <circleGeometry args={[0.55, 24]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.35}
          transparent
          opacity={0.75}
        />
      </mesh>
      <LocationSign
        label={LOCATION_LABELS[location]}
        position={[px + 2.1, 0, facadeZ - outward * 0.3]}
      />
    </group>
  );
}
