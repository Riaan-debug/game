import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  canPlaceFurniture,
  rotateQuarterTurn,
  snapToGrid,
} from './buildLogic';
import {
  buySnack,
  clockInToWork,
  queueNpcTalk,
  queuePropInteraction,
  travelToLocation,
} from './neighborhoodLogic';
import type { GameMode, LocationId, SimAppearance, WorldState } from './types';
import {
  cancelActivity,
  createInitialWorldState,
  migrateWorldState,
  moveSimTo,
  queueInteraction,
  leaveWorkEarly,
  tickWorld,
  updateSimAppearance,
} from './simLogic';
import { getActiveNpcs } from './npcLogic';
import { getPortalNear } from './locations';
import { getLocationProp } from './locationProps';
import { bootstrapWorldState, type SaveConflict } from './bootstrapSave';
import { upsertCloudSave } from './cloudSave';
import { useAuth } from '../context/AuthContext';
import { SaveConflictModal } from '../components/SaveConflictModal';
import { saveWorldState } from './saveStorage';
import { setLocalSaveUpdatedAt } from './syncMeta';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

type GameAction =
  | { type: 'HYDRATE'; state: WorldState }
  | { type: 'TICK'; delta: number }
  | { type: 'MOVE'; x: number; z: number }
  | { type: 'INTERACT'; furnitureId: string }
  | { type: 'CANCEL' }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SELECT_CATALOG'; catalogId: string }
  | { type: 'SELECT_PLACED'; placedId: string | null }
  | { type: 'ROTATE_PLACEMENT' }
  | { type: 'ROTATE_SELECTED' }
  | { type: 'DELETE_SELECTED' }
  | { type: 'PLACE_AT'; x: number; z: number }
  | { type: 'RESET_SAVE' }
  | { type: 'SET_APPEARANCE'; patch: Partial<SimAppearance> }
  | { type: 'TRAVEL'; location: LocationId }
  | { type: 'TALK_NPC'; npcId: string }
  | { type: 'USE_PROP'; propId: string }
  | { type: 'CLOCK_IN' }
  | { type: 'BUY_SNACK' }
  | { type: 'LEAVE_WORK' };

function gameReducer(state: WorldState, action: GameAction): WorldState {
  switch (action.type) {
    case 'HYDRATE':
      return migrateWorldState(action.state);
    case 'TICK': {
      const next = tickWorld(state, action.delta);
      if (next.currentLocation === 'street' && !next.isWorking) {
        const portal = getPortalNear(next.sim.position);
        if (portal) return travelToLocation(next, portal.location);
      }
      return next;
    }
    case 'MOVE':
      if (state.mode !== 'live' || state.isWorking) return state;
      return { ...state, sim: moveSimTo(state.sim, action.x, action.z, state.currentLocation) };
    case 'INTERACT':
      if (state.mode !== 'live' || state.isWorking || state.currentLocation !== 'home') return state;
      return { ...state, sim: queueInteraction(state.sim, action.furnitureId, state) };
    case 'TRAVEL':
      return travelToLocation(state, action.location);
    case 'TALK_NPC': {
      if (state.isWorking) return state;
      const npc = getActiveNpcs(state).find((n) => n.id === action.npcId);
      if (!npc) return state;
      return { ...state, sim: queueNpcTalk(state.sim, npc.id, npc.approach) };
    }
    case 'USE_PROP': {
      if (state.isWorking) return state;
      const prop = getLocationProp(action.propId);
      if (!prop) return state;
      if (prop.action === 'clock_in') return clockInToWork(state);
      if (prop.action === 'buy_snack') return buySnack(state);
      const nextSim = queuePropInteraction(state.sim, action.propId);
      if (!nextSim) return state;
      return { ...state, sim: nextSim };
    }
    case 'CLOCK_IN':
      return clockInToWork(state);
    case 'BUY_SNACK':
      return buySnack(state);
    case 'LEAVE_WORK':
      return leaveWorkEarly(state);
    case 'CANCEL':
      return { ...state, sim: cancelActivity(state.sim) };
    case 'SET_MODE':
      if (state.currentLocation !== 'home' || state.isWorking) return state;
      return {
        ...state,
        mode: action.mode,
        build: { ...state.build, selectedPlacedId: null },
        sim: action.mode === 'build' ? cancelActivity(state.sim) : state.sim,
      };
    case 'SELECT_CATALOG':
      return {
        ...state,
        build: {
          ...state.build,
          selectedCatalogId: action.catalogId,
          selectedPlacedId: null,
        },
      };
    case 'SELECT_PLACED':
      return {
        ...state,
        build: { ...state.build, selectedPlacedId: action.placedId },
      };
    case 'ROTATE_PLACEMENT':
      return {
        ...state,
        build: {
          ...state.build,
          placementRotation: rotateQuarterTurn(state.build.placementRotation),
        },
      };
    case 'ROTATE_SELECTED': {
      const selected = state.furniture.find((item) => item.id === state.build.selectedPlacedId);
      if (!selected) return state;
      const rotation = rotateQuarterTurn(selected.rotation);
      if (!canPlaceFurniture(selected.catalogId, selected.position, rotation, state.furniture, selected.id)) {
        return state;
      }
      return {
        ...state,
        furniture: state.furniture.map((item) =>
          item.id === selected.id ? { ...item, rotation } : item,
        ),
      };
    }
    case 'DELETE_SELECTED':
      if (!state.build.selectedPlacedId) return state;
      return {
        ...state,
        furniture: state.furniture.filter((item) => item.id !== state.build.selectedPlacedId),
        build: { ...state.build, selectedPlacedId: null },
      };
    case 'PLACE_AT': {
      if (state.mode !== 'build' || state.currentLocation !== 'home') return state;
      const [x, z] = snapToGrid(action.x, action.z);
      const position: [number, number, number] = [x, 0, z];

      if (state.build.selectedPlacedId) {
        const selected = state.furniture.find((item) => item.id === state.build.selectedPlacedId);
        if (!selected) return state;
        if (!canPlaceFurniture(selected.catalogId, position, selected.rotation, state.furniture, selected.id)) {
          return state;
        }
        return {
          ...state,
          furniture: state.furniture.map((item) =>
            item.id === selected.id ? { ...item, position } : item,
          ),
        };
      }

      const { selectedCatalogId, placementRotation } = state.build;
      if (!canPlaceFurniture(selectedCatalogId, position, placementRotation, state.furniture)) {
        return state;
      }

      return {
        ...state,
        furniture: [
          ...state.furniture,
          {
            id: uuidv4(),
            catalogId: selectedCatalogId,
            position,
            rotation: placementRotation,
          },
        ],
      };
    }
    case 'RESET_SAVE':
      return createInitialWorldState();
    case 'SET_APPEARANCE':
      return { ...state, sim: updateSimAppearance(state.sim, action.patch) };
    default:
      return state;
  }
}

interface GameContextValue {
  world: WorldState;
  ready: boolean;
  syncStatus: SyncStatus;
  resolveSaveConflict: (choice: 'local' | 'cloud') => void;
  syncNow: () => void;
  moveTo: (x: number, z: number) => void;
  interact: (furnitureId: string) => void;
  cancel: () => void;
  tick: (delta: number) => void;
  setMode: (mode: GameMode) => void;
  selectCatalog: (catalogId: string) => void;
  selectPlaced: (placedId: string | null) => void;
  rotatePlacement: () => void;
  rotateSelected: () => void;
  deleteSelected: () => void;
  placeAt: (x: number, z: number) => void;
  resetSave: () => void;
  setAppearance: (patch: Partial<SimAppearance>) => void;
  travel: (location: LocationId) => void;
  talkToNpc: (npcId: string) => void;
  useProp: (propId: string) => void;
  leaveWork: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user, sessionReady } = useAuth();
  const [world, dispatch] = useReducer(gameReducer, createInitialWorldState());
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [saveConflict, setSaveConflict] = useState<SaveConflict | null>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!sessionReady) return;

    let cancelled = false;
    setReady(false);
    setSaveConflict(null);

    bootstrapWorldState(userId).then(async (result) => {
      if (cancelled) return;

      if (result.kind === 'conflict') {
        setSaveConflict(result.conflict);
        setReady(true);
        return;
      }

      if (result.kind === 'state') {
        dispatch({ type: 'HYDRATE', state: result.state });
        await saveWorldState(result.state);
        setLocalSaveUpdatedAt(Date.now());

        if (userId) {
          setSyncStatus('syncing');
          try {
            await upsertCloudSave(userId, result.state);
            if (!cancelled) setSyncStatus('synced');
          } catch {
            if (!cancelled) setSyncStatus('error');
          }
        }
      }

      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionReady, userId]);

  const applyResolvedSave = useCallback(
    async (state: WorldState, upload: boolean) => {
      dispatch({ type: 'HYDRATE', state });
      await saveWorldState(state);
      setLocalSaveUpdatedAt(Date.now());
      setSaveConflict(null);
      setReady(true);

      if (upload && userId) {
        setSyncStatus('syncing');
        try {
          await upsertCloudSave(userId, state);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      }
    },
    [userId],
  );

  const resolveSaveConflict = useCallback(
    (choice: 'local' | 'cloud') => {
      if (!saveConflict) return;
      const state =
        choice === 'local' ? saveConflict.local : saveConflict.cloud.world_json;
      void applyResolvedSave(state, true);
    },
    [saveConflict, applyResolvedSave],
  );

  useEffect(() => {
    if (!ready || saveConflict) return;

    const timer = window.setTimeout(() => {
      void (async () => {
        await saveWorldState(world);

        if (!userId) {
          setSyncStatus('idle');
          return;
        }

        setSyncStatus('syncing');
        try {
          await upsertCloudSave(userId, world);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      })();
    }, 800);

    return () => window.clearTimeout(timer);
  }, [world, ready, userId, saveConflict]);

  const moveTo = useCallback((x: number, z: number) => {
    dispatch({ type: 'MOVE', x, z });
  }, []);

  const interact = useCallback((furnitureId: string) => {
    dispatch({ type: 'INTERACT', furnitureId });
  }, []);

  const cancel = useCallback(() => {
    dispatch({ type: 'CANCEL' });
  }, []);

  const tick = useCallback((delta: number) => {
    dispatch({ type: 'TICK', delta });
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const selectCatalog = useCallback((catalogId: string) => {
    dispatch({ type: 'SELECT_CATALOG', catalogId });
  }, []);

  const selectPlaced = useCallback((placedId: string | null) => {
    dispatch({ type: 'SELECT_PLACED', placedId });
  }, []);

  const rotatePlacement = useCallback(() => {
    dispatch({ type: 'ROTATE_PLACEMENT' });
  }, []);

  const rotateSelected = useCallback(() => {
    dispatch({ type: 'ROTATE_SELECTED' });
  }, []);

  const deleteSelected = useCallback(() => {
    dispatch({ type: 'DELETE_SELECTED' });
  }, []);

  const placeAt = useCallback((x: number, z: number) => {
    dispatch({ type: 'PLACE_AT', x, z });
  }, []);

  const resetSave = useCallback(() => {
    dispatch({ type: 'RESET_SAVE' });
  }, []);

  const setAppearance = useCallback((patch: Partial<SimAppearance>) => {
    dispatch({ type: 'SET_APPEARANCE', patch });
  }, []);

  const travel = useCallback((location: LocationId) => {
    dispatch({ type: 'TRAVEL', location });
  }, []);

  const talkToNpc = useCallback((npcId: string) => {
    dispatch({ type: 'TALK_NPC', npcId });
  }, []);

  const useProp = useCallback((propId: string) => {
    dispatch({ type: 'USE_PROP', propId });
  }, []);

  const leaveWork = useCallback(() => {
    dispatch({ type: 'LEAVE_WORK' });
  }, []);

  const syncNow = useCallback(() => {
    if (!userId || !ready || saveConflict) return;

    void (async () => {
      setSyncStatus('syncing');
      try {
        await saveWorldState(world);
        await upsertCloudSave(userId, world);
        setSyncStatus('synced');
      } catch {
        setSyncStatus('error');
      }
    })();
  }, [userId, ready, saveConflict, world]);

  const value = useMemo(
    () => ({
      world,
      ready,
      syncStatus,
      resolveSaveConflict,
      syncNow,
      moveTo,
      interact,
      cancel,
      tick,
      setMode,
      selectCatalog,
      selectPlaced,
      rotatePlacement,
      rotateSelected,
      deleteSelected,
      placeAt,
      resetSave,
      setAppearance,
      travel,
      talkToNpc,
      useProp,
      leaveWork,
    }),
    [
      world,
      ready,
      syncStatus,
      resolveSaveConflict,
      syncNow,
      moveTo,
      interact,
      cancel,
      tick,
      setMode,
      selectCatalog,
      selectPlaced,
      rotatePlacement,
      rotateSelected,
      deleteSelected,
      placeAt,
      resetSave,
      setAppearance,
      travel,
      talkToNpc,
      useProp,
      leaveWork,
    ],
  );

  return (
    <GameContext.Provider value={value}>
      {saveConflict && (
        <SaveConflictModal conflict={saveConflict} onChoose={resolveSaveConflict} />
      )}
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
