import { AnimatedCharacterModel } from './AnimatedCharacterModel';
import type { SimState } from '../game/types';

interface SimCharacterProps {
  sim: SimState;
}

export function SimCharacter({ sim }: SimCharacterProps) {
  return (
    <AnimatedCharacterModel
      activity={sim.activity}
      position={sim.position}
      rotation={sim.rotation}
    />
  );
}
