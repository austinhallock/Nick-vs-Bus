var Constants, Helpers, Player, Sprite, World;

if (module) {
  Constants = require('./constants');
  Helpers = require('./helpers');
  Sprite = require('./sprite');
  Player = require('./player');
}

World = (function() {

  World.name = 'World';

  function World(width, height, input) {
    var bctx, bheight, bld, bush, bushes, bwidth, ctx, i, rbg, rheight, rwidth, _i;
    this.width = width;
    this.height = height;
    this.input = input;
    this.lastStep = null;
    this.clock = 0;
    this.shots = {};
    this.enemies = {};
    this.foamEnemies = {};
    width = 50 * Globals.sizeRatio;
    height = 50 * Globals.sizeRatio;
    this.p1 = new Player(this.width / 2 - width / 2, this.height - height, false);
    rwidth = this.width;
    rheight = this.height * .7;
    rbg = document.createElement('canvas');
    rbg.height = rheight;
    rbg.width = rwidth;
    ctx = rbg.getContext('2d');
    ctx.drawImage(Globals.Loader.getAsset('road'), 0, 0, rwidth, rheight);
    this.road = new Sprite(0, this.height / 2 - rheight / 2, rwidth, rheight, rbg);
    /*
    		@crowdCanvas = document.createElement( 'canvas' )
    		@crowdCanvas.width = @p1.width * 10
    		@crowdCanvas.height = @p1.height * 15
    		
    		
    		ctx = @crowdCanvas.getContext( '2d' )
    		person = Globals.Loader.getAsset( 'crowd' )
    		ctx.drawImage person, 0, 0, @p1.width, @p1.height
    		setInterval =>
    			ctx.clearRect( 0, 0, @crowdCanvas.width, @crowdCanvas.height )
    			for i in [0...10]
    				for j in [0...3]
    					ctx.drawImage( person, i * @p1.width * Math.random(), j * @p1.height * Math.random() * .3, @p1.width, @p1.height )
    		, 150
    					
    		@crowd = new Sprite( @width / 2 - @crowdCanvas.width / 2, 0, @crowdCanvas.width, @crowdCanvas.height, @crowdCanvas )
    */
    bwidth = this.width * .2;
    bheight = this.width * .2;
    bld = document.createElement('canvas');
    bld.height = bheight;
    bld.width = bwidth;
    bctx = bld.getContext('2d');
    bctx.drawImage(Globals.Loader.getAsset('building'), 0, 0, bwidth, bheight);
    this.building1 = new Sprite(50, this.height * .88, bwidth, bheight, bld);
    this.building2 = new Sprite(this.width - bwidth - 50, this.height * .88, bwidth, bheight, bld);
    bushes = document.createElement('canvas');
    bushes.width = this.width / 1.2;
    bushes.height = this.height * .1;
    bctx = bushes.getContext('2d');
    bush = Globals.Loader.getAsset('bush');
    for (i = _i = 0; _i < 10; i = ++_i) {
      bctx.drawImage(bush, i * bushes.width / 10, 0, bushes.height, bushes.height);
    }
    bwidth = this.width * .1;
    bheight = this.height * .1;
    this.bushes = new Sprite(200, this.height * .95 - bheight, bushes.width, bushes.height, bushes);
  }

  World.prototype.reset = function() {
    var i, interval, main, _ref;
    main = Globals.scene;
    main.enemyVel = 5 * Constants.ENEMY_VEL;
    clearInterval(main.timeInterval);
    if (main.loadingEnemy) {
      _ref = main.loadingEnemy;
      for (i in _ref) {
        interval = _ref[i];
        clearTimeout(interval);
        delete main.loadingEnemy[i];
      }
    }
    return this.numFrames = 1;
  };

  World.prototype.step = function(interval, dontIncrementClock) {
    var enemy, id, newInterval, now, tick, _ref, _ref2;
    now = new Date().getTime();
    tick = Constants.TICK_DURATION;
    if (this.lastStep) interval || (interval = now - this.lastStep);
    interval || (interval = tick);
    if (!dontIncrementClock) this.lastStep = now;
    if (interval >= 1.3 * tick && this.deterministic) {
      while (interval > 0) {
        newInterval = interval >= 1.3 * tick ? tick : interval;
        this.step(newInterval, dontIncrementClock);
        interval -= newInterval;
      }
      return;
    } else if (this.deterministic) {
      interval = tick;
    }
    this.numFrames = interval / tick;
    this.clock += interval;
    this.handleInput();
    _ref = this.enemies;
    for (id in _ref) {
      enemy = _ref[id];
      if (enemy) enemy.incrementPosition(this.numFrames);
    }
    _ref2 = this.foamEnemies;
    for (id in _ref2) {
      enemy = _ref2[id];
      if (enemy) enemy.incrementPosition(this.numFrames);
    }
    return this.p1.incrementPosition(this.numFrames);
    /*
    		if now - @stateSaves.lastPush > Constants.STATE_SAVE # save current state every STATE_SAVE ms
    			@stateSaves.lastPush = now
    			@stateSaves.push # push a frame structure on to @stateSaves
    				state: this.getState()
    				input: null
    */
  };

  World.prototype.handleInput = function() {
    return this.p1.handleInput(this.input);
  };

  /* -- GAME STATE GETTER + SETTERS --
  */

  World.prototype.getState = function() {
    return {
      p1: this.p1.getState(),
      clock: this.clock
    };
  };

  World.prototype.setState = function(state) {
    return this.p1.setState(state.p1);
  };

  World.prototype.getInput = function() {
    return {
      p1: this.input.getState(0)
    };
  };

  World.prototype.setInput = function(newInput) {
    if (!newInput) return;
    if (newInput.p1) return this.input.setState(newInput.p1, 0);
  };

  World.prototype.setFrame = function(frame) {
    if (!frame) return;
    this.setState(frame.state);
    return this.setInput(frame.input);
  };

  World.prototype.getFrame = function() {
    return {
      state: this.getState(),
      input: this.getInput()
    };
  };

  return World;

})();

if (module) module.exports = World;
