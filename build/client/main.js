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
