export const story = {
  prologue:
    'Your wizard is magnificent: every property set, every method written. There’s one problem. It never does anything unless a line of `actions.js` tells it to. And right now, Grub is sneaking off with the tower’s Rune Bell. Your wizard must learn to listen — and react the moment something happens.',
  build:
    'A wizard that reacts to clicks, hovers and keys, then a real battle against Grub that runs on your code.',
  objectives: [
    'explain what an event, a listener and a handler are',
    'write handlers for clicks, mouse movement and key presses',
    'judge when event-driven programming is a good choice'
  ],
  newInTome:
    'In Tome I, `actions.js` decided the order. In Tome II there is no `actions.js`. You write listeners, and the player decides what happens and when. The Stage shows your controls. The Crystal Ball shows events. Spell Trials test your handlers with normal and unexpected input.',
  assignment:
    'Both tomes support Unit 4, Learning Aim A: explaining paradigms, annotated code, computational thinking and balanced evaluation. Use the Scribe prompts as starting points; write your own explanations.',
  owl: 'Hoo! These books only light up because someone wrote an event listener. Tome II shows you how.',
  emptyLog: 'Quill is waiting for something to happen…',
  victory:
    'Grub drops the Rune Bell. “Grub will be back! Grub has a whole database of grudges!”',
  defeat:
    'Grub blows a raspberry. Quill says: “Each attempt teaches you something. Ready to try again?”',
  bell: 'The Rune Bell rings. Lanterns light, the Rune Door opens, and Quill carries the news. The tower is awake!'
};
export const reportPrompts = [
  'Decomposition: list every event your battle responds to. Name its source, handler and state change.',
  'Paradigms: what do objects and events each contribute? Could this battle be written procedurally?',
  'Compare the JavaScript listener with Visual Basic’s Handles btnFire.Click. What is the same? What differs?',
  'Evaluate usability, robustness, maintainability, reliability, efficiency and portability, using your code and tests as evidence.'
];
export const visualBasicExample = `Private Sub btnFire_Click(sender As Object, e As EventArgs) Handles btnFire.Click
    If wizard.Mana >= 4 Then
        wizard.CastSpell(goblin)
    Else
        MessageBox.Show("Not enough mana!")
    End If
End Sub`;

export const javascriptComparison = `const fireButton = document.querySelector("#fire-button");

fireButton.addEventListener("click", function () {
  if (wizard.mana >= 4) {
    wizard.castSpell(goblin);
  } else {
    wizard.say("Not enough mana!");
  }
});`;
