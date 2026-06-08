import { LocationFloor } from './LocationFloor';

import { LocationPropsMeshes } from './LocationProps';

import { LocationSign } from './LocationSign';



interface ParkSceneProps {

  onFloorClick: (x: number, z: number) => void;

}



export function ParkScene({ onFloorClick }: ParkSceneProps) {

  return (

    <group>

      <LocationFloor floorColor="#6b8f5a" rugColor="#7fa368" onFloorClick={onFloorClick} />

      <LocationSign label="Greenwood Park" boardColor="#4a6b42" postColor="#3d5238" />



      {[

        [-2.5, 0, -2.5],

        [2.8, 0, -1.5],

        [-1, 0, 2.5],

        [3, 0, 2],

      ].map((pos, index) => (

        <group key={index} position={pos as [number, number, number]}>

          <mesh castShadow position={[0, 0.6, 0]}>

            <cylinderGeometry args={[0.12, 0.18, 1.2, 8]} />

            <meshStandardMaterial color="#5a4a38" roughness={0.9} />

          </mesh>

          <mesh castShadow position={[0, 1.5, 0]}>

            <sphereGeometry args={[0.55, 10, 10]} />

            <meshStandardMaterial color="#4f7a4a" roughness={0.85} />

          </mesh>

        </group>

      ))}



      <mesh position={[2, 0.04, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>

        <circleGeometry args={[1.1, 24]} />

        <meshStandardMaterial color="#4a8fbf" roughness={0.15} metalness={0.15} />

      </mesh>

      <mesh position={[2, 0.02, 2]} rotation={[-Math.PI / 2, 0, 0]}>

        <ringGeometry args={[1.12, 1.28, 32]} />

        <meshStandardMaterial color="#6b9e6a" roughness={0.9} />

      </mesh>



      <mesh position={[-2.2, 0.35, 1.8]} castShadow>

        <boxGeometry args={[1.1, 0.7, 0.5]} />

        <meshStandardMaterial color="#8b6340" roughness={0.85} />

      </mesh>



      <LocationPropsMeshes />

    </group>

  );

}


