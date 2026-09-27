# Complete checkpoint solutions

Generated from `src/curriculum/checkpoints.js`. Each solution is an executable fixture checked by the test suite. Names and cosmetic choices may differ while satisfying the same objective.

## C1.1a — The class is the recipe

Declare an empty class called `Wizard`.

Expected: Class ready — no object yet

Support: guided.

### character.js

```javascript
class Wizard {
}

```

## C1.1b — Give the recipe a constructor

Add `constructor(name)` and assign `this.name = name`.

Expected: A new Wizard receives its name; the platform stays empty.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
  }
}

```

## C1.1c — Create your first object

Create `const wizard = new Wizard("Aster")` below the class.

Expected: Your named wizard appears on the platform.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
  }
}

const wizard = new Wizard("Aster");


```

## C1.2 — Two objects, one class

Create `apprentice` with `new Wizard("Moss")`, then change `apprentice.name` to `"Rowan"`.

Expected: The apprentice is Rowan; your wizard keeps its own name.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
  }
}

const wizard = new Wizard("Aster");

const apprentice = new Wizard("Moss");
apprentice.name = "Rowan";

```

Self-check: Predict: will changing `apprentice.name` change `wizard.name`? Run and compare the two objects.

## C2.1a — Cloak colour: class default

Add `cloakColour` with default `"grey"` inside the `constructor`.

Expected: The class-default inspector now includes cloakColour.

Support: worked example.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
  }
}

const wizard = new Wizard("Aster");


```

## C2.1b — Cloak colour: your object

After creating `wizard`, assign `wizard.cloakColour` a different supported value.

Expected: Your cloakColour changes; the constructor default stays "grey".

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";

```

## C2.2a — Cloak pattern: class default

Add `cloakPattern` with default `"plain"` inside the `constructor`.

Expected: The class-default inspector now includes cloakPattern.

Support: gaps.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";

```

## C2.2b — Cloak pattern: your object

After creating `wizard`, assign `wizard.cloakPattern` a different supported value.

Expected: Your cloakPattern changes; the constructor default stays "plain".

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";

```

## C2.3a — Wand: class default

Add `wand` with default `"oak"` inside the `constructor`.

Expected: The class-default inspector now includes wand.

Support: partial prompts.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";

```

## C2.3b — Wand: your object

After creating `wizard`, assign `wizard.wand` a different supported value.

Expected: Your wand changes; the constructor default stays "oak".

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";

```

## C2.4a — Beard: class default

Add `beardType` with default `"none"` inside the `constructor`.

Expected: The class-default inspector now includes beardType.

Support: prompts only.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";

```

## C2.4b — Beard: your object

After creating `wizard`, assign `wizard.beardType` a different supported value.

Expected: Your beardType changes; the constructor default stays "none".

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";

```

## C2.5a — Power: class default

Add `specialPower` with default `"fire"` inside the `constructor`.

Expected: The class-default inspector now includes specialPower.

Support: independent.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";

```

## C2.5b — Power: your object

After creating `wizard`, assign `wizard.specialPower` a different supported value.

Expected: Your specialPower changes; the constructor default stays "fire".

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.specialPower = "ice";

```

## C2.6a — Level: class default

Add `level` with default `1` inside the `constructor`.

Expected: The class-default inspector now includes level.

Support: independent.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.specialPower = "ice";

```

## C2.6b — Level: your object

After creating `wizard`, assign `wizard.level` a value of 3.

Expected: Your level changes; the constructor default stays 1.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.specialPower = "ice";
wizard.level = 3;

```

## C2.7 — Your design

Choose a valid combination of all six customisation properties.

Expected: Your design

Support: independent.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.specialPower = "ice";
wizard.level = 3;

```

Self-check: Which lines define what every new wizard starts with, and which customise only your `wizard`?

## C3.1a — A method belongs to a class

Define `castSpell()` inside `Wizard` and `return` `this.specialPower`.

Expected: The method is ready. Defining it alone does not cast a spell.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
  }

  castSpell() {
    return this.specialPower;
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.specialPower = "ice";
wizard.level = 3;

```

### actions.js

```javascript
// No action calls needed yet.
```

## C3.1b — Call the method

In `actions.js`, write `wizard.castSpell();`

Expected: A spell travels towards a harmless practice marker.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
  }

  castSpell() {
    return this.specialPower;
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.specialPower = "ice";
wizard.level = 3;

```

### actions.js

```javascript
wizard.castSpell();
```

## C3.2a — Decide: fire

Use a conditional reading `this.specialPower`; `return` the matching power for fire.

Expected: Decide: fire

Support: worked example.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
  }

  castSpell() {
    if (this.specialPower === "fire") { return "fire"; }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "fire";

```

### actions.js

```javascript
wizard.castSpell();
```

## C3.2b — Decide: ice

Use a conditional reading `this.specialPower`; `return` the matching power for fire and ice.

Expected: Decide: ice

Support: gaps.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
  }

  castSpell() {
    if (this.specialPower === "fire") { return "fire"; }
    else if (this.specialPower === "ice") { return "ice"; }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "ice";

```

### actions.js

```javascript
wizard.castSpell();
```

## C3.2c — Decide: electricity

Use a conditional reading `this.specialPower`; `return` the matching power for all three powers.

Expected: Decide: electricity

Support: independent.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";

```

### actions.js

```javascript
wizard.castSpell();
```

## C3.3a — Add health state

Add `maxHealth = 100` and `health = this.maxHealth` in the `constructor`; set `wizard.health = 50` below object creation.

Expected: Your object has 50/100 health. A new wizard starts at 100.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;

```

### actions.js

```javascript
wizard.castSpell();
```

## C3.3b — Recover twenty health

Add `recoverHealth()` using `this.health = this.health + 20`; call it in `actions.js`.

Expected: Health changes from 50 to 70.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;

```

### actions.js

```javascript
wizard.recoverHealth();
```

## C3.3c — Cap recovery

Add a cap: `health` must never exceed `maxHealth`.

Expected: The practice wizard recovers 20; a probe at 95 recovers only 5.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;

```

### actions.js

```javascript
wizard.recoverHealth();
```

## C3.4a — Level up

Define `levelUp()`: add one to `level`, stopping at 20.

Expected: Probe checks: 1 → 2 and 20 → 20.

Support: independent.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;

```

### actions.js

```javascript
wizard.recoverHealth();
```

## C3.4b — Use your new level

Call `wizard.levelUp()` in `actions.js`.

Expected: Your level badge increases by one.

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;

```

### actions.js

```javascript
wizard.levelUp();
```

## C3.5 — Choose your actions

Write exactly three action lines in your chosen order.

Expected: The log shows your three actions in order.

Support: independent.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;

```

### actions.js

```javascript
wizard.recoverHealth();
wizard.levelUp();
wizard.castSpell();
```

Self-check: Why does defining a method do nothing until you call it? Run twice: does the result accumulate?

## C4.1 — Spot the shared code

Compare `Wizard` and `Goblin`. Identify their shared properties and methods.

Expected: Spot the shared code

Support: guided.

### character.js

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Goblin {
  constructor(name) {
    this.name = name;
    this.level = 1;
    this.maxHealth = 60;
    this.health = this.maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.recoverHealth();
wizard.levelUp();
wizard.castSpell();
```

Self-check: Shared: `name`, `level`, `maxHealth`, `health`, `recoverHealth` and `levelUp`. Cloak, `wand`, beard and magic belong only to `Wizard`.

## C4.2a — Extract the shared constructor

Above `Wizard`, create `Character` with `constructor(name, maxHealth)` and the four shared properties.

Expected: A fresh Character probe receives its own name and maxHealth.

Support: guided.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }
}

class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Goblin {
  constructor(name) {
    this.name = name;
    this.level = 1;
    this.maxHealth = 60;
    this.health = this.maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.recoverHealth();
wizard.levelUp();
wizard.castSpell();
```

## C4.2b — Extract shared methods

Add `recoverHealth()` and `levelUp()` to `Character`.

Expected: Character probes recover and level up correctly. Temporary subclass copies are allowed.

Support: guided.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Wizard {
  constructor(name) {
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Goblin {
  constructor(name) {
    this.name = name;
    this.level = 1;
    this.maxHealth = 60;
    this.health = this.maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.recoverHealth();
wizard.levelUp();
wizard.castSpell();
```

## C4.3a — Connect Wizard to Character

Change `Wizard` to `extends Character` and call `super(name, 100)` first in its `constructor`.

Expected: Connect Wizard to Character

Support: guided.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.name = name;
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Goblin {
  constructor(name) {
    this.name = name;
    this.level = 1;
    this.maxHealth = 60;
    this.health = this.maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.recoverHealth();
wizard.levelUp();
wizard.castSpell();
```

## C4.3b — Remove duplicated state

Remove `name`, `level`, `maxHealth` and `health` assignments from the `Wizard` `constructor`.

Expected: The parent supplies shared state; wizard customisations remain.

Support: guided.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Goblin {
  constructor(name) {
    this.name = name;
    this.level = 1;
    this.maxHealth = 60;
    this.health = this.maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.recoverHealth();
wizard.levelUp();
wizard.castSpell();
```

## C4.3c — Inherit shared actions

Remove `recoverHealth()` and `levelUp()` from `Wizard`; keep `castSpell()`.

Expected: Wizard uses Character’s methods through inheritance.

Support: guided.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }
}

class Goblin {
  constructor(name) {
    this.name = name;
    this.level = 1;
    this.maxHealth = 60;
    this.health = this.maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.recoverHealth();
wizard.levelUp();
wizard.castSpell();
```

## C4.4 — Refactor Goblin

Make `Goblin` extend `Character`, call `super(name, 60)`, remove shared duplicates and create `goblin`.

Expected: Both characters inherit shared methods. Goblin has 60 maxHealth.

Support: independent.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }
}

class Goblin extends Character {
  constructor(name) {
    super(name, 60);
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.recoverHealth();
wizard.levelUp();
wizard.castSpell();
```

## C4.5 — Share damage behaviour

Add `takeDamage(amount)` to `Character` and call `goblin.takeDamage(14)` in `actions.js`.

Expected: Goblin health is 46; a probe at 5 stops at zero.

Support: guided.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }

  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }
}

class Goblin extends Character {
  constructor(name) {
    super(name, 60);
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
wizard.health = 50;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
goblin.takeDamage(14);
```

## C5.1a — Give the spell a target

Refactor `castSpell(target)`: calculate power damage, call `target.takeDamage(damage)`, then `return` `this.specialPower`.

Expected: Independent probes verify each power at levels 1, 3 and 20.

Support: guided.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }

  castSpell(target) {
    let damage = 0;
    if (this.specialPower === "fire") {
      damage = 12 + this.level * 2;
    } else if (this.specialPower === "ice") {
      damage = 10 + this.level * 2;
    } else {
      damage = 14 + this.level * 2;
    }
    target.takeDamage(damage);
    return this.specialPower;
  }
}

class Goblin extends Character {
  constructor(name) {
    super(name, 60);
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
// No action calls needed yet.
```

## C5.1b — Pass the goblin object

In `actions.js`, call `wizard.castSpell(goblin);` without quotes around `goblin`.

Expected: The goblin loses health according to your spell and level.

Support: guided.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }

  castSpell(target) {
    let damage = 0;
    if (this.specialPower === "fire") {
      damage = 12 + this.level * 2;
    } else if (this.specialPower === "ice") {
      damage = 10 + this.level * 2;
    } else {
      damage = 14 + this.level * 2;
    }
    target.takeDamage(damage);
    return this.specialPower;
  }
}

class Goblin extends Character {
  constructor(name) {
    super(name, 60);
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.castSpell(goblin);
```

## C5.2 — Write the goblin response

Add `attack(target)` to `Goblin` with `target.takeDamage(8);` then call `goblin.attack(wizard)`.

Expected: Wizard health falls by eight.

Support: guided.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }

  castSpell(target) {
    let damage = 0;
    if (this.specialPower === "fire") {
      damage = 12 + this.level * 2;
    } else if (this.specialPower === "ice") {
      damage = 10 + this.level * 2;
    } else {
      damage = 14 + this.level * 2;
    }
    target.takeDamage(damage);
    return this.specialPower;
  }
}

class Goblin extends Character {
  constructor(name) {
    super(name, 60);
  }

  attack(target) {
    target.takeDamage(8);
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.level = 3;
wizard.specialPower = "electricity";
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.castSpell(goblin);
goblin.attack(wizard);
```

## C5.3 — Script a battle

Start both characters at full `health`; write a spell, `goblin` response and recovery in a valid sequence.

Expected: The reference ends at wizard 100 health / level 3 and goblin 42 health.

Support: independent.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }

  castSpell(target) {
    let damage = 0;
    if (this.specialPower === "fire") {
      damage = 12 + this.level * 2;
    } else if (this.specialPower === "ice") {
      damage = 10 + this.level * 2;
    } else {
      damage = 14 + this.level * 2;
    }
    target.takeDamage(damage);
    return this.specialPower;
  }
}

class Goblin extends Character {
  constructor(name) {
    super(name, 60);
  }

  attack(target) {
    target.takeDamage(8);
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.specialPower = "electricity";
wizard.level = 2;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.castSpell(goblin);
goblin.attack(wizard);
wizard.recoverHealth();
wizard.levelUp();
```

## C5.4 — Explain and experiment

Change a power or `level`, predict the damage, then run your valid battle.

Expected: Compare your prediction with the actual health change. Self-check answers are not machine assessed.

Support: independent.

### character.js

```javascript
class Character {
  constructor(name, maxHealth) {
    this.name = name;
    this.level = 1;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }
}

class Wizard extends Character {
  constructor(name) {
    super(name, 100);
    this.cloakColour = "grey";
    this.cloakPattern = "plain";
    this.wand = "oak";
    this.beardType = "none";
    this.specialPower = "fire";
  }

  castSpell(target) {
    let damage = 0;
    if (this.specialPower === "fire") {
      damage = 12 + this.level * 2;
    } else if (this.specialPower === "ice") {
      damage = 10 + this.level * 2;
    } else {
      damage = 14 + this.level * 2;
    }
    target.takeDamage(damage);
    return this.specialPower;
  }
}

class Goblin extends Character {
  constructor(name) {
    super(name, 60);
  }

  attack(target) {
    target.takeDamage(8);
  }
}

const wizard = new Wizard("Aster");
wizard.cloakColour = "purple";
wizard.cloakPattern = "stars";
wizard.wand = "crystal";
wizard.beardType = "short";
wizard.specialPower = "electricity";
wizard.level = 2;
const goblin = new Goblin("Grub");

```

### actions.js

```javascript
wizard.castSpell(goblin);
goblin.attack(wizard);
wizard.recoverHealth();
wizard.levelUp();
```

Self-check: How is a class different from an object? Why do shared methods belong in `Character`? What does `target` refer to in `castSpell`?

# Section review answers

## Section 1 — Classes and objects

### S1-Q1 — What is the difference between a class and an object?

Answer: A class is a reusable description; an object is one thing made from it.

Correct. One class can create many objects.

### S1-Q2 — In `constructor(name) { this.name = name; }`, what does `this` mean?

Answer: The new object being created.

Correct. The property belongs to this particular object.

### S1-Q3 — If `apprentice.name` changes, what happens to `wizard.name`?

Answer: It stays the same.

Correct. The two objects are independent.

### S1-Q4 — Create an object from a class.

Answer: `new`

Correct. `new` creates an object.

### S1-Q5 — Name the function that runs when an object is created.

Answer: `constructor`

Correct. The constructor sets starting properties.

### S1-Q6 — Start a class declaration.

Answer: `class`

Correct. JavaScript uses lowercase `class`.

## Section 2 — Properties: defaults and your own object

### S2-Q1 — Where do you put `this.wand = "oak";` so every new wizard starts with an oak wand?

Answer: Inside the constructor.

Correct. It sets a class default for every new object.

### S2-Q2 — The default wand is oak. You set `wizard.wand = "crystal";`. What wand does a fresh wizard get?

Answer: `"oak"`

Correct. The constructor still sets oak.

### S2-Q3 — Which line sets the level to the number 3?

Answer: `wizard.level = 3;`

Correct. Numbers have no quotes.

### S2-Q4 — Set the workshop cloak default.

Answer: `grey`

Correct. `grey` is a workshop choice; JavaScript itself allows other strings.

### S2-Q5 — Customise only one object.

Answer: `.`

Correct. The dot connects an object and its property.

### S2-Q6 — Set the level default.

Answer: `level`

Correct. Every new wizard starts at level 1.

## Section 3 — Methods and decisions

### S3-Q1 — What is a method?

Answer: A function that belongs to a class.

Correct. Objects made from the class can call it.

### S3-Q2 — Where does `castSpell()` belong?

Answer: Inside the `Wizard` class, after its constructor.

Correct. It must be inside the class but outside the constructor.

### S3-Q3 — Why does defining `castSpell()` alone show no spell?

Answer: It still needs a call such as `wizard.castSpell();`.

Correct. A method runs when it is called.

### S3-Q4 — Which checks whether the power is ice?

Answer: `this.specialPower === "ice"`

Correct. `===` compares values.

### S3-Q5 — Send a result back.

Answer: `return`

Correct. `return` sends a value back.

### S3-Q6 — Call the method in `actions.js`.

Answer: `castSpell`

Correct. The name must match the class method.

### S3-Q7 — Recover twenty health.

Answer: `+`

Correct. This adds 20 to the current value.

### S3-Q8 — Check whether the level is below 20.

Answer: `<`

Correct. The comparison stops level 20 increasing.

## Section 4 — Inheritance: sharing code

### S4-Q1 — Why create a `Character` class?

Answer: To write shared properties and methods once.

Correct. Wizard and Goblin can reuse them.

### S4-Q2 — What does `super(name, 100)` do in `Wizard`?

Answer: Calls the parent constructor with those values.

Correct. The parent sets shared starting data.

### S4-Q3 — Why does `wizard.recoverHealth()` work after removing its copy from `Wizard`?

Answer: Wizard inherits the method from Character.

Correct. `extends` provides the parent method.

### S4-Q4 — Make Goblin inherit Character.

Answer: `extends`

Correct. `extends` connects the child and parent.

### S4-Q5 — Call the parent constructor.

Answer: `super`

Correct. `super` sets up parent properties.

### S4-Q6 — Stop health below zero.

Answer: `0`

Correct. `Math.max` picks zero when the subtraction is negative.

## Section 5 — Objects working together

### S5-Q1 — In `wizard.castSpell(goblin)`, what is `target`?

Answer: The goblin object.

Correct. The argument becomes the target parameter.

### S5-Q2 — Why is `wizard.castSpell("goblin")` wrong here?

Answer: It passes text, which has no `takeDamage` method.

Correct. Pass the goblin object without quotes.

### S5-Q3 — A level-3 fire wizard hits a goblin at 60 health. Damage is `12 + level * 2`. What health remains?

Answer: 42

Correct. Damage is 18, and 60 − 18 = 42.

### S5-Q4 — If you press Run twice without editing, does the goblin keep losing health?

Answer: No. Each Run creates fresh objects.

Correct. The same script starts from fresh state each time.

### S5-Q5 — Damage the target.

Answer: `takeDamage`

Correct. The target handles its own health.

### S5-Q6 — Make the goblin hit the wizard.

Answer: `wizard`

Correct. Pass the object without quotes.

### S5-Q7 — Use the wizard’s level in ice damage.

Answer: `level`

Correct. `this.level` reads the current wizard’s level.
