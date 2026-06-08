import { v4 as uuidv4 } from 'uuid';
import { GRID_SIZE, getCatalogItem } from './furnitureCatalog';
import { ROOM_HALF } from './constants';
import type { FurnitureCatalogItem, PlacedFurniture } from './types';

export function snapToGrid(x: number, z: number): [number, number] {
  return [
    Math.round(x / GRID_SIZE) * GRID_SIZE,
    Math.round(z / GRID_SIZE) * GRID_SIZE,
  ];
}

function rotateOffset(offset: [number, number], rotation: number): [number, number] {
  const [ox, oz] = offset;
  const sin = Math.sin(rotation);
  const cos = Math.cos(rotation);
  return [ox * cos - oz * sin, ox * sin + oz * cos];
}

function getFootprintSize(item: FurnitureCatalogItem, rotation: number): [number, number] {
  const [w, d] = item.footprint;
  const quarterTurns = Math.round(rotation / (Math.PI / 2)) % 2;
  return quarterTurns === 0 ? [w, d] : [d, w];
}

function getBounds(position: [number, number, number], size: [number, number]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
} {
  const [x, , z] = position;
  const [w, d] = size;
  return {
    minX: x - w / 2,
    maxX: x + w / 2,
    minZ: z - d / 2,
    maxZ: z + d / 2,
  };
}

function boundsOverlap(
  a: ReturnType<typeof getBounds>,
  b: ReturnType<typeof getBounds>,
): boolean {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

export function canPlaceFurniture(
  catalogId: string,
  position: [number, number, number],
  rotation: number,
  furniture: PlacedFurniture[],
  ignoreId?: string,
): boolean {
  const item = getCatalogItem(catalogId);
  if (!item) return false;

  const size = getFootprintSize(item, rotation);
  const bounds = getBounds(position, size);
  const margin = 0.2;

  if (
    bounds.minX < -ROOM_HALF + margin ||
    bounds.maxX > ROOM_HALF - margin ||
    bounds.minZ < -ROOM_HALF + margin ||
    bounds.maxZ > ROOM_HALF - margin
  ) {
    return false;
  }

  for (const placed of furniture) {
    if (placed.id === ignoreId) continue;
    const placedItem = getCatalogItem(placed.catalogId);
    if (!placedItem) continue;
    const placedBounds = getBounds(placed.position, getFootprintSize(placedItem, placed.rotation));
    if (boundsOverlap(bounds, placedBounds)) return false;
  }

  return true;
}

export function createPlacedFurniture(
  catalogId: string,
  x: number,
  z: number,
  rotation: number,
): PlacedFurniture | null {
  const [sx, sz] = snapToGrid(x, z);
  const position: [number, number, number] = [sx, 0, sz];
  if (!canPlaceFurniture(catalogId, position, rotation, [])) {
    return null;
  }
  return {
    id: uuidv4(),
    catalogId,
    position,
    rotation,
  };
}

export function rotateQuarterTurn(rotation: number): number {
  return (rotation + Math.PI / 2) % (Math.PI * 2);
}

export function getApproachPosition(placed: PlacedFurniture, item: FurnitureCatalogItem): [number, number, number] {
  const offset = item.approachOffset ?? [0, Math.min(item.footprint[1] / 2 + 0.2, 0.8)];
  const [ox, oz] = rotateOffset(offset, placed.rotation);
  const [x, , z] = placed.position;
  return [x + ox, 0, z + oz];
}

export function getInteractablesFromFurniture(furniture: PlacedFurniture[]) {
  return furniture.flatMap((placed) => {
    const item = getCatalogItem(placed.catalogId);
    if (!item?.interaction) return [];
    return [{
      id: placed.id,
      label: item.name,
      position: placed.position,
      approach: getApproachPosition(placed, item),
      color: item.color,
      interaction: item.interaction,
    }];
  });
}
