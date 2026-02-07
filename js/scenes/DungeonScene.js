class DungeonScene extends Phaser.Scene {
  constructor() {
    super('DungeonScene');
  }

  // ── Rarity system (Fortnite-style) ──────────────────────────
  static RARITIES = [
    { name: 'Common',    color: 0xb0b0b0, glow: 0x888888, weight: 50 },
    { name: 'Uncommon',  color: 0x30bb30, glow: 0x22ff22, weight: 30 },
    { name: 'Rare',      color: 0x3399ff, glow: 0x44aaff, weight: 13 },
    { name: 'Epic',      color: 0xaa44ff, glow: 0xcc66ff, weight: 5  },
    { name: 'Legendary', color: 0xffaa00, glow: 0xffdd44, weight: 2  },
  ];

  static LOOT_ITEMS = [
    'Wooden Sword', 'Iron Shield', 'Health Potion', 'Flame Ring',
    'Shadow Cloak', 'Dragon Fang', 'Crystal Orb', 'Thunder Bow',
    'Enchanted Helm', 'Boots of Speed', 'Amulet of Power', 'Mystic Staff'
  ];

  // ── Dungeon map ─────────────────────────────────────────────
  // 0 = floor, 1 = wall, 2 = chest
  static TILE = 32;
  static MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    const T = DungeonScene.TILE;
    const MAP = DungeonScene.MAP;

    // ── Draw the dungeon ────────────────────────────────────
    this.walls = this.physics.add.staticGroup();
    this.chests = this.physics.add.staticGroup();

    for (let row = 0; row < MAP.length; row++) {
      for (let col = 0; col < MAP[row].length; col++) {
        const x = col * T + T / 2;
        const y = col * T + T / 2; // intentional bug? No:
        const py = row * T + T / 2;

        if (MAP[row][col] === 1) {
          // Wall tile
          const wall = this.add.rectangle(x, py, T, T, 0x334455);
          wall.setStrokeStyle(1, 0x445566);
          this.physics.add.existing(wall, true);
          this.walls.add(wall);
        } else if (MAP[row][col] === 0) {
          // Floor tile
          const shade = 0x1a1a22 + (((row + col) % 2) * 0x030305);
          this.add.rectangle(x, py, T, T, shade);
        } else if (MAP[row][col] === 2) {
          // Floor under chest
          this.add.rectangle(x, py, T, T, 0x1a1a22);
          // Chest
          const chest = this.add.rectangle(x, py, T - 8, T - 8, 0xccaa44);
          chest.setStrokeStyle(2, 0xffdd66);
          this.physics.add.existing(chest, true);
          this.chests.add(chest);
          // Chest sparkle
          this.tweens.add({
            targets: chest,
            alpha: 0.6,
            duration: 600 + Math.random() * 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      }
    }

    // ── Player ──────────────────────────────────────────────
    // Start in the first open floor tile
    const startCol = 1, startRow = 1;
    this.player = this.add.rectangle(
      startCol * T + T / 2,
      startRow * T + T / 2,
      T - 6, T - 6,
      0x44cc66
    );
    this.player.setStrokeStyle(2, 0x66ff88);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Player glow
    this.playerGlow = this.add.circle(this.player.x, this.player.y, 20, 0x44cc66, 0.08);

    // Collision
    this.physics.add.collider(this.player, this.walls);

    // Chest overlap
    this.physics.add.overlap(this.player, this.chests, (player, chest) => {
      this.openChest(chest);
    });

    // ── Camera ──────────────────────────────────────────────
    const mapWidth = MAP[0].length * T;
    const mapHeight = MAP.length * T;
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // ── Controls ────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // ── HUD ─────────────────────────────────────────────────
    this.inventory = [];
    this.hudText = this.add.text(10, 10, 'Chests: find them!', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#888877',
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    this.lootPopup = this.add.text(400, 550, '', {
      fontSize: '20px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);
  }

  // ── Chest loot ──────────────────────────────────────────────
  openChest(chest) {
    // Pick rarity by weighted random
    const rarities = DungeonScene.RARITIES;
    const totalWeight = rarities.reduce((sum, r) => sum + r.weight, 0);
    let roll = Math.random() * totalWeight;
    let rarity = rarities[0];
    for (const r of rarities) {
      roll -= r.weight;
      if (roll <= 0) { rarity = r; break; }
    }

    // Pick random item
    const items = DungeonScene.LOOT_ITEMS;
    const itemName = items[Math.floor(Math.random() * items.length)];

    // Remove chest
    chest.destroy();

    // Store loot
    this.inventory.push({ name: itemName, rarity: rarity.name });

    // Show loot popup with rarity color
    const colorHex = '#' + rarity.color.toString(16).padStart(6, '0');
    this.lootPopup.setText(`${rarity.name}: ${itemName}!`);
    this.lootPopup.setColor(colorHex);
    this.lootPopup.setAlpha(1);

    // Burst effect at chest location
    const burst = this.add.circle(chest.x, chest.y, 5, rarity.glow, 0.8);
    this.tweens.add({
      targets: burst,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      onComplete: () => burst.destroy()
    });

    // Fade out popup
    this.tweens.add({
      targets: this.lootPopup,
      alpha: 0,
      delay: 2000,
      duration: 500
    });

    // Update HUD
    this.hudText.setText(`Inventory: ${this.inventory.length} item(s)`);
  }

  update() {
    const speed = 150;
    const body = this.player.body;

    body.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      body.setVelocityY(speed);
    }

    // Normalize diagonal speed
    body.velocity.normalize().scale(speed);

    // Update glow position
    this.playerGlow.setPosition(this.player.x, this.player.y);
  }
}
