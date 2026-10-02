# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sceneBaseline.spec.js >> shared sprite extraction preserves every recorded Tome I scene pixel
- Location: tests\sceneBaseline.spec.js:12:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

@@ -1,9 +1,9 @@
  Array [
    "adcd8af05228fe9fcb8f09108beb07c417075e1605b267fd4881b8677d382ecb",
    "5e5f59d8ba62e79a97248d2178b987c00effbae2ce15607fe29a9afb08e70231",
-   "ccbbc2cded8224bbc3366e384cae2f32e16f98fb00af4e5123cae01e385761d0",
+   "fc0d626abe2499f46ccf1468c8864f71d20d798a03fb8bf834dbda58da32ad3e",
    "a494fb20c499e6418d09f13e73b317975d7f0b94b4567e798bfe545ab90f3c97",
    "6367a02fe0c0bda9416f043ddeb8913dede59c377f4ffb63b27a15bb4284544b",
    "f0d1578fa9c5a3ffd46a46d8fd3475bc9bf9bd88a0017f04ff64eeda5b9796a9",
    "7f5ba6180f9c8ee3a82ef23f670a3e6b6e0930b7e860124dae78758dc433b8c6",
    "5dad84e55822fb70fc99aecf7023a799d2fc4ecabea02e9b13780222ad78d503",
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link "Wizard Workshop — back to the library" [ref=e4] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=e5]: ✦
      - generic [ref=e6]:
        - text: WIZARD
        - strong [ref=e7]: WORKSHOP
        - generic [ref=e8]: Small steps. Real JavaScript. Your creation.
    - generic [ref=e9]:
      - status [ref=e10]: Saved locally
      - button "Download work" [ref=e11] [cursor=pointer]
      - group [ref=e12]:
        - generic "Workspace tools" [ref=e13] [cursor=pointer]
        - option "14"
        - option "16" [selected]
        - option "18"
        - option "20"
        - option "24"
  - generic [ref=e14]:
    - generic [ref=e15]: Tome I · Object-Oriented Programming
    - generic [ref=e16]: YOUR JOURNEY
    - combobox "Choose a checkpoint (teacher navigation)" [ref=e17]:
      - option "You are here" [selected]
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
      - option
    - generic [ref=e18]: 0 / 44 completed
  - region [ref=e19]:
    - paragraph [ref=e20]: SECTION 1 OF 5
    - heading "Classes and objects" [active] [level=1] [ref=e21]
    - paragraph [ref=e22]: Build a wizard from your own JavaScript class.
    - paragraph [ref=e23]:
      - text: "You will make: A"
      - code [ref=e24]: Wizard
      - text: class and two objects with separate data.
    - heading "By the end, you will be able to:" [level=2] [ref=e25]
    - list [ref=e26]:
      - listitem [ref=e27]: explain the difference between a class and an object
      - listitem [ref=e28]: write a constructor that sets a property
      - listitem [ref=e29]:
        - text: use
        - code [ref=e30]: new
        - text: to create independent objects
    - paragraph [ref=e31]:
      - text: "Key idea: A class is a reusable description."
      - code [ref=e32]: new
      - text: creates an object from it. The
      - code [ref=e33]: constructor
      - text: sets a property (also called an attribute) on that object;
      - code [ref=e34]: this
      - text: means the object being created.
    - heading "See a complete example" [level=2] [ref=e35]
    - figure "example.js" [ref=e38]:
      - code [ref=e42]:
        - generic [ref=e43]: "class Potion {"
        - generic [ref=e45]: "constructor(colour) {"
        - generic [ref=e47]: this.colour = colour;
        - generic [ref=e49]: "}"
        - generic [ref=e52]: "}"
        - generic [ref=e56]: const redPotion = new Potion("red");
        - generic [ref=e58]: const bluePotion = new Potion("blue");
    - paragraph [ref=e60]:
      - text: "Result:"
      - code [ref=e61]: redPotion.colour
      - text: is
      - code [ref=e62]: "\"red\""
      - text: ;
      - code [ref=e63]: bluePotion.colour
      - text: is
      - code [ref=e64]: "\"blue\""
      - text: .
    - navigation [ref=e65]:
      - button "Start section 1 →" [ref=e66] [cursor=pointer]
    - group [ref=e67]:
      - generic "How the example works" [ref=e68] [cursor=pointer]
    - group [ref=e69]:
      - generic "Key terms and a quick reminder" [ref=e70] [cursor=pointer]
    - group [ref=e71]:
      - generic "Try a prediction" [ref=e72] [cursor=pointer]
    - group [ref=e73]:
      - generic "Course goals and section map" [ref=e74] [cursor=pointer]
    - group [ref=e75]:
      - generic "Unit 4 connection" [ref=e76] [cursor=pointer]
  - contentinfo [ref=e77]:
    - text: Made for learning, one object at a time.
    - generic [ref=e78]: No accounts. Progress stays in this browser.
```

# Test source

```ts
  1  | import {test, expect} from '@playwright/test';
  2  | import {readFileSync} from 'node:fs';
  3  | const cases = JSON.parse(
  4  |   readFileSync(new URL('./fixtures/scene-hashes.json', import.meta.url), 'utf8')
  5  | );
  6  | // Text is checked by what is written (words, position, font and colour),
  7  | // not by its pixels. Glyph pixels depend on which fonts the computer has
  8  | // installed (Consolas on Windows, a fallback monospace elsewhere), so a
  9  | // pixel hash of text only ever passes on the machine that recorded it.
  10 | // Everything else on the canvas (the sprites) is still checked pixel for
  11 | // pixel.
  12 | test('shared sprite extraction preserves every recorded Tome I scene pixel', async ({
  13 |   page,
  14 |   browserName
  15 | }) => {
  16 |   test.skip(
  17 |     process.env.WORKSHOP_PREVIEW === '1' || browserName !== 'chromium',
  18 |     'Baseline captures Chromium canvas rasterisation.'
  19 |   );
  20 |   await page.goto('/?tome=oop');
  21 |   const results = await page.evaluate(async (cases) => {
  22 |     const {renderScene} = await import('/src/game/renderScene.js');
  23 |     const canvas = document.createElement('canvas');
  24 |     canvas.width = 320;
  25 |     canvas.height = 240;
  26 |     const proto = CanvasRenderingContext2D.prototype;
  27 |     const realFillText = proto.fillText;
  28 |     const results = [];
  29 |     try {
  30 |       for (const item of cases) {
  31 |         const text = [];
  32 |         proto.fillText = function (value, x, y) {
  33 |           text.push({
  34 |             text: String(value),
  35 |             x,
  36 |             y,
  37 |             font: this.font,
  38 |             fillStyle: this.fillStyle,
  39 |             textAlign: this.textAlign
  40 |           });
  41 |         };
  42 |         renderScene(canvas, item.snapshot, item.effect);
  43 |         proto.fillText = realFillText;
  44 |         const digest = await crypto.subtle.digest(
  45 |           'SHA-256',
  46 |           canvas.getContext('2d').getImageData(0, 0, 320, 240).data
  47 |         );
  48 |         results.push({
  49 |           hash: Array.from(new Uint8Array(digest), (b) =>
  50 |             b.toString(16).padStart(2, '0')
  51 |           ).join(''),
  52 |           text
  53 |         });
  54 |       }
  55 |     } finally {
  56 |       proto.fillText = realFillText;
  57 |     }
  58 |     return results;
  59 |   }, cases);
> 60 |   expect(results.map((r) => r.hash)).toEqual(cases.map((item) => item.hash));
     |                                      ^ Error: expect(received).toEqual(expected) // deep equality
  61 |   expect(results.map((r) => r.text)).toEqual(
  62 |     cases.map((item) => item.text ?? [])
  63 |   );
  64 | });
  65 | 
```