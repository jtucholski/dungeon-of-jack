class CharacterCreationScene extends Phaser.Scene {
  constructor() {
    super('CharacterCreationScene');
  }

  // ── Stats config ────────────────────────────────────────
  static STATS = [
    { key: 'STR', name: 'Strength',     help: 'How hard you hit. Boosts melee damage.' },
    { key: 'DEX', name: 'Dexterity',    help: 'How quick you are. Helps you dodge attacks.' },
    { key: 'CON', name: 'Constitution', help: 'How tough you are. Gives you more health.' },
    { key: 'INT', name: 'Intelligence', help: 'How smart you are. Powers your spells.' },
    { key: 'WIS', name: 'Wisdom',       help: 'How aware you are. Helps you find secrets.' },
    { key: 'CHA', name: 'Charisma',     help: 'How charming you are. Better prices at shops.' },
  ];

  static BASE_STAT = 5;
  static BONUS_POINTS = 3;

  // ── Face definitions (pixel patterns) ───────────────────
  // Each face is a set of eye/mouth pixel offsets drawn on the character
  static FACES = [
    { eyes: [[0,0],[4,0]], mouth: [[1,3],[2,3],[3,3]] },                    // neutral
    { eyes: [[0,0],[4,0]], mouth: [[1,3],[2,4],[3,3]] },                    // smile
    { eyes: [[0,-1],[4,-1]], mouth: [[1,3],[2,3],[3,3]] },                  // stern
    { eyes: [[1,0],[3,0]], mouth: [[0,3],[1,4],[2,4],[3,4],[4,3]] },        // wide grin
    { eyes: [[0,0],[4,0]], mouth: [[2,3]] },                                // stoic dot
  ];

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // State
    this.selectedClass = 'Warrior';
    this.selectedGender = 'male';
    this.selectedFace = 0;
    this.stats = {};
    CharacterCreationScene.STATS.forEach(s => {
      this.stats[s.key] = CharacterCreationScene.BASE_STAT;
    });
    this.pointsLeft = CharacterCreationScene.BONUS_POINTS;
    this.hoveredStat = null;

    this.drawBackground();
    this.drawTitle();
    this.drawClassPicker();
    this.drawGenderToggle();
    this.drawCharacterPreview();
    this.drawFacePicker();
    this.drawStatPanel();
    this.drawStartButton();
  }

  // ── Background ──────────────────────────────────────────
  drawBackground() {
    // Torch glow behind character
    this.glow = this.add.circle(400, 300, 180, 0xffaa33, 0.04);
    this.tweens.add({
      targets: this.glow,
      alpha: 0.09,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // ── Title ───────────────────────────────────────────────
  drawTitle() {
    this.add.text(400, 28, 'CREATE YOUR HERO', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#c8a85a',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  // ── Class picker ────────────────────────────────────────
  drawClassPicker() {
    this.add.text(400, 68, 'Class', {
      fontSize: '14px', fontFamily: 'monospace', color: '#887744'
    }).setOrigin(0.5);

    const classes = ['Warrior', 'Wizard'];
    this.classButtons = [];

    classes.forEach((cls, i) => {
      const x = 350 + i * 100;
      const bg = this.add.rectangle(x, 92, 88, 26, 0x222222).setStrokeStyle(1, 0x555544);
      const txt = this.add.text(x, 92, cls, {
        fontSize: '14px', fontFamily: 'monospace', color: '#aaaaaa'
      }).setOrigin(0.5);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.selectedClass = cls;
        this.refreshClassButtons();
        this.refreshCharacterPreview();
      });

      this.classButtons.push({ bg, txt, cls });
    });

    this.refreshClassButtons();
  }

  refreshClassButtons() {
    this.classButtons.forEach(b => {
      const active = b.cls === this.selectedClass;
      b.bg.setFillStyle(active ? 0x443322 : 0x222222);
      b.bg.setStrokeStyle(1, active ? 0xc8a85a : 0x555544);
      b.txt.setColor(active ? '#e8d888' : '#aaaaaa');
    });
  }

  // ── Gender toggle ───────────────────────────────────────
  drawGenderToggle() {
    const genders = ['male', 'female'];
    this.genderButtons = [];

    genders.forEach((g, i) => {
      const x = 350 + i * 100;
      const label = g === 'male' ? 'Male' : 'Female';
      const bg = this.add.rectangle(x, 122, 88, 24, 0x222222).setStrokeStyle(1, 0x555544);
      const txt = this.add.text(x, 122, label, {
        fontSize: '13px', fontFamily: 'monospace', color: '#aaaaaa'
      }).setOrigin(0.5);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.selectedGender = g;
        this.refreshGenderButtons();
        this.refreshCharacterPreview();
      });

      this.genderButtons.push({ bg, txt, g });
    });

    this.refreshGenderButtons();
  }

  refreshGenderButtons() {
    this.genderButtons.forEach(b => {
      const active = b.g === this.selectedGender;
      b.bg.setFillStyle(active ? 0x443322 : 0x222222);
      b.bg.setStrokeStyle(1, active ? 0xc8a85a : 0x555544);
      b.txt.setColor(active ? '#e8d888' : '#aaaaaa');
    });
  }

  // ── Character preview (center) ──────────────────────────
  drawCharacterPreview() {
    this.charGroup = this.add.group();
    this.refreshCharacterPreview();
  }

  refreshCharacterPreview() {
    // Clear old preview
    this.charGroup.clear(true, true);

    const cx = 400;
    const cy = 290;
    const px = 4; // pixel size for character sprite
    const isMale = this.selectedGender === 'male';
    const isWizard = this.selectedClass === 'Wizard';

    // Skin color
    const skin = 0xddaa77;
    const skinDark = 0xcc9966;

    // Outfit colors
    const outfitMain = isWizard ? 0x5544aa : 0x886633;
    const outfitLight = isWizard ? 0x7766cc : 0xaa8844;
    const outfitDark = isWizard ? 0x332277 : 0x664422;

    // Hair
    const hairColor = isMale ? 0x553311 : 0x884422;

    // ── Draw body (from bottom up) ────────
    // Feet
    this.pxRect(cx - 3*px, cy + 8*px, 2*px, 2*px, 0x553322);
    this.pxRect(cx + 1*px, cy + 8*px, 2*px, 2*px, 0x553322);

    // Legs
    this.pxRect(cx - 3*px, cy + 4*px, 2*px, 4*px, outfitDark);
    this.pxRect(cx + 1*px, cy + 4*px, 2*px, 4*px, outfitDark);

    // Body / torso
    this.pxRect(cx - 4*px, cy - 2*px, 8*px, 6*px, outfitMain);
    // Belt
    this.pxRect(cx - 4*px, cy + 3*px, 8*px, 1*px, 0xccaa44);

    // Arms
    this.pxRect(cx - 6*px, cy - 1*px, 2*px, 5*px, outfitLight);
    this.pxRect(cx + 4*px, cy - 1*px, 2*px, 5*px, outfitLight);
    // Hands
    this.pxRect(cx - 6*px, cy + 4*px, 2*px, 2*px, skin);
    this.pxRect(cx + 4*px, cy + 4*px, 2*px, 2*px, skin);

    // Neck
    this.pxRect(cx - 1*px, cy - 4*px, 2*px, 2*px, skin);

    // Head
    this.pxRect(cx - 3*px, cy - 10*px, 6*px, 6*px, skin);

    // Hair
    if (isMale) {
      this.pxRect(cx - 3*px, cy - 11*px, 6*px, 2*px, hairColor);
      this.pxRect(cx - 3*px, cy - 10*px, 1*px, 3*px, hairColor);
    } else {
      this.pxRect(cx - 3*px, cy - 12*px, 6*px, 3*px, hairColor);
      this.pxRect(cx - 4*px, cy - 10*px, 1*px, 8*px, hairColor);
      this.pxRect(cx + 3*px, cy - 10*px, 1*px, 8*px, hairColor);
    }

    // Face features
    const face = CharacterCreationScene.FACES[this.selectedFace];
    const faceBaseX = cx - 2*px;
    const faceBaseY = cy - 8*px;

    // Eyes
    face.eyes.forEach(([ex, ey]) => {
      this.pxRect(faceBaseX + ex * px, faceBaseY + ey * px, px, px, 0x222222);
    });

    // Mouth
    face.mouth.forEach(([mx, my]) => {
      this.pxRect(faceBaseX + mx * px, faceBaseY + my * px, px, px, skinDark);
    });

    // Wizard hat or warrior helmet accent
    if (isWizard) {
      // Pointy hat
      this.pxRect(cx - 3*px, cy - 13*px, 6*px, 2*px, outfitMain);
      this.pxRect(cx - 2*px, cy - 15*px, 4*px, 2*px, outfitMain);
      this.pxRect(cx - 1*px, cy - 17*px, 2*px, 2*px, outfitMain);
      // Hat brim star
      this.pxRect(cx + 2*px, cy - 13*px, px, px, 0xffdd44);
    } else {
      // Simple helmet band
      this.pxRect(cx - 3*px, cy - 11*px, 6*px, 1*px, 0x888888);
      this.pxRect(cx - 3*px, cy - 12*px, 6*px, 1*px, 0x999999);
    }

    // Weapon
    if (isWizard) {
      // Staff
      this.pxRect(cx + 7*px, cy - 6*px, px, 14*px, 0x886633);
      this.pxRect(cx + 6*px, cy - 8*px, 3*px, 2*px, 0x7766cc);
      this.pxRect(cx + 7*px, cy - 9*px, px, px, 0xffdd44);
    } else {
      // Sword
      this.pxRect(cx + 7*px, cy - 2*px, px, 8*px, 0xaaaaaa);
      this.pxRect(cx + 6*px, cy - 2*px, 3*px, px, 0xccaa44);
      this.pxRect(cx + 7*px, cy - 4*px, px, 2*px, 0xcccccc);
    }

    // Character name plate
    const nameY = cy + 14*px;
    this.charGroup.add(this.add.text(cx, nameY, `${this.selectedGender === 'male' ? 'Male' : 'Female'} ${this.selectedClass}`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#c8a85a'
    }).setOrigin(0.5));
  }

  pxRect(x, y, w, h, color) {
    const r = this.add.rectangle(x + w/2, y + h/2, w, h, color);
    this.charGroup.add(r);
    return r;
  }

  // ── Face picker (left side) ─────────────────────────────
  drawFacePicker() {
    this.add.text(140, 155, 'Face', {
      fontSize: '14px', fontFamily: 'monospace', color: '#887744'
    }).setOrigin(0.5);

    this.faceButtons = [];

    for (let i = 0; i < 5; i++) {
      const y = 190 + i * 52;
      const bg = this.add.rectangle(140, y, 60, 44, 0x1a1a22).setStrokeStyle(1, 0x555544);

      // Draw mini face preview
      const miniGroup = this.add.group();
      const face = CharacterCreationScene.FACES[i];
      const bx = 120;
      const by = y - 8;
      const mp = 3; // mini pixel size

      // Mini head
      const head = this.add.rectangle(140, y - 2, 18, 18, 0xddaa77);
      miniGroup.add(head);

      // Mini eyes
      face.eyes.forEach(([ex, ey]) => {
        const dot = this.add.rectangle(bx + 6 + ex * mp, by + ey * mp, mp, mp, 0x222222);
        miniGroup.add(dot);
      });

      // Mini mouth
      face.mouth.forEach(([mx, my]) => {
        const dot = this.add.rectangle(bx + 6 + mx * mp, by + my * mp, mp, mp, 0xcc9966);
        miniGroup.add(dot);
      });

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.selectedFace = i;
        this.refreshFaceButtons();
        this.refreshCharacterPreview();
      });

      this.faceButtons.push({ bg, idx: i });
    }

    this.refreshFaceButtons();
  }

  refreshFaceButtons() {
    this.faceButtons.forEach(b => {
      const active = b.idx === this.selectedFace;
      b.bg.setStrokeStyle(active ? 2 : 1, active ? 0xc8a85a : 0x555544);
      b.bg.setFillStyle(active ? 0x332211 : 0x1a1a22);
    });
  }

  // ── Stat panel (right side) ─────────────────────────────
  drawStatPanel() {
    const startX = 560;
    const startY = 150;

    this.add.text(660, startY, 'Stats', {
      fontSize: '14px', fontFamily: 'monospace', color: '#887744'
    }).setOrigin(0.5);

    this.pointsText = this.add.text(660, startY + 22, `Points: ${this.pointsLeft}`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#e8d888'
    }).setOrigin(0.5);

    this.statRows = [];

    CharacterCreationScene.STATS.forEach((stat, i) => {
      const y = startY + 52 + i * 42;

      // Stat label
      const label = this.add.text(startX, y, stat.key, {
        fontSize: '14px', fontFamily: 'monospace', color: '#c8a85a', fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      // Make label interactive for help text
      label.setInteractive({ useHandCursor: true });
      label.on('pointerover', () => { this.showStatHelp(stat); });
      label.on('pointerout', () => { this.hideStatHelp(); });

      // Value
      const val = this.add.text(660, y, String(this.stats[stat.key]), {
        fontSize: '16px', fontFamily: 'monospace', color: '#ffffff'
      }).setOrigin(0.5);

      // Minus button
      const minusBg = this.add.rectangle(625, y, 22, 22, 0x332222).setStrokeStyle(1, 0x664444);
      const minusTxt = this.add.text(625, y, '-', {
        fontSize: '16px', fontFamily: 'monospace', color: '#ff6644'
      }).setOrigin(0.5);
      minusBg.setInteractive({ useHandCursor: true });
      minusBg.on('pointerdown', () => this.adjustStat(stat.key, -1));

      // Plus button
      const plusBg = this.add.rectangle(695, y, 22, 22, 0x223322).setStrokeStyle(1, 0x446644);
      const plusTxt = this.add.text(695, y, '+', {
        fontSize: '16px', fontFamily: 'monospace', color: '#44ff44'
      }).setOrigin(0.5);
      plusBg.setInteractive({ useHandCursor: true });
      plusBg.on('pointerdown', () => this.adjustStat(stat.key, 1));

      // Stat name (smaller, below key)
      this.add.text(startX, y + 14, stat.name, {
        fontSize: '10px', fontFamily: 'monospace', color: '#666655'
      });

      this.statRows.push({ key: stat.key, val, minusBg, plusBg });
    });

    // Help text area
    this.helpText = this.add.text(660, startY + 310, '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaa999',
      wordWrap: { width: 180 },
      align: 'center'
    }).setOrigin(0.5);
  }

  adjustStat(key, delta) {
    const newVal = this.stats[key] + delta;
    const newPoints = this.pointsLeft - delta;

    if (newVal < CharacterCreationScene.BASE_STAT) return; // can't go below base
    if (newPoints < 0) return; // no points left
    if (newPoints > CharacterCreationScene.BONUS_POINTS) return;

    this.stats[key] = newVal;
    this.pointsLeft = newPoints;

    // Refresh displays
    this.pointsText.setText(`Points: ${this.pointsLeft}`);
    this.pointsText.setColor(this.pointsLeft === 0 ? '#666655' : '#e8d888');

    this.statRows.forEach(row => {
      if (row.key === key) {
        row.val.setText(String(this.stats[key]));
        const boosted = this.stats[key] > CharacterCreationScene.BASE_STAT;
        row.val.setColor(boosted ? '#44ff44' : '#ffffff');
      }
    });
  }

  showStatHelp(stat) {
    this.helpText.setText(stat.help);
  }

  hideStatHelp() {
    this.helpText.setText('');
  }

  // ── Start button ────────────────────────────────────────
  drawStartButton() {
    const y = 555;
    this.startBg = this.add.rectangle(400, y, 240, 36, 0x443322).setStrokeStyle(2, 0xc8a85a);
    this.startTxt = this.add.text(400, y, 'ENTER THE DUNGEON', {
      fontSize: '16px', fontFamily: 'monospace', color: '#e8d888', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.startBg.setInteractive({ useHandCursor: true });
    this.startBg.on('pointerover', () => {
      this.startBg.setFillStyle(0x554433);
    });
    this.startBg.on('pointerout', () => {
      this.startBg.setFillStyle(0x443322);
    });
    this.startBg.on('pointerdown', () => this.enterDungeon());

    // Keyboard shortcut
    this.input.keyboard.on('keydown-ENTER', () => this.enterDungeon());
  }

  enterDungeon() {
    // Package character data
    const characterData = {
      class: this.selectedClass,
      gender: this.selectedGender,
      face: this.selectedFace,
      stats: { ...this.stats }
    };

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('DungeonScene', { character: characterData });
    });
  }
}
