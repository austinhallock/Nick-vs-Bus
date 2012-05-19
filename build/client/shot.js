var Constants, Shot, Sprite,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
}

Shot = (function(_super) {

  __extends(Shot, _super);

  Shot.name = 'Shot';

  function Shot(x, y) {
    var height, width;
    this.x = x;
    this.y = y;
    this.radius = Constants.BALL_RADIUS;
    if (typeof Globals !== 'undefined') this.bg = Globals.Loader.getAsset('ball');
    this.mass = Constants.BALL_MASS;
    this.locked = true;
    width = Constants.SHOT_WIDTH * Constants.LOGO_SCALE * Globals.sizeRatio * Constants.TECHSTARS_RELATIVE;
    height = Constants.SHOT_HEIGHT * Constants.LOGO_SCALE * Globals.sizeRatio * Constants.TECHSTARS_RELATIVE;
    this.x -= width / 2;
    this.y -= height / 2;
    Shot.__super__.constructor.call(this, this.x, this.y, width, height, this.bg);
  }

  Shot.prototype.shoot = function() {
    var dirX, dirY, playerRot;
    this.locked = false;
    playerRot = Globals.scene.world.p1.rot;
    dirX = Math.cos(playerRot - 3.14 / 2);
    dirY = Math.sin(playerRot - 3.14 / 2);
    this.velocity.x = Constants.SHOT_VEL * dirX;
    this.velocity.y = Constants.SHOT_VEL * dirY;
    return this.rot = playerRot;
  };

  Shot.prototype.incrementPosition = function(numFrames) {
    Shot.__super__.incrementPosition.call(this, numFrames);
    if (this.id && (this.x < 0 || this.y < 0 || this.x > Globals.scene.world.width || this.y > Globals.scene.world.width)) {
      delete Globals.scene.sprites[this.id];
      return delete Globals.scene.world.shots[this.id];
    }
  };

  Shot.prototype.draw = function(ctx, x, y) {
    var tx, ty;
    if (this.locked) {
      x || (x = Globals.scene.world.p1.x);
      y || (y = Globals.scene.world.p1.y);
      ctx.save();
      tx = x + Globals.scene.world.p1.width / 2;
      ty = y + Globals.scene.world.p1.height / 2;
      ctx.translate(tx, ty);
      ctx.rotate(Globals.scene.world.p1.rot);
      ctx.translate(-tx, -ty);
      if (this.bg) {
        ctx.drawImage(this.bg, tx - this.width / 2, ty - this.height / 2 - Globals.scene.world.p1.height * .28, this.width, this.height);
      }
      ctx.restore();
      this.x = tx;
      return this.y = ty;
    } else {
      return Shot.__super__.draw.call(this, ctx, x, y);
    }
  };

  return Shot;

})(Sprite);

if (module) module.exports = Shot;
