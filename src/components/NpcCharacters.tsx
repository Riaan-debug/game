import type { ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { getHairColor, getSkinTone } from '../game/casCatalog';
import { getActiveNpcs } from '../game/npcLogic';
import { useGame } from '../game/GameContext';

export function NpcCharacters() {
  const { world, talkToNpc } = useGame();
  const npcs = getActiveNpcs(world);

  return (
    <group>
      {npcs.map((npc) => (
        <NpcMesh key={npc.id} npc={npc} onTalk={() => talkToNpc(npc.id)} />
      ))}
    </group>
  );
}

function NpcMesh({
  npc,
  onTalk,
}: {
  npc: ReturnType<typeof getActiveNpcs>[number];
  onTalk: () => void;
}) {
  const skin = getSkinTone(npc.skinToneId);
  const hair = getHairColor(npc.hairColorId);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onTalk();
  };

  return (
    <group position={npc.position}>
      <mesh castShadow position={[0, 0.28, 0]} onPointerDown={handlePointerDown}>
        <boxGeometry args={[0.12, 0.42, 0.14]} />
        <meshStandardMaterial color="#4a4f57" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.82, 0]} onPointerDown={handlePointerDown}>
        <boxGeometry args={[0.38, 0.52, 0.22]} />
        <meshStandardMaterial color={npc.topColor} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 1.42, 0]} onPointerDown={handlePointerDown}>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color={skin} roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, 1.55, -0.02]} onPointerDown={handlePointerDown}>
        <sphereGeometry args={[0.23, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={hair} roughness={0.8} />
      </mesh>
      <Text position={[0, 1.95, 0]} fontSize={0.2} color="#fef3c7" anchorX="center">
        {npc.name}
      </Text>
      <Text position={[0, 1.72, 0]} fontSize={0.12} color="#a8a29e" anchorX="center">
        ♥ {Math.round(npc.friendship)}
      </Text>
    </group>
  );
}
