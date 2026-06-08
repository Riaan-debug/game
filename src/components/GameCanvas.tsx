import { useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ContactShadows,
  Environment,
  OrbitControls,
} from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../game/GameContext';
import { getLocationAmbience } from '../game/locationAmbience';
import { DayNightLighting } from './DayNightLighting';
import { LocationAmbienceLights } from './LocationAmbienceLights';
import { NeedsHUD } from './NeedsHUD';
import { BuildToolbar } from './BuildToolbar';
import { CreateSimPanel } from './CreateSimPanel';
import { LocationView } from './LocationView';
import { AccountPanel } from './AccountPanel';
import { NeighborhoodHub } from './NeighborhoodHub';
import { TravelTransition } from './TravelTransition';
import { WorkOverlay } from './WorkOverlay';

function SimulationLoop() {
  const { tick, world } = useGame();

  useFrame((_state, delta) => {
    if (world.mode === 'live') {
      tick(Math.min(delta, 0.05));
    }
  });

  return null;
}

function SceneContents() {
  const { world, moveTo, placeAt } = useGame();
  const buildMode = world.mode === 'build' && world.currentLocation === 'home';
  const { environment } = getLocationAmbience(world.currentLocation);

  const handleFloorClick = (x: number, z: number) => {
    if (buildMode) {
      placeAt(x, z);
      return;
    }
    if (!world.isWorking) {
      moveTo(x, z);
    }
  };

  return (
    <>
      <DayNightLighting />
      <LocationAmbienceLights />
      <Environment preset={environment} />

      <LocationView onFloorClick={handleFloorClick} />
      <ContactShadows opacity={0.45} scale={10} blur={2.5} far={4} />

      <OrbitControls
        makeDefault
        enablePan={false}
        minPolarAngle={0.6}
        maxPolarAngle={1.45}
        minDistance={5}
        maxDistance={12}
        target={[0, 0.8, 0]}
      />
    </>
  );
}

function ResizeHandler() {
  const { gl, camera, size } = useThree();
  const isMobile = size.width < 768;

  useEffect(() => {
    gl.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
  }, [gl, isMobile]);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(isMobile ? 0 : 0, isMobile ? 7.5 : 6.5, isMobile ? 8.5 : 7.5);
      camera.updateProjectionMatrix();
    }
  }, [camera, isMobile]);

  return null;
}

export function GameCanvas() {
  const { ready } = useGame();

  if (!ready) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#1a1625] text-stone-300">
        Loading your world...
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 45, near: 0.1, far: 50, position: [0, 6.5, 7.5] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <ResizeHandler />
        <SimulationLoop />
        <SceneContents />
      </Canvas>
      <AccountPanel />
      <TravelTransition />
      <NeighborhoodHub />
      <WorkOverlay />
      <BuildToolbar />
      <CreateSimPanel />
      <NeedsHUD />
    </div>
  );
}
