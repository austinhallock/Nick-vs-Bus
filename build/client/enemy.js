var Constants, Enemy, Sprite,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
}

Enemy = (function(_super) {

  __extends(Enemy, _super);

  Enemy.name = 'Enemy';

  Enemy.enemies = ['purple', 'green', 'white'];

  Enemy.colors = ['#6A0475', '#048C0D', '#eee'];

  Enemy.canvases = [];

  Enemy.width = 0;

  Enemy.height = 0;

  Enemy.fetchCanvases = function() {
    var canv1, ctx, foe, i, _i, _len, _ref, _results;
    Enemy.width = 170 * 1 * Globals.sizeRatio;
    Enemy.height = 30 * 1 * Globals.sizeRatio;
    _ref = Enemy.enemies;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      foe = _ref[i];
      canv1 = document.createElement('canvas');
      ctx = canv1.getContext('2d');
      canv1.width = Enemy.width;
      canv1.height = Enemy.height;
      ctx.fillStyle = Enemy.colors[i];
      ctx.fillRect(0, 0, Enemy.width, Enemy.height);
      ctx.drawImage(Globals.Loader.getAsset('bus'), 0, 0, Enemy.width, Enemy.height);
      /* flipped buses
      			canv2 = document.createElement( 'canvas' )
      			ctx = canv2.getContext('2d')
      			canv2.width = Enemy.width
      			canv2.height = Enemy.height
      			ctx.fillStyle = Enemy.colors[i]
      			ctx.rotate( 0.5 )
      			ctx.translate(canv2.width / 2, canv2.height / 2)
      			ctx.fillRect( 0, 0, Enemy.width, Enemy.height )
      			ctx.drawImage( Globals.Loader.getAsset('bus'), 0, 0, Enemy.width, Enemy.height )
      */
      _results.push(Enemy.canvases.push(canv1));
    }
    return _results;
  };

  function Enemy(lane) {
    var direction, enemyInt, offsetY;
    direction = lane <= 1 ? 1 : 0;
    offsetY = (Globals.scene.height - Globals.scene.world.road.height) / 2 + (Globals.scene.world.road.height / 8) - Enemy.height / 2;
    this.x = direction * Globals.scene.width;
    this.y = offsetY + lane * (Globals.scene.world.road.height / 4);
    enemyInt = Math.floor(Math.random() * 3);
    this.enemy = Enemy.enemies[enemyInt];
    this.alive = true;
    if (direction === 0) this.x -= Enemy.width;
    this.originalWidth = Enemy.width;
    this.originalHeight = Enemy.height;
    this.bg = Enemy.canvases[enemyInt];
    this.mass = Constants.BALL_MASS;
    Enemy.__super__.constructor.call(this, this.x, this.y, Enemy.width, Enemy.height, this.bg);
    /*
    		# aim at player sin theta = op / hyp
    		dx = ( @x + @width / 2 ) - ( target.x + target.width / 2 )
    		dy = ( @y + @height / 2 ) -  ( target.y + target.height / 2 )
    		theta = Math.atan2( dy, dx )
    		
    		dirX = -Math.cos theta
    		dirY = -Math.sin theta
    */
    this.dirX = direction ? -1 * Globals.sizeRatio : Globals.sizeRatio;
    this.velocity.x = Globals.scene.enemyVel * this.dirX;
  }

  Enemy.prototype.incrementPosition = function(numFrames) {
    var bottomLeft, bottomLeft1, bottomLeft2, bottomRight, bottomRight1, bottomRight2, player, topLeft, topLeft1, topLeft2, topRight, topRight1, topRight2;
    this.velocity.x = Globals.scene.enemyVel * this.dirX;
    Enemy.__super__.incrementPosition.call(this, numFrames);
    player = Globals.scene.world.p1;
    topRight1 = this.right > player.left && this.right < player.right && this.top < player.bottom && this.top > player.top;
    topRight2 = player.right > this.left && player.right < this.right && player.top < this.bottom && player.top > this.top;
    topRight = topRight1 || topRight2;
    topLeft1 = this.left < player.right && this.left > player.left && this.top < player.bottom && this.top > player.top;
    topLeft2 = player.left < this.right && player.left > this.left && player.top < this.bottom && player.top > this.top;
    topLeft = topLeft1 || topLeft2;
    bottomRight1 = this.right > player.left && this.right < player.right && this.bottom > player.top && this.bottom < player.bottom;
    bottomRight2 = player.right > this.left && player.right < this.right && player.bottom > this.top && player.bottom < this.bottom;
    bottomRight = bottomRight1 || bottomRight2;
    bottomLeft1 = this.left < player.right && this.left > player.left && this.bottom > player.top && this.bottom < player.bottom;
    bottomLeft2 = player.left < this.right && player.left > this.left && player.bottom > this.top && player.bottom < this.bottom;
    bottomLeft = bottomLeft1 || bottomLeft2;
    if (topRight || topLeft || bottomRight || bottomLeft) {
      if (this.enemy === 'purple' && this.alive) {
        this.implode();
        Globals.scene.showMessage("SAFE...");
      } else if (this.alive) {
        Globals.scene.showMessage("OUCH...");
        this.stop = true;
        Globals.scene.world.p1.stop = true;
        setTimeout(function() {
          return Globals.scene.handleWin();
        }, 1800);
      }
      this.alive = false;
    }
    if (this.left > Globals.scene.width + 5 || this.right < -5) {
      return this.remove = true;
    }
    /*
    		# Check for collisions with stars
    		for id, shot of Globals.scene.world.shots
    			# Make sure it's shot off and not locked & loaded, then check for collision
    			if shot && !shot.locked && Math.abs( ( shot.x + shot.width / 2 ) - ( @x + @width / 2 ) ) < @width / 2 && Math.abs( ( shot.y + shot.height / 2 ) - ( @y + @height / 2 ) ) < @height / 2
    				Globals.scene.incrementScore()
    				# enemy
    				@implode()				
    				# shot
    				delete Globals.scene.sprites[id]
    				delete Globals.scene.world.shots[id]
    */
  };

  Enemy.prototype.implode = function() {
    var _this;
    if (this.width < 0.1 * this.originalWidth) {
      delete Globals.scene.sprites[this.id];
      return delete Globals.scene.world.enemies[this.id];
    } else {
      this.x += this.width * .05;
      this.y += this.height * .05;
      this.width *= .9;
      this.height *= .9;
      _this = this;
      return setTimeout(function() {
        return _this.implode();
      }, 10);
    }
  };

  return Enemy;

})(Sprite);

if (module) module.exports = Enemy;
