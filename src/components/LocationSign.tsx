import { Text } from '@react-three/drei';

interface LocationSignProps {
  label: string;
  position?: [number, number, number];
  boardColor?: string;
  postColor?: string;
}

export function LocationSign({
  label,
  position = [0, 0, -3.2],
  boardColor = '#5c4a38',
  postColor = '#4a3d32',
}: LocationSignProps) {
  return (
    <group position={position}>
      <mesh position={[-0.35, 0.65, 0]} castShadow>
        <boxGeometry args={[0.08, 1.3, 0.08]} />
        <meshStandardMaterial color={postColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.35, 0.65, 0]} castShadow>
        <boxGeometry args={[0.08, 1.3, 0.08]} />
        <meshStandardMaterial color={postColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[1.6, 0.55, 0.1]} />
        <meshStandardMaterial color={boardColor} roughness={0.75} />
      </mesh>
      <Text
        position={[0, 1.35, 0.06]}
        fontSize={0.22}
        color="#f5f0e8"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
      >
        {label}
      </Text>
    </group>
  );
}
