import { useGame } from '../game/GameContext';
import { HomeScene } from './HomeScene';
import { NpcCharacters } from './NpcCharacters';
import { ParkScene } from './ParkScene';
import { ShopScene } from './ShopScene';
import { SimCharacter } from './SimCharacter';
import { StreetScene } from './StreetScene';
import { WorkScene } from './WorkScene';

interface LocationViewProps {
  onFloorClick: (x: number, z: number) => void;
}

export function LocationView({ onFloorClick }: LocationViewProps) {
  const { world } = useGame();
  const buildMode = world.mode === 'build' && world.currentLocation === 'home';

  return (
    <group>
      {world.currentLocation === 'home' && (
        <HomeScene buildMode={buildMode} onFloorClick={onFloorClick} />
      )}
      {world.currentLocation === 'street' && <StreetScene onFloorClick={onFloorClick} />}
      {world.currentLocation === 'park' && <ParkScene onFloorClick={onFloorClick} />}
      {world.currentLocation === 'work' && <WorkScene onFloorClick={onFloorClick} />}
      {world.currentLocation === 'shop' && <ShopScene onFloorClick={onFloorClick} />}

      <NpcCharacters />
      {!world.isWorking && <SimCharacter sim={world.sim} />}
    </group>
  );
}
