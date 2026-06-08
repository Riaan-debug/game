import { BuildGrid } from './BuildGrid';
import { PlacedFurnitureMeshes } from './PlacedFurniture';
import { LocationSign } from './LocationSign';
import { Room } from './Room';

interface HomeSceneProps {
  buildMode: boolean;
  onFloorClick: (x: number, z: number) => void;
}

export function HomeScene({ buildMode, onFloorClick }: HomeSceneProps) {
  return (
    <group>
      <LocationSign label="Your Home" boardColor="#6b5d52" postColor="#52483f" position={[2.8, 0, -3.2]} />
      <Room buildMode={buildMode} onFloorClick={onFloorClick} />
      {buildMode && <BuildGrid />}
      <PlacedFurnitureMeshes />
    </group>
  );
}
