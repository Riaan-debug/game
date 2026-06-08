import { Grid } from '@react-three/drei';
import { GRID_SIZE } from '../game/furnitureCatalog';
import { ROOM_SIZE } from '../game/constants';

export function BuildGrid() {
  return (
    <Grid
      position={[0, 0.02, 0]}
      args={[ROOM_SIZE, ROOM_SIZE]}
      cellSize={GRID_SIZE}
      cellThickness={0.45}
      cellColor="#ffffff"
      sectionSize={GRID_SIZE * 4}
      sectionThickness={1}
      sectionColor="#ffffff"
      fadeDistance={18}
      infiniteGrid={false}
    />
  );
}
