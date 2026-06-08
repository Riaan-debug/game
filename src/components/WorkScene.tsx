import { LocationFloor } from './LocationFloor';

import { LocationPropsMeshes } from './LocationProps';

import { LocationSign } from './LocationSign';



interface WorkSceneProps {

  onFloorClick: (x: number, z: number) => void;

}



export function WorkScene({ onFloorClick }: WorkSceneProps) {

  return (

    <group>

      <LocationFloor floorColor="#b8b0a4" rugColor="#c9c2b8" onFloorClick={onFloorClick} />

      <LocationSign label="Downtown Office" boardColor="#4a5568" postColor="#3d4450" />



      <mesh position={[0, 1.2, -3.6]} castShadow>

        <boxGeometry args={[6, 2.4, 0.12]} />

        <meshStandardMaterial color="#8ab4e8" roughness={0.25} metalness={0.1} />

      </mesh>



      {[-2.5, 2.5].map((x) => (

        <group key={x} position={[x, 0, -1]}>

          <mesh castShadow position={[0, 0.5, 0]}>

            <boxGeometry args={[1.2, 1, 0.6]} />

            <meshStandardMaterial color="#7a6048" roughness={0.8} />

          </mesh>

          <mesh castShadow position={[0, 1.05, -0.2]}>

            <boxGeometry args={[0.7, 0.08, 0.45]} />

            <meshStandardMaterial color="#2a2a32" roughness={0.4} metalness={0.2} />

          </mesh>

        </group>

      ))}



      <mesh position={[0, 2.5, -3.55]}>

        <boxGeometry args={[1.8, 0.35, 0.08]} />

        <meshStandardMaterial

          color="#f0c040"

          emissive="#f0a020"

          emissiveIntensity={0.35}

          roughness={0.6}

        />

      </mesh>



      <LocationPropsMeshes />

    </group>

  );

}


