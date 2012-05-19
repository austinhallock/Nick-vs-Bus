var Constants;

Constants = {
  SCALE: .1,
  SCALE_INV: 1 / .1,
  BOTTOM: 60,
  BASE_WIDTH: 480,
  BASE_HEIGHT: 268,
  ENEMY_VEL: .5,
  BALL_RADIUS: 10,
  BALL_MASS: 1.4,
  MSG_FONT: "'Press Start 2P', Courier, monospace, sans-serif",
  TICK_DURATION: 16,
  FRAME_DELAY: 5,
  STATE_SAVE: 200,
  SAVE_LIFETIME: 5000,
  TARGET_LATENCY: 50,
  ASSETS: {
    bus: 'assets/images/bus.svg',
    gamepad: 'assets/images/gamepad.png',
    playerUp: 'assets/images/player-up.svg',
    playerDown: 'assets/images/player-down.svg',
    crowdUp: 'assets/images/crowd-up.svg',
    crowdDown: 'assets/images/crowd-down.svg',
    bush: 'assets/images/bush.svg',
    road: 'assets/images/road.svg',
    building: 'assets/images/building.svg'
  }
};

if (module) module.exports = Constants;
