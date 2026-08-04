import type { ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { getActiveNpcs } from '../game/npcLogic';
import { useGame } from '../game/GameContext';
import { AnimatedCharacterModel } from './AnimatedCharacterModel';

export function NpcCharacters() {
  const { world, talkToNpc } = useGame();
  const npcs = getActiveNpcs(world);

  return (
    <group>
      {npcs.map((npc) => {
        const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          talkToNpc(npc.id);
        };

        return (
          <group key={npc.id}>
            <AnimatedCharacterModel
              activity="idle"
              position={npc.position}
              rotation={0}
              tint={npc.topColor}
              onPointerDown={handlePointerDown}
            />
            <Text position={[npc.position[0], 1.95, npc.position[2]]} fontSize={0.2} color="#fef3c7" anchorX="center">
              {npc.name}
            </Text>
            <Text position={[npc.position[0], 1.72, npc.position[2]]} fontSize={0.12} color="#a8a29e" anchorX="center">
              ♥ {Math.round(npc.friendship)}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
