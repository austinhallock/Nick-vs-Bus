
(function() {
  var lastTime, vendors, x, _fn, _i, _ref;
  lastTime = 0;
  vendors = ['ms', 'moz', 'webkit', 'o'];
  _fn = function(x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    return window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  };
  for (x = _i = 0, _ref = vendors.length; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
    _fn.call(this, x);
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime, id, timeToCall;
      currTime = new Date().getTime();
      timeToCall = Math.max(0, 16 - (currTime - lastTime));
      id = window.setTimeout((function() {
        return callback(currTime + timeToCall);
      }), timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    return window.cancelAnimationFrame = function(id) {
      return window.clearTimeout(id);
    };
  }
}).call(this);

CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  if (r === 0) r = 1;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};

if (!window.addEventListener) {
  window.addEventListener = function(event, callback, capture) {
    if (window.attachEvent) {
      return window.attachEvent('on' + event, callback);
    } else {
      return window['on' + event] = callback;
    }
  };
}

window.addEventListener("load", function() {
  return setTimeout((function() {
    return window.scrollTo(0, 1);
  }), 0);
});

window.module || (window.module = false);

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

var Helpers;

Helpers = {
  round: function(num) {
    return (0.5 + num) << 0;
  },
  inRect: function(x, y, x2, y2, w, h) {
    return x > x2 && x < x2 + w && y > y2 && y < y2 + h;
  },
  deg2Rad: function(a) {
    return a * Math.PI / 180;
  },
  rad2Deg: function(a) {
    return a * 180 / Math.PI;
  },
  yFromAngle: function(angle) {
    return -Math.cos(Helpers.deg2Rad(angle));
  },
  xFromAngle: function(angle) {
    return Math.sin(Helpers.deg2Rad(angle));
  },
  rand: function(max) {
    return Math.floor(Math.random() * (max + 1));
  },
  dist: function(obj1, obj2) {
    return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
  },
  mag: function(obj) {
    return Math.sqrt(Math.pow(obj.x, 2) + Math.pow(obj.y, 2));
  }
};

if (module) module.exports = Helpers;

var SceneManager;

SceneManager = (function() {

  SceneManager.name = 'SceneManager';

  function SceneManager(canvas) {
    this.canvas = canvas;
    this.sceneStack = [];
    this.currScene = null;
  }

  SceneManager.prototype.pushScene = function(scene) {
    this.sceneStack.push(scene);
    if (this.currScene) {
      this.currScene.stop();
      this.currScene.ctx = null;
    }
    this.currScene = scene;
    this.currScene.ctx = this.ctx;
    if (this.currScene.initialized) {
      return this.currScene.start();
    } else {
      return this.currScene.init();
    }
  };

  SceneManager.prototype.popScene = function() {
    var oldScene;
    if (this.currScene) {
      this.currScene.stop();
      this.currScene.ctx = null;
    }
    oldScene = this.sceneStack.pop();
    if (oldScene && oldScene.destroy) oldScene.destroy();
    this.currScene = this.sceneStack[this.sceneStack.length - 1] || null;
    if (this.currScene) {
      this.currScene.ctx = this.ctx;
      this.currScene.start();
    }
    return oldScene;
  };

  return SceneManager;

})();

var Scene,
  __hasProp = Object.prototype.hasOwnProperty;

Scene = (function() {

  Scene.name = 'Scene';

  function Scene() {
    var _this = this;
    this.stopped = true;
    this.initialized = false;
    this.lastTimeout = 0;
    this.width = Globals.Manager.canvas.width;
    this.height = Globals.Manager.canvas.height;
    this.center = {
      x: this.width / 2,
      y: this.height / 2
    };
    this.canvas = Globals.Manager.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.buttons || (this.buttons = {});
    this.stepCallback = function(timestamp) {
      return _this.step(timestamp);
    };
  }

  Scene.prototype.init = function() {
    this.stopped = false;
    this.initialized = true;
    return this.step(new Date().getTime());
  };

  Scene.prototype.start = function() {
    this.stopped = false;
    return this.step(new Date().getTime());
  };

  Scene.prototype.step = function(timestamp) {};

  Scene.prototype.next = function() {
    if (!this.stopped) {
      return this.lastTimeout = window.requestAnimationFrame(this.stepCallback);
    }
  };

  Scene.prototype.stop = function() {
    this.stopped = true;
    return window.cancelAnimationFrame(this.lastTimeout);
  };

  Scene.prototype.click = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      btn = _ref[key];
      _results.push(btn.handleClick(e));
    }
    return _results;
  };

  Scene.prototype.mousedown = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      btn = _ref[key];
      _results.push(btn.handleMouseDown(e));
    }
    return _results;
  };

  Scene.prototype.mousemove = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      btn = _ref[key];
      _results.push(btn.handleMouseMove(e));
    }
    return _results;
  };

  Scene.prototype.mouseup = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      btn = _ref[key];
      _results.push(btn.handleMouseUp(e));
    }
    return _results;
  };

  Scene.prototype.mouseout = function(e) {};

  Scene.prototype.buttonPressed = function() {};

  return Scene;

})();

var Loader;

Loader = (function() {

  Loader.name = 'Loader';

  function Loader() {
    this.progress = 0;
    this.assets = {};
    this.totalAssets = 0;
    this.loadedAssets = 0;
  }

  Loader.prototype.updateProgress = function() {
    this.progress = this.loadedAssets / this.totalAssets;
    if (this.onprogress) this.onprogress(this.progress);
    if (this.progress === 1 && this.onload) return this.onload();
  };

  Loader.prototype.load = function(assets) {
    var asset, name, _results;
    _results = [];
    for (name in assets) {
      asset = assets[name];
      _results.push(this.loadAsset(name, asset));
    }
    return _results;
  };

  Loader.prototype.loadAsset = function(name, asset) {
    var img, loader;
    img = new Image();
    loader = this;
    img.onload = function() {
      this.loaded = true;
      loader.loadedAssets++;
      return loader.updateProgress();
    };
    this.assets[name] = {
      loader: this,
      src: asset,
      image: img
    };
    this.totalAssets++;
    return img.src = asset;
  };

  Loader.prototype.loadProgress = function(func) {
    return this.onprogress = func;
  };

  Loader.prototype.loadComplete = function(func) {
    return this.onload = func;
  };

  Loader.prototype.getAsset = function(name) {
    return this.assets[name]['image'];
  };

  return Loader;

})();

var Input,
  __hasProp = Object.prototype.hasOwnProperty;

Input = (function() {

  Input.name = 'Input';

  function Input() {
    var canvas, handleClick, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseOut, handleMouseUp, multitouchShim, normalizeCoordinates, normalizeKeyEvent, normalizeMouseEvent,
      _this = this;
    this.keys = {};
    this.anyInput = false;
    normalizeKeyEvent = function(e) {
      e.which || (e.which = e.charCode);
      e.which || (e.which = e.keyCode);
      return e;
    };
    normalizeCoordinates = function(o) {
      var bb, c;
      c = Globals.Manager.canvas;
      bb = c.getBoundingClientRect();
      o.x = (o.x - bb.left) * (c.width / bb.width);
      o.y = (o.y - bb.top) * (c.height / bb.height);
      return o;
    };
    normalizeMouseEvent = function(e) {
      var c, x, y;
      c = Globals.Manager.canvas;
      x = e.clientX || e.x || e.layerX;
      y = e.clientY || e.y || e.layerY;
      return normalizeCoordinates({
        x: x,
        y: y,
        identifier: e.identifier
      });
    };
    handleKeyDown = function(e) {
      var ele, event;
      _this.anyInput = true;
      event = normalizeKeyEvent(e);
      if (event.which >= 37 && event.which <= 40) event.preventDefault();
      if (event.which === 27) {
        ele = document.getElementById('ui');
        if (ele) ele.setAttr('style', 'display: none;');
      }
      return _this.keys['key' + event.which] = true;
    };
    handleKeyUp = function(e) {
      _this.anyInput = false;
      return _this.keys['key' + normalizeKeyEvent(e).which] = false;
    };
    handleMouseUp = function(e) {
      _this.anyInput = false;
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mouseup(e);
    };
    handleMouseDown = function(e) {
      _this.anyInput = true;
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mousedown(e);
    };
    handleMouseMove = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mousemove(e);
    };
    handleClick = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.click(e);
    };
    handleMouseOut = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mouseout(e);
    };
    multitouchShim = function(callback) {
      return (function(cb) {
        return function(e) {
          var t, _i, _len, _ref;
          e.preventDefault();
          _ref = e.changedTouches;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            t = _ref[_i];
            cb({
              x: t.clientX,
              y: t.clientY,
              identifier: t.identifier
            });
          }
        };
      }).call(this, callback);
    };
    canvas = Globals.Manager.canvas;
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    canvas.addEventListener('mouseup', handleMouseUp, true);
    canvas.addEventListener('mousedown', handleMouseDown, true);
    canvas.addEventListener('mousemove', handleMouseMove, true);
    canvas.addEventListener('mouseout', handleMouseOut, true);
    canvas.addEventListener('click', handleClick, true);
    canvas.addEventListener('touchstart', multitouchShim(handleMouseDown), true);
    canvas.addEventListener('touchend', multitouchShim(handleMouseUp), true);
    canvas.addEventListener('touchmove', multitouchShim(handleMouseMove), true);
    canvas.addEventListener('touchcancel', multitouchShim(handleMouseUp), true);
    this.shortcuts = {
      left: ['key37', 'key65'],
      right: ['key39', 'key68'],
      up: ['key38', 'key87'],
      down: ['key40', 'key83']
    };
  }

  Input.prototype.left = function(p2) {
    return this.keys[this.shortcuts['left'][p2]] || false;
  };

  Input.prototype.right = function(p2) {
    return this.keys[this.shortcuts['right'][p2]] || false;
  };

  Input.prototype.up = function(p2) {
    return this.keys[this.shortcuts['up'][p2]] || false;
  };

  Input.prototype.down = function(p2) {
    return this.keys[this.shortcuts['down'][p2]] || false;
  };

  Input.prototype.reset = function() {
    var key, val, _ref, _results;
    _ref = this.keys;
    _results = [];
    for (key in _ref) {
      val = _ref[key];
      _results.push(this.keys[key] = false);
    }
    return _results;
  };

  Input.prototype.getState = function(p2) {
    return {
      left: this.keys[this.shortcuts['left'][p2]],
      right: this.keys[this.shortcuts['right'][p2]],
      up: this.keys[this.shortcuts['up'][p2]],
      down: this.keys[this.shortcuts['down'][p2]]
    };
  };

  Input.prototype.set = function(shortcut, val, p2) {
    if (p2 == null) p2 = 0;
    return this.keys[this.shortcuts[shortcut][p2]] = val;
  };

  Input.prototype.setState = function(state, p2) {
    var shortcut, val, _results;
    if (p2 == null) p2 = 0;
    _results = [];
    for (shortcut in state) {
      if (!__hasProp.call(state, shortcut)) continue;
      val = state[shortcut];
      _results.push(this.keys[this.shortcuts[shortcut][p2]] = val);
    }
    return _results;
  };

  return Input;

})();

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

var Button,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Button = (function(_super) {

  __extends(Button, _super);

  Button.name = 'Button';

  function Button(x, y, width, height, img, downImg, scene) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;
    this.downImg = downImg;
    this.scene = scene;
    this.down = false;
    Button.__super__.constructor.call(this, this.x, this.y, this.width, this.height, this.img);
  }

  Button.prototype.handleMouseDown = function(e) {
    return this.down = Helpers.inRect(e.x, e.y, this.x, this.y, this.width, this.height);
  };

  Button.prototype.handleMouseUp = function(e) {
    if (this.down && Helpers.inRect(e.x, e.y, this.x, this.y, this.width, this.height)) {
      if (this.scene) this.scene.buttonPressed(this);
    }
    return this.down = false;
  };

  Button.prototype.handleMouseMove = function(e) {
    if (this.down) {
      return this.down = Helpers.inRect(e.x, e.y, this.x, this.y, this.width, this.height);
    }
  };

  Button.prototype.handleClick = function(e) {
    return this.down = false;
  };

  Button.prototype.draw = function(ctx) {
    if (!this.img) return;
    return ctx.drawImage((this.down ? this.downImg : this.img), Helpers.round(this.x), Helpers.round(this.y));
  };

  return Button;

})(Sprite);

var GamePad;

GamePad = (function() {

  GamePad.name = 'GamePad';

  function GamePad(btnRects) {
    this.btnRects = btnRects;
    this.previousPos = {};
  }

  GamePad.prototype.inRect = function(e, rect) {
    if (!e) return false;
    return Helpers.inRect(e.x, e.y, rect[0], rect[1], rect[2], rect[3]);
  };

  GamePad.prototype.findRect = function(e) {
    var key, val, _ref;
    _ref = this.btnRects;
    for (key in _ref) {
      val = _ref[key];
      if (this.inRect(e, val)) return key;
    }
    return null;
  };

  GamePad.prototype.savePreviousPos = function(e) {
    return this.previousPos[(e.identifier || '0') + ''] = e;
  };

  GamePad.prototype.getPreviousPos = function(e) {
    return this.previousPos[(e.identifier || '0') + ''];
  };

  GamePad.prototype.handleMouseDown = function(e) {
    var box;
    box = this.findRect(e);
    if (box) Globals.Input.set(box, true);
    return this.savePreviousPos(e);
  };

  GamePad.prototype.handleMouseMove = function(e) {
    var box, prevBox, prevPos;
    if (!e.identifier) return;
    box = this.findRect(e);
    prevPos = this.getPreviousPos(e);
    prevBox = prevPos ? this.findRect(prevPos) : null;
    this.savePreviousPos(e);
    if (prevBox && box === prevBox) {
      return Globals.Input.set(prevBox, true);
    } else if (prevBox && box !== prevBox) {
      Globals.Input.set(prevBox, false);
      if (box) return Globals.Input.set(box, false);
    }
  };

  GamePad.prototype.handleMouseUp = function(e) {
    var box;
    box = this.findRect(e);
    if (box) Globals.Input.set(box, false);
    return this.savePreviousPos(e);
  };

  GamePad.prototype.handleClick = function() {};

  return GamePad;

})();

var Globals;

Globals = {
  Input: null,
  Manager: new SceneManager(),
  Loader: new Loader()
};

var StretchySprite,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

StretchySprite = (function(_super) {

  __extends(StretchySprite, _super);

  StretchySprite.name = 'StretchySprite';

  function StretchySprite(x, y, width, height, rightCap, topCap, bg) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rightCap = rightCap;
    this.topCap = topCap;
    this.bg = bg;
    this.generateStretchedImage();
    StretchySprite.__super__.constructor.call(this, this.x, this.y, this.width, this.height);
  }

  StretchySprite.prototype.generateStretchedImage = function() {
    var createCanvas, ctx, rightCanvas, rightCtx, rightPattern, topCanvas, topCtx, topPattern;
    createCanvas = function(w, h) {
      var c;
      c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return c;
    };
    topCanvas = createCanvas(this.width, 2);
    rightCanvas = createCanvas(8, this.height);
    topCtx = topCanvas.getContext('2d');
    topCtx.drawImage(this.bg, 0, this.topCap, this.bg.width, 1, 0, 0, this.width, topCanvas.height);
    rightCtx = rightCanvas.getContext('2d');
    rightCtx.drawImage(this.bg, this.bg.width - this.rightCap - rightCanvas.width, 0, rightCanvas.width, this.bg.height, 0, this.height - this.bg.height, rightCanvas.width, this.bg.height);
    this.stretchedImage = createCanvas(this.width, this.height);
    ctx = this.stretchedImage.getContext('2d');
    ctx.drawImage(this.bg, this.x, this.y + this.height - this.bg.height);
    rightPattern = ctx.createPattern(rightCanvas, "repeat-x");
    ctx.fillStyle = rightPattern;
    ctx.fillRect(this.bg.width - this.rightCap, this.height - this.bg.height, this.width - this.bg.width, this.bg.height);
    topPattern = ctx.createPattern(topCanvas, "repeat-y");
    ctx.fillStyle = topPattern;
    ctx.fillRect(0, this.topCap, this.width, this.height - this.bg.height);
    ctx.drawImage(this.bg, 0, 0, this.bg.width, this.topCap, 0, 0, this.width, this.topCap);
    return ctx.drawImage(this.bg, this.bg.width - this.rightCap, 0, this.rightCap, this.bg.height, this.width - this.rightCap, this.height - this.bg.height, this.rightCap, this.bg.height);
  };

  StretchySprite.prototype.draw = function(ctx) {
    return ctx.drawImage(this.stretchedImage, 0, 0);
  };

  return StretchySprite;

})(Sprite);

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

var Constants, Player, Sprite,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
}

Player = (function(_super) {

  __extends(Player, _super);

  Player.name = 'Player';

  function Player(x, y, isP2) {
    this.x = x;
    this.y = y;
    this.isP2 = isP2;
    this.score = 0;
    this.width = Globals.sizeRatio * 30 * .6;
    this.height = Globals.sizeRatio * 70 * .6;
    this.curDir = 'Up';
    this.offset = this.height / 2;
    /*
    		@bg = document.createElement( 'canvas' )
    		ctx = @bg.getContext('2d')
    		ctx.fillStyle = '#361B09'
    		ctx.fillRect( 1, @height / 2 + 1, @width - 1, @height / 2 - 1)
    		ctx.fillStyle = '#fff'
    		ctx.strokeRect( 0, @height / 2, @width, @height / 2 )
    		ctx.fillStyle = '#fff' # swort
    		ctx.fillRect( 0, 0, @width / 5, @height / 2 )
    */
    /*
    		canv = document.createElement( 'canvas' )
    		ctx = canv.getContext( '2d' )
    		ctx.drawImage Globals.Loader.getAsset( 'player' ), 0, 0, @width, @height # can't do this because of svg anim
    */
    Player.__super__.constructor.call(this, this.x, this.y, this.width, this.height, Globals.Loader.getAsset('playerUp'));
  }

  Player.prototype.handleInput = function(input) {
    var pNum;
    pNum = 0;
    if (input.left(pNum) && this.left > 0) {
      this.velocity.x = -3 * Globals.sizeRatio;
    } else if (input.right(pNum) && this.right < Globals.scene.width) {
      this.velocity.x = 3 * Globals.sizeRatio;
    } else {
      this.velocity.x = 0;
    }
    if (input.up(pNum) && this.top > 0) {
      return this.velocity.y = -3 * Globals.sizeRatio;
    } else if (input.down(pNum) && this.bottom < Globals.scene.height) {
      return this.velocity.y = 3 * Globals.sizeRatio;
    } else {
      return this.velocity.y = 0;
    }
  };

  Player.prototype.toggleDirection = function() {
    var dir;
    dir = this.curDir === 'Up' ? 'Down' : 'Up';
    this.bg = Globals.Loader.getAsset('player' + dir);
    this.curDir = dir;
    return this.offset *= -1;
  };

  Player.prototype.incrementPosition = function(numFrames) {
    Player.__super__.incrementPosition.call(this, numFrames);
    if (this.curDir === 'Up') {
      return this.top += this.offset;
    } else {
      return this.bottom += this.offset;
    }
  };

  Player.prototype.draw = function(ctx) {
    return Player.__super__.draw.call(this, ctx);
  };

  return Player;

})(Sprite);

if (module) module.exports = Player;

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

var LoadingScene,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

LoadingScene = (function(_super) {

  __extends(LoadingScene, _super);

  LoadingScene.name = 'LoadingScene';

  function LoadingScene() {
    this.loadStarted = false;
    this.progress = 0;
    LoadingScene.__super__.constructor.call(this);
  }

  LoadingScene.prototype.start = function() {
    var _scene;
    _scene = this;
    if (!this.loadStarted) {
      this.loadStarted = true;
      Globals.Loader.loadProgress(function(progress) {
        return _scene.loadProgress(progress, _scene);
      });
      Globals.Loader.loadComplete(function() {
        return _scene.loadComplete();
      });
      Globals.Loader.load(Constants.ASSETS);
    }
    return LoadingScene.__super__.start.call(this);
  };

  LoadingScene.prototype.loadComplete = function() {
    Globals.Manager.popScene();
    Globals.scene = new NickVsBus();
    return Globals.Manager.pushScene(Globals.scene);
  };

  LoadingScene.prototype.loadProgress = function(progress, scene) {
    this.progress = progress;
    return scene.next();
  };

  LoadingScene.prototype.step = function(timestamp) {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = '#111';
    this.ctx.lineWidth = 1;
    this.ctx.roundRect(Helpers.round(this.center.x - 35), Helpers.round(this.center.y - 5), 70, 10, 2).stroke();
    this.ctx.fillStyle = '#444';
    this.ctx.roundRect(Helpers.round(this.center.x - 35), Helpers.round(this.center.y - 5), 70, 10, 2).fill();
    this.ctx.fillStyle = '#0f0';
    this.ctx.roundRect(Helpers.round(this.center.x - 35), Helpers.round(this.center.y - 5), 70 * this.progress, 10, 2).fill();
    this.ctx.font = '12px Monaco, Courier New, Courier, san-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#bbb';
    return this.ctx.fillText('Loading...', Helpers.round(this.center.x), Helpers.round(this.center.y + 25));
  };

  return LoadingScene;

})(Scene);

var NickVsBus,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

NickVsBus = (function(_super) {

  __extends(NickVsBus, _super);

  NickVsBus.name = 'NickVsBus';

  function NickVsBus() {
    return NickVsBus.__super__.constructor.apply(this, arguments);
  }

  NickVsBus.prototype.init = function(dontOverrideInput) {
    var bg, canvas, ctx, loader,
      _this = this;
    if (Globals.windowSize && Globals.windowSize.width) {
      this.width = Globals.windowSize.width;
      this.height = Globals.windowSize.height;
    } else {
      this.width = 800;
      this.height = 447;
    }
    this.world || (this.world = new World(this.width, this.height, Globals.Input));
    loader = Globals.Loader;
    bg = document.createElement('canvas');
    ctx = bg.getContext('2d');
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, this.width, this.height);
    this.bg = new StretchySprite(0, 0, this.width, this.height, 200, 1, bg);
    this.freezeGame = true;
    this.initialLoad = true;
    this.refreshSprites();
    this.loadingEnemy = {};
    this.world.reset();
    this.last = 0;
    this.time = 15;
    this.score = 0;
    this.displayMsg = "\n Instructions:";
    this.displayMsg += "\n Cross road back and forth, knock out foam sword foes";
    this.displayMsg += "\n Use arrow keys to move";
    this.displayMsg += "\n Getting hit by a green or white bus will kill you";
    this.displayMsg += "\n Purple buses don't do damage, because you're Nick";
    this.displayMsg += "\n ... and you're pretty much invincible";
    this.displayMsg += "\n You have 15 seconds each time to cross the road";
    this.displayMsg += "\n\nClick anywhere to start";
    this.keyState = {
      left: false,
      right: false,
      up: false
    };
    if (!dontOverrideInput) {
      this.world.handleInput = function() {
        return _this.world.p1.handleInput(Globals.Input);
      };
    }
    NickVsBus.__super__.init.call(this);
    canvas = Globals.Manager.canvas;
    _this = this;
    canvas.addEventListener('click', function() {
      return _this.handleMouseDown();
    }, true);
    return canvas.addEventListener('touchstart', function() {
      return _this.handleMouseDown();
    }, true);
  };

  NickVsBus.prototype.refreshSprites = function() {
    var gamepad, gamepadUI;
    this.sprites = [];
    this.sprites.push(this.bg, this.world.road, this.world.bushes, this.world.building1, this.world.building2, this.world.p1);
    gamepad = new GamePad({
      left: [0, this.height - Constants.BOTTOM, this.width / 4, Constants.BOTTOM],
      right: [this.width / 4, this.height - Constants.BOTTOM, this.width / 4, Constants.BOTTOM],
      up: [2 * this.width / 4, this.height - Constants.BOTTOM, this.width / 4, Constants.BOTTOM],
      down: [3 * this.width / 4, this.height - Constants.BOTTOM, this.width / 4, Constants.BOTTOM]
    });
    this.buttons['gamepad'] = gamepad;
    if (!!('ontouchstart' in window) ? 1 : 0) {
      gamepadUI = new Sprite(0, this.height * .85, this.width, this.height * .15, Globals.Loader.getAsset('gamepad'));
      return this.sprites.push(gamepadUI);
    }
  };

  NickVsBus.prototype.start = function() {
    var _this = this;
    document.getElementById('ui2').style.display = 'none';
    document.getElementById('ui').style.display = 'none';
    this.refreshSprites();
    this.time = 15;
    this.score = 0;
    this.world.enemies = {};
    this.world.foamEnemies = {};
    this.displayMsg = null;
    this.freezeGame = false;
    this.world.p1.stop = false;
    this.world.p1.x = this.width / 2 - this.world.p1.width / 2;
    this.world.p1.y = this.height - this.world.p1.height;
    if (this.world.p1.curDir === 'Down') this.world.p1.toggleDirection();
    this.timeInterval = setInterval(function() {
      if (_this.time === 1) {
        _this.time--;
        return _this.handleWin();
      } else {
        return _this.time--;
      }
    }, 1000);
    Enemy.fetchCanvases();
    this.interval = 2500;
    this.loadEnemy(0);
    this.loadEnemy(1);
    this.loadEnemy(2);
    this.loadEnemy(3);
    return this.loadFoamEnemy('top');
  };

  NickVsBus.prototype.handleMouseDown = function(e) {
    if (this.freezeGame) {
      this.start();
      return this.world.lastStep = false;
    }
  };

  NickVsBus.prototype.loadFoamEnemy = function(dir) {
    var enemy, id;
    enemy = new FoamEnemy(dir);
    id = (this.sprites.push(enemy)) - 1;
    this.sprites[id].id = id;
    return this.world.foamEnemies[id] = enemy;
  };

  NickVsBus.prototype.loadEnemy = function(lane) {
    var enemy, id, _this;
    if (!this.freezeGame) {
      enemy = new Enemy(lane);
      id = (this.sprites.push(enemy)) - 1;
      this.sprites[id].id = id;
      this.world.enemies[id] = enemy;
      _this = this;
      return this.loadingEnemy[lane] = setTimeout(function() {
        return _this.loadEnemy(lane);
      }, (0.8 + 0.4 * Math.random()) * (10 * this.width / this.enemyVel));
    }
  };

  NickVsBus.prototype.showMessage = function(msg) {
    var msgObj, textInterval;
    if (window.innerWidth < 450) return;
    msgObj = new Message(msg, this.world.p1.x, this.world.p1.y);
    this.sprites.push(msgObj);
    return textInterval = setInterval(function() {
      if (msgObj.opacity > 0.005) {
        msgObj.opacity -= 0.005;
        return msgObj.fontSize += 0.2;
      } else {
        msgObj.remove = true;
        return clearInterval(textInterval);
      }
    }, 10);
  };

  /*
  	
  	# Set a minimum for it
  	if @interval - @intervalStep >= 1000 && @interval > 1000
  		@interval -= @intervalStep
  		@intervalStep += @intervalIncrease
  	else if @interval > 1000
  		@interval = 1000
  	else if @interval > 500
  		@interval -= 7
  */

  NickVsBus.prototype.inputChanged = function() {
    var changed, currState, input, key, val, _ref;
    input = Globals.Input;
    changed = false;
    _ref = this.keyState;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      currState = input[key](0);
      if (val !== currState) {
        if (!changed) changed = {};
        changed[key] = currState;
        this.keyState[key] = currState;
      }
    }
    return changed;
  };

  NickVsBus.prototype.pause = function() {
    this.freezeGame = true;
    return this.displayMsg = "Paused. Click to resume";
  };

  NickVsBus.prototype.draw = function() {
    var i, msg, msgs, offset, sprite, _i, _j, _len, _len2, _ref, _results;
    this.ctx.clearRect(0, 0, this.width, this.height);
    _ref = this.sprites;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      sprite = _ref[i];
      if (sprite && !sprite.remove) sprite.draw(this.ctx);
    }
    this.ctx.font = 'bold 18px ' + Constants.MSG_FONT;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'left';
    msg = "Score: " + this.score;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "rgba( 0, 0, 0, 0.8 )";
    this.ctx.fillText(msg, 15, 25);
    if (window.innerWidth > 500 && false) this.ctx.strokeText(msg, 15, 25);
    this.ctx.textAlign = 'right';
    msg = "Time: " + this.time;
    this.ctx.fillText(msg, this.width - 15, 25);
    if (window.innerWidth > 500 && false) {
      this.ctx.strokeText(msg, this.width - 15, 25);
    }
    if (this.displayMsg) {
      this.ctx.font = 'bold ' + (36 * Globals.sizeRatio) + 'px ' + Constants.MSG_FONT;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "rgba( 0, 0, 0, 0.8 )";
      this.ctx.textAlign = 'center';
      this.ctx.fillText("Nick VS. Bus", this.width / 2 - 20, this.height * .33);
      if (window.innerWidth > 500 && false) {
        this.ctx.strokeText("Nick VS. Bus", this.width / 2 - 20, this.height * .33);
      }
      this.ctx.fillStyle = '#ffffff';
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeStyle = "rgba( 0, 0, 0, 0.8 )";
      this.ctx.textAlign = 'center';
      msgs = this.displayMsg.split("\n");
      if (msgs.length > 0) {
        _results = [];
        for (i = _j = 0, _len2 = msgs.length; _j < _len2; i = ++_j) {
          msg = msgs[i];
          if (i >= 5) {
            offset = this.height * .08;
          } else {
            offset = 5;
          }
          this.ctx.font = 'bold ' + (12 * Globals.sizeRatio) + 'px ' + Constants.MSG_FONT;
          this.ctx.fillText(msg, this.width / 2 - 20, this.height * .33 + offset + i * 14 * Globals.sizeRatio);
          if (window.innerWidth > 500 && false) {
            _results.push(this.ctx.strokeText(msg, this.width / 2 - 20, this.height * .33 + offset + i * 14 * Globals.sizeRatio));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  };

  NickVsBus.prototype.incrementScore = function(score) {
    if (score == null) score = 1;
    this.score += score;
    return this.showMessage("+" + score);
  };

  NickVsBus.prototype.handleWin = function(winner) {
    var about, container, leaderboard, p1, p2, p3, post, posted, show, text,
      _this = this;
    if (!this.freezeGame) {
      this.freezeGame = true;
      this.world.reset();
      this.displayMsg = "\nGame over!\nClick to play again";
      container = document.getElementById('content');
      container.innerHTML = '';
      leaderboard = new Clay.Leaderboard({
        id: 14,
        showPersonal: true,
        filters: ['all', 'month', 'day', 'hour'],
        tabs: [
          {
            id: 14,
            title: 'Cumulative',
            cumulative: true,
            showPersonal: true,
            filters: ['all', 'month', 'day', 'hour']
          }, {
            id: 14,
            title: 'Personal Best',
            self: true,
            filters: ['all', 'month', 'day', 'hour']
          }
        ]
      });
      p1 = document.createElement('p');
      post = document.createElement('a');
      post.href = 'javascript: void( 0 );';
      text = document.createTextNode('Post My High Score');
      post.appendChild(text);
      posted = false;
      post.onclick = function() {
        if (!posted) {
          leaderboard.post({
            score: _this.score
          }, function() {
            return leaderboard.show({
              html: "<a href='javascript: void( 0 );' onclick='facebook(" + _this.score + ");'>Post to Facebook</a> or <a href='javascript: void( 0 );' onclick='tweet(" + _this.score + ");'>Post to Twitter</a>"
            });
          });
          return posted = true;
        }
      };
      p1.appendChild(post);
      p2 = document.createElement('p');
      show = document.createElement('a');
      show.href = 'javascript: void( 0 );';
      text = document.createTextNode('View High Scores');
      show.appendChild(text);
      show.onclick = function() {
        return leaderboard.show();
      };
      p2.appendChild(show);
      p3 = document.createElement('p');
      about = document.createElement('a');
      about.href = 'javascript: void( 0 );';
      text = document.createTextNode('About the Developer');
      about.appendChild(text);
      about.onclick = function() {
        var ele, ui;
        ele = document.getElementById('ui-content');
        ele.innerHTML = "<p>My name is Austin Hallock, I'm a CS major at the University of Texas. I'm also co-founder of this site, <a href='http://clay.io' target='_BLANK'>Clay.io</a>, which is a hub for games that are playable in a browser <em>and</em> on your phone. I like making games :)</p><p>Twitter: <a href='http://twitter.com/austinhallock' target='_BLANK'>@austinhallock</a></p>";
        ele.style.display = 'block';
        ui = document.getElementById('ui');
        ui.setAttribute('style', 'display: block !important');
        return Clay.Stats.logStat({
          name: 'aboutClick',
          quantity: 1
        });
      };
      p3.appendChild(about);
      container.appendChild(p1);
      container.appendChild(p2);
      container.appendChild(p3);
      document.getElementById('ui2').style.display = 'block';
      if (this.score > 5000) {
        (new Clay.Achievement({
          id: 75
        })).award();
      }
      if (this.score > 10000) {
        (new Clay.Achievement({
          id: 76
        })).award();
      }
      if (this.score > 20000) {
        (new Clay.Achievement({
          id: 77
        })).award();
      }
      if (this.score > 50000) {
        (new Clay.Achievement({
          id: 78
        })).award();
      }
      if (this.score > 100000) {
        (new Clay.Achievement({
          id: 79
        })).award();
      }
      if (this.score > 150000) {
        return (new Clay.Achievement({
          id: 80
        })).award();
      }
    }
  };

  NickVsBus.prototype.step = function(timestamp) {
    this.next();
    if (this.freezeGame) return this.draw();
    this.world.step();
    return this.draw();
  };

  NickVsBus.prototype.buttonPressed = function(e) {
    return Globals.Manager.popScene();
  };

  return NickVsBus;

})(Scene);

var InputSnapshot,
  __hasProp = Object.prototype.hasOwnProperty;

InputSnapshot = (function() {

  InputSnapshot.name = 'InputSnapshot';

  function InputSnapshot() {
    this.states = [
      {
        left: false,
        right: false,
        up: false
      }
    ];
  }

  InputSnapshot.prototype.get = function(name, player) {
    return this.states[player][name];
  };

  InputSnapshot.prototype.getState = function(player) {
    var key, state, val, _ref;
    state = {};
    _ref = this.states[player];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      state[key] = val;
    }
    return state;
  };

  InputSnapshot.prototype.setState = function(newStates, player) {
    var key, val, _results;
    _results = [];
    for (key in newStates) {
      if (!__hasProp.call(newStates, key)) continue;
      val = newStates[key];
      _results.push(this.states[player][key] = newStates[key]);
    }
    return _results;
  };

  InputSnapshot.prototype.left = function(player) {
    return this.states[player]['left'];
  };

  InputSnapshot.prototype.right = function(player) {
    return this.states[player]['right'];
  };

  InputSnapshot.prototype.up = function(player) {
    return this.states[player]['up'];
  };

  return InputSnapshot;

})();

if (module) module.exports = InputSnapshot;

var getWindowSize;

window.addEventListener('load', function() {
  var resize, start;
  resize = function() {
    var bg, canvas, ctx, ele, height, pixelRatio, pxRatio, width, windowSize;
    pixelRatio = window.devicePixelRatio || 1;
    canvas = document.getElementById('canvas');
    windowSize = getWindowSize();
    width = windowSize.width;
    height = windowSize.height;
    pxRatio = window.devicePixelRatio || 1;
    if (width / 1.79 < height) {
      canvas.width = width * pxRatio;
      canvas.height = Math.floor(width / 1.79) * pxRatio;
      canvas.style.width = width;
      canvas.style.height = Math.floor(width / 1.79);
    } else {
      canvas.width = Math.floor(height * 1.79) * pxRatio;
      canvas.height = height * pxRatio;
      canvas.style.width = Math.floor(height * 1.79);
      canvas.style.height = height;
      ele = document.getElementById('center');
      if (ele) ele.style.width = Math.floor(height * 1.79) + 'px';
    }
    Globals.windowSize = {
      width: canvas.width,
      height: canvas.height
    };
    Globals.sizeRatio = canvas.width / 800;
    if (Globals.scene) {
      Globals.scene.width = Globals.windowSize.width;
      Globals.scene.height = Globals.windowSize.height;
      Globals.scene.world = new World(Globals.windowSize.width, Globals.windowSize.height, Globals.Input);
      bg = document.createElement('canvas');
      ctx = bg.getContext('2d');
      ctx.fillStyle = '#ccc';
      ctx.fillRect(0, 0, Globals.windowSize.width, Globals.windowSize.height);
      Globals.scene.bg = new StretchySprite(0, 0, Globals.windowSize.width, Globals.windowSize.height, 200, 1, bg);
      return Globals.scene.refreshSprites();
    }
  };
  window.onresize = resize;
  start = function() {
    var loadingScene;
    resize();
    Globals.Manager.canvas = canvas;
    Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d');
    Globals.Input = new Input();
    loadingScene = new LoadingScene();
    Globals.Manager.pushScene(loadingScene);
    return loadingScene.start();
  };
  /*
  	# Make the page taller so it scroll on mobile (first load)
  	if (document.body.clientHeight - 100) < window.innerHeight
  		pageFill = document.createElement("div")
  		pageFill.style.height = (window.innerHeight - document.body.clientHeight + 100) + "px"
  		document.getElementsByTagName("body")[0].appendChild pageFill
  	
  	doScrollTop = setInterval(->
  		if document.body and not ((pageYOffset or document.body.scrollTop) > 20)
  			clearInterval doScrollTop
  			scrollTo 0, 1
  			pageYOffset = 0
  			scrollTo 0, (if (pageYOffset is document.body.scrollTop) then 1 else 0)
  	, 200)
  */
  return start();
});

window.addEventListener('keypress', function(e) {
  var evt;
  evt = e || window.event;
  if (evt.keyCode === 83 || evt.keyCode === 115) {
    if (Globals.scene) Globals.scene.pause();
    return new Clay.Screenshot();
  }
});

this.facebook = function(score) {
  return (new Clay.Facebook()).post({
    message: "I just scored " + score + " in Nick vs. Bus!",
    link: "http://nickvsbus.clay.io"
  });
};

this.tweet = function(score) {
  return (new Clay.Twitter()).post({
    message: "I just scored " + score + " in Nick vs. Bus! See if you can beat that: http://nickvsbus.clay.io"
  });
};

getWindowSize = function() {
  var myHeight, myWidth;
  myWidth = 0;
  myHeight = 0;
  if (typeof window.innerWidth === "number") {
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }
  return {
    height: myHeight,
    width: myWidth
  };
};
