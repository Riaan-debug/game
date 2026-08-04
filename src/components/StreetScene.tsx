import type { ThreeEvent } from '@react-three/fiber';
import { LOCATION_BOUNDS, LOCATION_LABELS, STREET_PORTALS } from '../game/locations';
import { MODEL_PATHS } from '../game/modelPaths';
import type { LocationId } from '../game/types';
import { LocationPropsMeshes } from './LocationProps';
import { LocationSign } from './LocationSign';
import { Model } from './Model';

interface StreetSceneProps {
  onFloorClick: (x: number, z: number) => void;
}

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
        <Model path={MODEL_PATHS.street.fountain} fit={[0.5, 1.1, 0.5]} position={[0, 0, 0]} />
      </group>

      {/* Trees along the edges */}
      {TREE_POSITIONS.map((pos, index) => (
        <Model
          key={index}
          path={MODEL_PATHS.street.tree}
          position={pos}
          fit={[1.1, 1.6, 1.1]}
        />
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

  const handlePadPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onPadClick();
  };

  return (
    <group>
      <Model
        path={MODEL_PATHS.street.facade}
        position={[px, 0, facadeZ]}
        fit={[3.2, 2.2, 0.5]}
      />
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
