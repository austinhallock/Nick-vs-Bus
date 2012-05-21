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
