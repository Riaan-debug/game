import { useGame } from '../game/GameContext';
import { getLocationAmbience } from '../game/locationAmbience';

export function LocationAmbienceLights() {
  const { world } = useGame();
  const ambience = getLocationAmbience(world.currentLocation);

  return (
    <pointLight
      position={[0, 3.2, 0]}
      color={ambience.accentColor}
      intensity={ambience.accentIntensity}
      distance={12}
      decay={2}
    />
  );
}
