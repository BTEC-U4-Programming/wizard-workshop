export const palettes = {
  grey: '#a4adbc',
  purple: '#ae87e8',
  gold: '#e6bc60',
  black: '#41495f',
  blue: '#73a8e5',
  green: '#73bc91'
};
const cloak = [
  '00001110000',
  '00011111000',
  '00011111000',
  '00111111100',
  '00111111100',
  '01111111110',
  '01111111110',
  '11111111111'
];
export function drawWizard(c, x, y, wizard, standing = true) {
  const rect = (x, y, w, h, colour) => {
    c.fillStyle = colour;
    c.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const line = (x1, y1, x2, y2, colour, width = 2) => {
    c.strokeStyle = colour;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  };

  const p = wizard.specialPower || 'fire',
    colour = palettes[wizard.cloakColour] || palettes.grey;
  const aura = {fire: '#d68e63', ice: '#80cee7', electricity: '#d8c66a'}[p];
  if (standing) {
    for (let i = 0; i < 6; i++)
      rect(x - 17 + i * 14, y + 39 + (i % 2) * 8, 2, 3, aura);
    rect(x + 2, y + 68, 34, 5, '#151a29');
  }
  rect(x + 5, y + 50, 28, 20, '#2b2440');
  // Pixel mask clips all patterned pixels to the cloak silhouette.
  cloak.forEach((row, dy) =>
    [...row].forEach((bit, dx) => {
      if (bit === '1') {
        rect(x - 3 + dx * 4, y + 32 + dy * 5, 4, 5, colour);
        if (
          wizard.cloakColour === 'black' &&
          (row[dx - 1] !== '1' || row[dx + 1] !== '1')
        )
          rect(x - 3 + dx * 4, y + 32 + dy * 5, 1, 5, '#a2a9c3');
        const pattern = wizard.cloakPattern || 'plain';
        if (
          (pattern === 'stars' && dx % 3 === 1 && dy % 3 === 1) ||
          (pattern === 'stripes' && dy % 3 === 0) ||
          (pattern === 'runes' && (dx + dy) % 4 === 0)
        )
          rect(
            x - 2 + dx * 4,
            y + 33 + dy * 5,
            pattern === 'stripes' ? 4 : 2,
            pattern === 'runes' ? 4 : 2,
            '#f9e3b0'
          );
      }
    })
  );
  rect(x + 6, y + 21, 24, 18, '#eac39b');
  rect(x + 7, y + 23, 5, 8, '#b99480');
  rect(x + 23, y + 27, 3, 3, '#202336');
  if (wizard.beardType && wizard.beardType !== 'none') {
    rect(x + 10, y + 34, 21, 7, '#e3e0d8');
    rect(x + 14, y + 41, 13, wizard.beardType === 'long' ? 15 : 5, '#d3d5db');
    if (wizard.beardType === 'long') rect(x + 18, y + 56, 5, 5, '#d3d5db');
  }
  rect(x - 5, y + 17, 46, 6, colour);
  rect(x + 4, y + 9, 28, 8, colour);
  rect(x + 9, y + 1, 19, 8, colour);
  rect(x + 13, y - 8, 11, 9, colour);
  rect(x + 16, y - 14, 7, 6, colour);
  line(x - 5, y + 23, x + 41, y + 23, '#d1b3ef', 1);
  if (standing) {
    const wx = x + 50;
    rect(wx, y + 24, 4, 46, '#a68160');
    if (wizard.wand === 'crystal') {
      rect(wx - 3, y + 13, 10, 14, '#8de1eb');
      rect(wx, y + 9, 4, 20, '#d3fbff');
    } else if (wizard.wand === 'ember') {
      rect(wx - 4, y + 14, 12, 13, '#d97051');
      rect(wx - 1, y + 10, 6, 15, '#ffcf69');
    } else {
      rect(wx - 2, y + 16, 8, 11, '#bd9a70');
      rect(wx + 4, y + 13, 4, 6, '#81a376');
    }
  }
  rect(x + 4, y + 68, 11, 6, '#222539');
  rect(x + 27, y + 68, 11, 6, '#222539');
}
export function drawGoblin(c, x, y) {
  const rect = (x, y, w, h, colour) => {
    c.fillStyle = colour;
    c.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const line = (x1, y1, x2, y2, colour, width = 2) => {
    c.strokeStyle = colour;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  };

  rect(x + 2, y + 39, 29, 7, '#121a29');
  rect(x + 3, y + 15, 23, 25, '#789869');
  rect(x - 5, y + 1, 36, 8, '#7fac80');
  rect(x + 2, y - 3, 24, 23, '#8bb78a');
  rect(x + 6, y + 5, 4, 3, '#152437');
  rect(x + 20, y + 5, 4, 3, '#152437');
  rect(x + 10, y + 14, 12, 3, '#d2d2b1');
  rect(x + 3, y + 26, 23, 6, '#9d805e');
  rect(x + 4, y + 39, 8, 8, '#415a50');
  rect(x + 20, y + 39, 8, 8, '#415a50');
}

export function drawOwl(c, x, y) {
  const rect = (dx, dy, w, h, colour) => {
    c.fillStyle = colour;
    c.fillRect(x + dx, y + dy, w, h);
  };
  rect(1, 2, 10, 11, '#8a7a6a');
  rect(0, 0, 3, 5, '#8a7a6a');
  rect(9, 0, 3, 5, '#8a7a6a');
  rect(2, 4, 3, 3, '#e3c185');
  rect(7, 4, 3, 3, '#e3c185');
  rect(3, 5, 1, 1, '#202336');
  rect(8, 5, 1, 1, '#202336');
  rect(5, 7, 2, 2, '#d9b777');
  rect(2, 13, 3, 1, '#a68160');
  rect(7, 13, 3, 1, '#a68160');
}

export function drawEffect(c, effect) {
  if (!effect) return;
  const rect = (x, y, w, h, colour) => {
    c.fillStyle = colour;
    c.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const line = (x1, y1, x2, y2, colour, width = 2) => {
    c.strokeStyle = colour;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  };

  const p = effect.power,
    ex = effect.actor === 'goblin' ? 155 : 213;
  if (effect.method === 'castSpell' && p === 'fire') {
    rect(ex, 139, 17, 8, '#ea794d');
    rect(ex + 9, 135, 9, 16, '#f7b963');
    rect(ex + 17, 141, 8, 5, '#fbe4aa');
  }
  if (effect.method === 'castSpell' && p === 'ice') {
    line(ex - 9, 143, ex + 20, 143, '#9eeaff', 4);
    line(ex + 14, 132, ex + 14, 153, '#d4faff');
    line(ex + 5, 135, ex + 23, 151, '#9eeaff');
  }
  if (effect.method === 'castSpell' && p === 'electricity') {
    line(ex - 20, 130, ex, 145, '#e8d477', 3);
    line(ex, 145, ex - 4, 137, '#c7a5f6', 3);
    line(ex - 4, 137, ex + 25, 150, '#f5e390', 3);
  }
  if (effect.method === 'recoverHealth')
    for (let i = 0; i < 5; i++)
      rect(100 + i * 8, 96 + (i % 2) * 12, 3, 6, '#95e5ad');
  if (effect.method === 'levelUp') {
    c.strokeStyle = '#f3d589';
    c.lineWidth = 3;
    c.beginPath();
    c.ellipse(120, 166, 33, 12, 0, 0, Math.PI * 2);
    c.stroke();
  }
  if (effect.method === 'attack') {
    line(177, 145, 162, 156, '#e1b69b', 3);
    line(183, 151, 169, 161, '#e1b69b', 3);
  }
}
