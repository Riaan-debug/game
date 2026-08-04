/** Committed GLB/GLTF assets under /public/models. */
export const MODEL_PATHS = {
  character: '/models/characters/character.glb',
  furniture: {
    bed: '/models/furniture/bed_double_A.gltf',
    chair: '/models/furniture/chair_A.gltf',
    couch: '/models/furniture/couch.gltf',
    desk: '/models/furniture/table_medium.gltf',
  },
  street: {
    tree: '/models/street/tree.glb',
    fountain: '/models/street/lamp_standing.gltf',
    facade: '/models/street/cabinet_medium.gltf',
  },
} as const;

export const PRELOAD_MODEL_PATHS = [
  MODEL_PATHS.character,
  MODEL_PATHS.furniture.bed,
  MODEL_PATHS.furniture.chair,
  MODEL_PATHS.furniture.couch,
  MODEL_PATHS.furniture.desk,
  MODEL_PATHS.street.tree,
  MODEL_PATHS.street.fountain,
  MODEL_PATHS.street.facade,
] as const;
