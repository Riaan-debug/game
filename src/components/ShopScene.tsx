import { LocationFloor } from './LocationFloor';

import { LocationPropsMeshes } from './LocationProps';

import { LocationSign } from './LocationSign';



interface ShopSceneProps {

  onFloorClick: (x: number, z: number) => void;

}



export function ShopScene({ onFloorClick }: ShopSceneProps) {

  return (

    <group>

      <LocationFloor floorColor="#d4c4a8" rugColor="#e0d4c0" onFloorClick={onFloorClick} />

      <LocationSign label="Corner Shop" boardColor="#c45c4a" postColor="#8b4a3a" />



      <mesh position={[-2.8, 1.4, -2.5]} castShadow>

        <boxGeometry args={[0.5, 2.8, 1.2]} />

        <meshStandardMaterial color="#8b6340" roughness={0.85} />

      </mesh>

      <mesh position={[2.8, 1.4, -2.5]} castShadow>

        <boxGeometry args={[0.5, 2.8, 1.2]} />

        <meshStandardMaterial color="#8b6340" roughness={0.85} />

      </mesh>



      <mesh position={[0, 2.2, -3.5]} castShadow>

        <boxGeometry args={[5, 0.4, 0.5]} />

        <meshStandardMaterial color="#e8b4b8" roughness={0.7} />

      </mesh>

      <mesh position={[0, 2.45, -3.48]}>

        <boxGeometry args={[4.2, 0.12, 0.35]} />

        <meshStandardMaterial

          color="#ffeedd"

          emissive="#ffcc88"

          emissiveIntensity={0.25}

          roughness={0.5}

        />

      </mesh>



      <mesh position={[-1.5, 0.9, -1.2]} castShadow>

        <boxGeometry args={[0.9, 1.8, 0.5]} />

        <meshStandardMaterial color="#d8d2c8" roughness={0.75} />

      </mesh>

      <mesh position={[1.5, 0.55, -0.8]} castShadow>

        <boxGeometry args={[1.1, 1.1, 0.55]} />

        <meshStandardMaterial color="#c9a87c" roughness={0.8} />

      </mesh>



      <LocationPropsMeshes />

    </group>

  );

}


