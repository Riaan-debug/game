import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import { getCatalogItem } from '../game/furnitureCatalog';
import { useGame } from '../game/GameContext';
import type { PlacedFurniture } from '../game/types';
import { Model } from './Model';

interface PlacedFurnitureMeshProps {
  placed: PlacedFurniture;
  selected: boolean;
  buildMode: boolean;
  onSelect: () => void;
}

export function PlacedFurnitureMeshes() {
  const { world, selectPlaced, interact } = useGame();
  const buildMode = world.mode === 'build' && world.currentLocation === 'home';

  return (
    <group>
      {world.furniture.map((placed) => (
        <PlacedFurnitureMesh
          key={placed.id}
          placed={placed}
          selected={world.build.selectedPlacedId === placed.id}
          buildMode={buildMode}
          onSelect={() => {
            if (buildMode) {
              selectPlaced(placed.id);
            } else {
              const item = getCatalogItem(placed.catalogId);
              if (item?.interaction) interact(placed.id);
            }
          }}
        />
      ))}
    </group>
  );
}

function PlacedFurnitureMesh({ placed, selected, buildMode, onSelect }: PlacedFurnitureMeshProps) {
  const item = getCatalogItem(placed.catalogId);
  const mesh = useMemo(() => {
    if (!item) return null;
    const [w, d] = item.footprint;
    return { w, d, height: item.height, color: item.color, flat: item.flat ?? false };
  }, [item]);

  if (!item || !mesh) return null;

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  return (
    <group position={placed.position} rotation={[0, placed.rotation, 0]}>
      {item.modelPath ? (
        <Model
          path={item.modelPath}
          fit={[mesh.w, mesh.height, mesh.d]}
          onPointerDown={handlePointerDown}
          castShadow={!mesh.flat}
        />
      ) : (
        <mesh castShadow={!mesh.flat} receiveShadow onPointerDown={handlePointerDown}>
          <boxGeometry args={[mesh.w, mesh.height, mesh.d]} />
          <meshStandardMaterial
            color={mesh.color}
            roughness={mesh.flat ? 1 : 0.8}
            emissive={selected ? '#ffffff' : '#000000'}
            emissiveIntensity={selected ? 0.12 : 0}
          />
        </mesh>
      )}
      {buildMode && selected && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[mesh.w + 0.12, 0.04, mesh.d + 0.12]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.55} />
        </mesh>
      )}
      {!buildMode && item.interaction && (
        <mesh position={[0, mesh.height * 0.55, mesh.d * 0.35]}>
          <boxGeometry args={[mesh.w * 0.35, mesh.height * 0.25, 0.08]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.15}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}
    </group>
  );
}
