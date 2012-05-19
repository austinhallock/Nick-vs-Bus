var Ball, Constants, Sprite,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
}

Ball = (function(_super) {

  __extends(Ball, _super);

  Ball.name = 'Ball';

  function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Constants.BALL_RADIUS;
    this.falling = true;
    if (typeof Globals !== 'undefined') this.bg = Globals.Loader.getAsset('ball');
    this.mass = Constants.BALL_MASS;
    Ball.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius * 2, this.bg);
  }

  return Ball;

})(Sprite);

if (module) module.exports = Ball;
