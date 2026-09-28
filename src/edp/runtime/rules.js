// Tuned using 1,000 seeded battles per strategy; see TEACHER_GUIDE.md.
// All damage and mana rules retain Tome I's teaching API.
export const battleRules = Object.freeze({
  goblinHealth: 110,
  intentWeights: Object.freeze([0.1, 0.55, 0.15, 0.1, 0.1]),
  goblinDelay: 1200,
  incantationWindow: 5000,
  apprenticeWindow: 10000
});
