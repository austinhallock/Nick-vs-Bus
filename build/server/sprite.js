var Constants, Sprite;

if (module) Constants = require('./constants');

Sprite = (function() {

  Sprite.name = 'Sprite';

  function Sprite(x, y, width, height, bg, id) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.bg = bg;
    this.id = id != null ? id : false;
    this.velocity || (this.velocity = {
      x: 0,
      y: 0
    });
    this.rot = 0;
    this.rotVel = 0;
    this.acceleration || (this.acceleration = {
      x: 0,
      y: Constants.GRAVITY
    });
    this.mass || (this.mass = 1.0);
    this.stop = false;
    this.left = this.x;
    this.right = this.x + this.width;
    this.top = this.y;
    this.bottom = this.top + this.y;
    this.remove = false;
  }

  Sprite.prototype.setPosition = function(x, y) {
    if (!y) {
      if (x['y']) y = x['y'];
      if (x['x']) x = x['x'];
    }
    this.x = x;
    return this.y = y;
  };

  Sprite.prototype.incrementPosition = function(numFrames) {
    if (this.stop) return;
    this.x += this.velocity.x * numFrames;
    this.y += this.velocity.y * numFrames;
    this.rot += this.rotVel * numFrames;
    this.velocity.x += this.acceleration.x * this.mass * numFrames * numFrames;
    this.left = this.x;
    this.right = this.left + this.width;
    this.top = this.y;
    return this.bottom = this.top + this.height;
  };

  Sprite.prototype.draw = function(ctx, x, y) {
    var tx, ty;
    x || (x = this.x);
    y || (y = this.y);
    if (this.rot !== 0) {
      ctx.save();
      tx = x + this.width / 2;
      ty = y + this.height / 2;
      ctx.translate(tx, ty);
      ctx.rotate(this.rot);
      ctx.translate(-tx, -ty);
      if (this.bg) ctx.drawImage(this.bg, x, y, this.width, this.height);
      return ctx.restore();
    } else {
      if (this.bg) return ctx.drawImage(this.bg, x, y, this.width, this.height);
    }
  };

  Sprite.prototype.getState = function() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      velocity: {
        x: this.velocity.x,
        y: this.velocity.y
      }
    };
  };

  Sprite.prototype.setState = function(objState) {
    if (!objState) return;
    this.x = objState.x;
    this.y = objState.y;
    this.width = objState.width;
    this.height = objState.height;
    return this.velocity = {
      x: objState.velocity.x,
      y: objState.velocity.y
    };
  };

  return Sprite;

})();

if (module) module.exports = Sprite;
