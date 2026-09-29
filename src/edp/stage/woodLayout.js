// Where everything stands in the Whispering Wood (E3.1–E3.5).
// The canvas drawing (drawScenes.js) and the clickable hotspots
// (curriculum/stages.js) both read these numbers, so a sprite and its
// hotspot can never drift apart.
//
// Perspective: the ground starts at y = 100 and the front row of props
// (the potions) stands with its base at y = 188. Everything else sits on
// that same row or just in front of it, and nothing overlaps the potions.
export const woodLayout = {
  // Sprite top-left corners, as passed to drawWizard / drawGoblin.
  wizard: {x: 96, y: 117},
  goblin: {x: 240, y: 144},
  // Top-left of the chest lid; the body is drawn beneath it.
  chest: {x: 178, y: 164},
  // Speech bubble anchor above the wizard's head.
  bubble: {x: 129, y: 72},
  hotspots: {
    'red-potion': {x: 16, y: 142, w: 40, h: 52},
    'blue-potion': {x: 58, y: 142, w: 38, h: 52},
    goblin: {x: 240, y: 144, w: 38, h: 52},
    // The wizard's hotspot starts 19px above the sprite's origin.
    wizard: {x: 96, y: 98, w: 68, h: 96},
    chest: {x: 174, y: 158, w: 50, h: 44}
  }
};
