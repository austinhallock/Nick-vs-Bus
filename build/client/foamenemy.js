var Constants, FoamEnemy, Sprite,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
}

FoamEnemy = (function(_super) {

  __extends(FoamEnemy, _super);

  FoamEnemy.name = 'FoamEnemy';

  /* Not caching it since we want svg anim
  	@canvas = document.createElement( 'canvas' )
  	@fetchCanvas: ->
  		FoamEnemy.canvas.width = Globals.scene.world.p1.width
  		FoamEnemy.canvas.height = Globals.scene.world.p1.height
  		
  		FoamEnemy.ctx = FoamEnemy.canvas.getContext( '2d' )
  		FoamEnemy.updateCanvas()
  	@updateCanvas: ( dir = 'down' ) ->
  		person = Globals.Loader.getAsset( if dir == 'down' then 'crowdDown' else 'crowdUp' )
  		FoamEnemy.ctx.drawImage person, 0, 0, FoamEnemy.canvas.width, FoamEnemy.canvas.height
  */

  function FoamEnemy(side) {
    var direction;
    this.side = side != null ? side : 'top';
    direction = side === 'top' ? 1 : -1;
    this.alive = true;
    this.width || (this.width = Globals.scene.world.p1.width);
    this.height || (this.height = Globals.scene.world.p1.height);
    this.x = Globals.scene.width / 4 + Math.random() * (Globals.scene.width / 2);
    this.y = side === 'top' ? -1 * this.height : Globals.scene.height;
    this.originalWidth = this.width;
    this.originalHeight = this.height;
    this.bg = Globals.Loader.getAsset(side === 'top' ? 'crowdDown' : 'crowdUp');
    FoamEnemy.__super__.constructor.call(this, this.x, this.y, this.width, this.height, this.bg);
    this.velocity.y = Constants.ENEMY_VEL * direction * 1;
  }

  FoamEnemy.prototype.incrementPosition = function(numFrames) {
    var bottomLeft, bottomLeft1, bottomLeft2, bottomRight, bottomRight1, bottomRight2, player, topLeft, topLeft1, topLeft2, topRight, topRight1, topRight2;
    FoamEnemy.__super__.incrementPosition.call(this, numFrames);
    if ((this.side === 'top' && this.bottom > Globals.scene.height * 0.12) || (this.side === 'bottom' && this.top < Globals.scene.height * .88)) {
      this.velocity.y = 0;
    }
    player = Globals.scene.world.p1;
    topRight1 = this.right >= player.left && this.right <= player.right && this.top <= player.bottom && this.top >= player.top;
    topRight2 = player.right >= this.left && player.right <= this.right && player.top <= this.bottom && player.top >= this.top;
    topRight = topRight1 || topRight2;
    topLeft1 = this.left <= player.right && this.left >= player.left && this.top <= player.bottom && this.top >= player.top;
    topLeft2 = player.left <= this.right && player.left >= this.left && player.top <= this.bottom && player.top >= this.top;
    topLeft = topLeft1 || topLeft2;
    bottomRight1 = this.right >= player.left && this.right <= player.right && this.bottom >= player.top && this.bottom <= player.bottom;
    bottomRight2 = player.right >= this.left && player.right <= this.right && player.bottom >= this.top && player.bottom <= this.bottom;
    bottomRight = bottomRight1 || bottomRight2;
    bottomLeft1 = this.left <= player.right && this.left >= player.left && this.bottom >= player.top && this.bottom <= player.bottom;
    bottomLeft2 = player.left <= this.right && player.left >= this.left && player.bottom >= this.top && player.bottom <= this.bottom;
    bottomLeft = bottomLeft1 || bottomLeft2;
    if (topRight || topLeft || bottomRight || bottomLeft) {
      if (this.alive) {
        this.implode();
        Globals.scene.enemyVel += .33;
        Globals.scene.world.p1.toggleDirection();
        Globals.scene.incrementScore(1000 + Globals.scene.time * 100);
        Globals.scene.time = 15;
        Globals.scene.loadFoamEnemy(this.side === 'top' ? 'bottom' : 'top');
        this.alive = false;
      }
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

  FoamEnemy.prototype.implode = function() {
    var _this;
    if (this.width < 0.1 * this.originalWidth) {
      delete Globals.scene.sprites[this.id];
      return delete Globals.scene.world.foamEnemies[this.id];
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

  return FoamEnemy;

})(Sprite);

if (module) module.exports = Enemy;
