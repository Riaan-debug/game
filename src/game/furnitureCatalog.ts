import type { FurnitureCatalogItem, FurnitureCategory } from './types';
import { MODEL_PATHS } from './modelPaths';

export const GRID_SIZE = 0.5;

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  { id: 'bed', name: 'Bed', category: 'bedroom', footprint: [3.6, 2.4], height: 0.7, color: '#5f7ab8', modelPath: MODEL_PATHS.furniture.bed, interaction: 'sleep', approachOffset: [0.6, 0.6] },
  { id: 'nightstand', name: 'Nightstand', category: 'bedroom', footprint: [0.6, 0.6], height: 0.55, color: '#8b6340' },
  { id: 'dresser', name: 'Dresser', category: 'bedroom', footprint: [1.2, 0.5], height: 1.0, color: '#7a5c42' },
  { id: 'floor_lamp', name: 'Floor Lamp', category: 'decor', footprint: [0.4, 0.4], height: 1.6, color: '#d4c4a8' },
  { id: 'chair', name: 'Chair', category: 'seating', footprint: [0.55, 0.55], height: 0.9, color: '#8b6340', modelPath: MODEL_PATHS.furniture.chair, interaction: 'sit', approachOffset: [0, 0.45] },
  { id: 'couch', name: 'Couch', category: 'seating', footprint: [2.0, 0.9], height: 0.85, color: '#6d7f8b', modelPath: MODEL_PATHS.furniture.couch, interaction: 'sit', approachOffset: [0, 0.65] },
  { id: 'armchair', name: 'Armchair', category: 'seating', footprint: [0.9, 0.9], height: 0.85, color: '#7a6a8f', interaction: 'sit', approachOffset: [0, 0.55] },
  { id: 'fridge', name: 'Fridge', category: 'kitchen', footprint: [0.8, 0.7], height: 2.0, color: '#95a3ad', interaction: 'eat', approachOffset: [-0.55, 0] },
  { id: 'stove', name: 'Stove', category: 'kitchen', footprint: [0.8, 0.7], height: 0.95, color: '#4a4f57' },
  { id: 'kitchen_counter', name: 'Counter', category: 'kitchen', footprint: [1.2, 0.6], height: 0.9, color: '#d8d2c8' },
  { id: 'dining_table', name: 'Dining Table', category: 'kitchen', footprint: [1.4, 0.9], height: 0.78, color: '#a8845d' },
  { id: 'coffee_table', name: 'Coffee Table', category: 'tables', footprint: [1.0, 0.6], height: 0.42, color: '#8f6a4b' },
  { id: 'desk', name: 'Desk', category: 'tables', footprint: [1.2, 0.7], height: 0.78, color: '#7a6048', modelPath: MODEL_PATHS.furniture.desk },
  { id: 'bookshelf', name: 'Bookshelf', category: 'decor', footprint: [1.0, 0.4], height: 1.8, color: '#6b4f38', interaction: 'read', approachOffset: [0, 0.55] },
  { id: 'tv_stand', name: 'TV Stand', category: 'decor', footprint: [1.2, 0.4], height: 0.55, color: '#3d4658', interaction: 'watch', approachOffset: [0, 0.65] },
  { id: 'plant', name: 'Plant', category: 'decor', footprint: [0.5, 0.5], height: 0.75, color: '#5f8f5a' },
  { id: 'rug', name: 'Rug', category: 'decor', footprint: [2.0, 1.5], height: 0.05, color: '#9b7d93', flat: true },
  { id: 'table_lamp', name: 'Table Lamp', category: 'decor', footprint: [0.35, 0.35], height: 0.55, color: '#e8dcc8' },
  { id: 'toilet', name: 'Shower', category: 'decor', footprint: [0.6, 0.5], height: 0.75, color: '#eef1f4', interaction: 'shower', approachOffset: [0, 0.45] },
  { id: 'microwave', name: 'Microwave', category: 'kitchen', footprint: [0.5, 0.4], height: 0.32, color: '#2f343a' },
];

export const FURNITURE_CATEGORIES: { id: FurnitureCategory; label: string }[] = [
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'seating', label: 'Seating' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'tables', label: 'Tables' },
  { id: 'decor', label: 'Decor' },
];

export function getCatalogItem(id: string): FurnitureCatalogItem | undefined {
  return FURNITURE_CATALOG.find((item) => item.id === id);
}

export function getCatalogByCategory(category: FurnitureCategory): FurnitureCatalogItem[] {
  return FURNITURE_CATALOG.filter((item) => item.category === category);
}
