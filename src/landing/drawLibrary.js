import {drawOwl} from '../game/sprites.js';
export function drawLibrary(canvas, highlight = null) {
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  const rect = (x, y, w, h, colour) => {
    c.fillStyle = colour;
    c.fillRect(x, y, w, h);
  };
  rect(0, 0, 320, 180, '#121b30');
  for (let y = 8; y < 160; y += 24)
    for (let x = y % 48 ? 0 : -26; x < 320; x += 52) {
      rect(x, y, 50, 22, '#1b253a');
      rect(x + 2, y + 2, 46, 1, '#253149');
    }
  rect(0, 154, 320, 26, '#192236');
  for (const x of [18, 222]) {
    rect(x, 32, 80, 112, '#a68160');
    rect(x + 4, 36, 72, 102, '#101827');
    for (let y = 52; y < 135; y += 27) {
      for (let i = 0; i < 8; i++)
        rect(
          x + 8 + i * 8,
          y - 14,
          6,
          18,
          ['#685682', '#415a50', '#73544a', '#566078'][i % 4]
        );
      rect(x + 4, y + 4, 72, 4, '#a68160');
    }
  }
  for (const x of [108, 206]) {
    rect(x, 65, 6, 15, '#eac39b');
    rect(x + 1, 60, 4, 5, '#e7a45d');
    rect(x + 2, 62, 2, 3, '#ffe2a0');
  }
  for (const [index, x] of [72, 192].entries()) {
    rect(x, 112, 56, 8, '#a68160');
    rect(x + 24, 120, 8, 35, '#73544a');
    rect(x + 12, 155, 32, 6, '#a68160');
    rect(x + 4, 76, 48, 34, index ? '#e6bc60' : '#ae87e8');
    rect(x + 7, 79, 3, 28, '#73544a');
    for (const dx of [4, 48])
      for (const dy of [76, 106]) rect(x + dx, dy, 4, 4, '#a68160');
    if (index) {
      for (let i = 0; i < 5; i++)
        rect(x + 30 - i * 2, 82 + i * 4, 6, 4, '#192132');
    } else {
      rect(x + 19, 91, 22, 6, '#192132');
      rect(x + 24, 97, 10, 6, '#192132');
    }
    if (highlight === (index ? 'edp' : 'oop')) {
      rect(x + 2, 74, 52, 2, '#fff0c6');
      rect(x + 2, 74, 2, 38, '#fff0c6');
      rect(x + 52, 74, 2, 38, '#fff0c6');
      rect(x + 2, 110, 52, 2, '#fff0c6');
    }
  }
  drawOwl(c, 260, 16);
}
