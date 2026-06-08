export interface HairStyleDef {
  id: string;
  name: string;
  type: 'short' | 'medium' | 'long' | 'bun';
}

export interface OutfitDef {
  id: string;
  name: string;
  topColor: string;
  bottomColor: string;
  shoeColor: string;
}

export const SKIN_TONES = [
  { id: 'porcelain', color: '#f5dcc8' },
  { id: 'light', color: '#e8c9a8' },
  { id: 'medium', color: '#d4a574' },
  { id: 'tan', color: '#b8835a' },
  { id: 'deep', color: '#8d5524' },
  { id: 'rich', color: '#6b4226' },
] as const;

export const HAIR_COLORS = [
  { id: 'black', color: '#1f1a17' },
  { id: 'brown', color: '#5a3d2b' },
  { id: 'auburn', color: '#8b4513' },
  { id: 'blonde', color: '#d4b26a' },
  { id: 'platinum', color: '#e8dcc4' },
  { id: 'red', color: '#a0432a' },
  { id: 'gray', color: '#8a8a8a' },
  { id: 'blue', color: '#4a6fa5' },
] as const;

export const HAIR_STYLES: HairStyleDef[] = [
  { id: 'short_crop', name: 'Short Crop', type: 'short' },
  { id: 'medium_wavy', name: 'Medium Wavy', type: 'medium' },
  { id: 'long_straight', name: 'Long Straight', type: 'long' },
  { id: 'top_bun', name: 'Top Bun', type: 'bun' },
];

export const OUTFITS: OutfitDef[] = [
  { id: 'casual_blue', name: 'Casual Blue', topColor: '#4a6fa5', bottomColor: '#2f3f54', shoeColor: '#1f2937' },
  { id: 'casual_green', name: 'Casual Green', topColor: '#5f8f5a', bottomColor: '#3d4f3a', shoeColor: '#2a3328' },
  { id: 'office_neutral', name: 'Office Neutral', topColor: '#d8d2c8', bottomColor: '#4a4f57', shoeColor: '#1f1f1f' },
  { id: 'cozy_knit', name: 'Cozy Knit', topColor: '#9b7d93', bottomColor: '#5c4a62', shoeColor: '#3d3340' },
  { id: 'sporty_red', name: 'Sporty Red', topColor: '#c45c4a', bottomColor: '#2f343a', shoeColor: '#ffffff' },
  { id: 'evening_dark', name: 'Evening Dark', topColor: '#2f343a', bottomColor: '#1a1625', shoeColor: '#0f0f0f' },
  { id: 'summer_light', name: 'Summer Light', topColor: '#f0e6d8', bottomColor: '#c9b8a8', shoeColor: '#8b7355' },
  { id: 'denim', name: 'Denim Days', topColor: '#6b8cce', bottomColor: '#4a6fa5', shoeColor: '#f5f0eb' },
  { id: 'pastel_pink', name: 'Pastel Pink', topColor: '#e8b4b8', bottomColor: '#c49a6c', shoeColor: '#f5f0eb' },
  { id: 'streetwear', name: 'Streetwear', topColor: '#7a6048', bottomColor: '#3d4658', shoeColor: '#f97316' },
];

export const DEFAULT_APPEARANCE = {
  skinToneId: 'medium',
  hairStyleId: 'medium_wavy',
  hairColorId: 'brown',
  outfitId: 'casual_blue',
} as const;

export function getSkinTone(id: string): string {
  return SKIN_TONES.find((tone) => tone.id === id)?.color ?? SKIN_TONES[2].color;
}

export function getHairColor(id: string): string {
  return HAIR_COLORS.find((color) => color.id === id)?.color ?? HAIR_COLORS[1].color;
}

export function getHairStyle(id: string): HairStyleDef {
  return HAIR_STYLES.find((style) => style.id === id) ?? HAIR_STYLES[1];
}

export function getOutfit(id: string): OutfitDef {
  return OUTFITS.find((outfit) => outfit.id === id) ?? OUTFITS[0];
}
