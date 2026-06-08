import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './game/GameContext';
import { GameCanvas } from './components/GameCanvas';

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <div className="relative h-full w-full">
          <GameCanvas />
        </div>
      </GameProvider>
    </AuthProvider>
  );
}
