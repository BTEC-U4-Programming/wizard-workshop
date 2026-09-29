import {
  drawWizard,
  drawGoblin,
  drawOwl,
  drawEffect
} from '../../game/sprites.js';
export function drawScene(canvas, scene, snapshot, effect = null) {
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  const rect = (x, y, w, h, colour) => {
    c.fillStyle = colour;
    c.fillRect(Math.round(x), Math.round(y), w, h);
  };
  rect(0, 0, 320, 240, '#121b30');
  for (let y = 8; y < 176; y += 24)
    for (let x = y % 48 ? 0 : -26; x < 320; x += 52) {
      rect(x, y, 50, 22, '#1b253a');
      rect(x + 2, y + 2, 46, 1, '#253149');
    }
  rect(0, 180, 320, 60, '#192236');
  if (scene === 'bedroom') {
    rect(18, 144, 145, 28, '#73544a');
    rect(18, 140, 145, 10, '#c4a5f2');
    rect(20, 171, 8, 24, '#a68160');
    rect(149, 171, 8, 24, '#a68160');
    rect(220, 34, 54, 64, '#566078');
    rect(224, 38, 46, 56, '#111827');
    rect(245, 38, 4, 56, '#9291a0');
  }
  if (scene === 'courtyard') {
    rect(0, 90, 320, 150, '#415a50');
    for (let x = 0; x < 320; x += 20) rect(x, 125 + (x % 40), 3, 4, '#789869');
  }
  if (scene === 'wood') {
    rect(0, 100, 320, 140, '#243c36');
    for (const x of [12, 182, 292]) {
      rect(x, 26, 14, 170, '#73544a');
      rect(x - 24, 12, 66, 48, '#415a50');
      rect(x - 28, 48, 72, 40, '#789869');
    }
  }
  if (scene === 'wood') {
    for (const [x, colour] of [
      [28, '#d97051'],
      [74, '#73a8e5']
    ]) {
      rect(x + 3, 150, 6, 8, '#a68160');
      rect(x, 157, 12, 6, '#9291a0');
      rect(x - 4, 163, 20, 22, colour);
      rect(x - 1, 166, 3, 14, '#f5e7c4');
      rect(x - 4, 185, 20, 3, '#313c53');
    }
    rect(178, 166, 42, 24, '#73544a');
    rect(178, 158, 42, 11, '#a68160');
    rect(178, 167, 42, 3, '#e6bc60');
    rect(197, 164, 5, 10, '#e6bc60');
  }
  if (scene === 'door') {
    const door = snapshot?.world.runeDoor;
    rect(190, 30, 88, 150, '#566078');
    rect(198, 38, 72, 142, door?.isOpen ? '#0d1424' : '#313c53');
    for (let i = 0; i < 6; i++)
      rect(
        206 + (i % 3) * 20,
        62 + Math.floor(i / 3) * 28,
        10,
        12,
        (door?.runesLit ?? 0) > i ? '#e6bc60' : '#a4adbc'
      );
    if (door?.redFlashes) rect(190, 30, 88, 3, '#c18b73');
  }
  if (scene === 'loft') {
    rect(20, 92, 80, 5, '#a68160');
    rect(58, 96, 5, 84, '#73544a');
    drawOwl(c, 53, 76);
  }
  if (scene === 'bridge') {
    rect(0, 174, 320, 66, '#253149');
    for (let x = 0; x < 320; x += 28) rect(x, 178, 26, 12, '#a68160');
    rect(0, 143, 320, 4, '#73544a');
    for (let x = 8; x < 320; x += 48) rect(x, 141, 3, 48, '#73544a');
  }
  if (snapshot?.world.lantern?.lit) {
    rect(285, 45, 13, 24, '#e6bc60');
    rect(289, 50, 5, 14, '#ffe2a0');
  }
  const wizard = snapshot?.world.wizard,
    goblin = snapshot?.world.goblin;
  if (wizard) {
    const x = scene === 'courtyard' || scene === 'door' ? wizard.x - 20 : 80,
      y = scene === 'courtyard' || scene === 'door' ? wizard.y - 50 : 105;
    if (wizard.health === 0 || (scene === 'bedroom' && !wizard.awake)) {
      // Asleep in the tower bedroom: lie on top of the bed, not beside it.
      const inBed = scene === 'bedroom' && wizard.health !== 0;
      c.save();
      c.translate(x + 65 - (inBed ? 85 : 0), y + 66 - (inBed ? 33 : 0));
      c.rotate(-Math.PI / 2);
      drawWizard(c, 0, 0, wizard, false);
      c.restore();
    } else drawWizard(c, x, y, wizard);
    if (wizard.shielded) {
      c.strokeStyle = '#80cee7';
      c.lineWidth = 2;
      c.strokeRect(x - 10, y - 18, 76, 100);
    }
    if (snapshot.elements?.wizard?.classes.includes('glow')) {
      c.strokeStyle = '#e6bc60';
      c.lineWidth = 3;
      c.strokeRect(x + 45, y + 12, 16, 60);
    }
  }
  if (goblin) {
    if (goblin.health === 0) {
      c.save();
      c.translate(277, 176);
      c.rotate(Math.PI / 2);
      drawGoblin(c, 0, 0);
      c.restore();
    } else drawGoblin(c, 240, 136);
    if (snapshot.elements?.goblin?.classes.includes('outlined')) {
      c.strokeStyle = '#c4a5f2';
      c.lineWidth = 2;
      c.strokeRect(232, 127, 43, 60);
    }
  }
  drawEffect(c, effect);
  if (['victory', 'defeat'].includes(snapshot?.battle?.state)) {
    rect(0, 22, 320, 62, '#0d1424');
    rect(0, 22, 320, 2, '#e6bc60');
    rect(0, 82, 320, 2, '#e6bc60');
    c.save();
    c.textAlign = 'center';
    c.font = 'bold 26px Consolas, monospace';
    c.fillStyle = '#f3d589';
    c.fillText('Game Over', 160, 49);
    c.font = 'bold 14px Consolas, monospace';
    c.fillStyle = '#ffffff';
    c.fillText(
      snapshot.battle.state === 'victory' ? 'Wizard Wins' : 'Goblin Wins',
      160,
      71
    );
    c.restore();
  }
}
