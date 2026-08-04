import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useGLTF } from '@react-three/drei';
import App from './App';
import { PRELOAD_MODEL_PATHS } from './game/modelPaths';
import './index.css';

for (const path of PRELOAD_MODEL_PATHS) {
  useGLTF.preload(path);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
