export interface Spritesheet {
  sprite: Sprite;
  downstairs: Sprite;
  upstairs: Sprite;
  human_male2: Sprite;
  puny8x10: Sprite;
}

export interface Sprite {
  x: number;
  y: number;
  w: number;
  h: number;
}
