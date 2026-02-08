class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Flickering torch-light background glow
    this.glow = this.add.circle(cx, cy - 40, 200, 0xffaa33, 0.05);

    // Title
    this.add.text(cx, cy - 100, 'DUNGEON', {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#c8a85a',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, cy - 30, '~ of ~', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#887744'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 20, 'JACK', {
      fontSize: '72px',
      fontFamily: 'monospace',
      color: '#e8d888',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy + 90, 'A Dungeon Crawler', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#666655'
    }).setOrigin(0.5);

    // Prompt to start
    this.promptText = this.add.text(cx, cy + 160, '[ Press ENTER or SPACE to begin ]', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Blink the prompt
    this.tweens.add({
      targets: this.promptText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Pulse the glow
    this.tweens.add({
      targets: this.glow,
      alpha: 0.12,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Listen for start
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
  }

  startGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('CharacterCreationScene');
    });
  }
}
