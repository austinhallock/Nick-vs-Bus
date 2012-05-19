var Constants, Message, Sprite,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
}

Message = (function(_super) {

  __extends(Message, _super);

  Message.name = 'Message';

  function Message(msg, x, y) {
    this.msg = msg;
    this.x = x;
    this.y = y;
    this.opacity = 0.5;
    this.fontSize = 14;
  }

  Message.prototype.draw = function(ctx) {
    var msg;
    this.ctx = ctx;
    this.ctx.font = 'bold ' + this.fontSize + 'px ' + Constants.MSG_FONT;
    this.ctx.fillStyle = 'rgba( 255, 255, 255, ' + this.opacity + ')';
    this.ctx.textAlign = 'left';
    msg = "Score: " + this.score;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "rgba( 0, 0, 0, 0.8 )";
    this.ctx.fillText(this.msg, this.x, this.y);
    this.ctx.strokeText(this.msg, this.x, this.y);
    return Message.__super__.draw.call(this, this.ctx);
  };

  return Message;

})(Sprite);

if (module) module.exports = Message;
