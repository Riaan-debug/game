import { useGame } from '../game/GameContext';
import { getLocationAmbience } from '../game/locationAmbience';
import { getDaylightFactor, getSkyColors } from '../game/moodLogic';

export function DayNightLighting() {
  const { world } = useGame();
  const daylight = getDaylightFactor(world.simTimeMinutes);
  const { background, fog } = getSkyColors(world.simTimeMinutes);
  const { fogFarOffset } = getLocationAmbience(world.currentLocation);

  return (
    <>
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[fog, 10, 22 + daylight * 4 + fogFarOffset]} />
      <ambientLight intensity={0.25 + daylight * 0.45} />
      <directionalLight
        castShadow
        intensity={0.35 + daylight * 0.95}
        position={[5, 8 + daylight * 2, 3]}
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
}
