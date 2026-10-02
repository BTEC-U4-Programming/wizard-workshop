// Tuned using 1,000 seeded battles per strategy; see TEACHER_GUIDE.md.
// All damage and mana rules retain Tome I's teaching API.
export const battleRules = Object.freeze({
  goblinHealth: 110,
  // Grub's attacks. Lowered after classroom play: students found him too
  // tough. `snatch` is the hit he lands when there is no potion to steal.
  goblinDamage: Object.freeze({clubSmash: 8, bigBonk: 16, sneakyStab: 10, snatch: 8}),
  intentWeights: Object.freeze([0.1, 0.55, 0.15, 0.1, 0.1]),
  goblinDelay: 1200,
  incantationWindow: 5000,
  apprenticeWindow: 10000
});
