# NickVsBus is the main class containing init() and step()
class NickVsBus extends Scene
	# will be called when load complete
	init: (dontOverrideInput) ->
		# create physics simulation
		if Globals.windowSize && Globals.windowSize.width
			@width = Globals.windowSize.width
			@height = Globals.windowSize.height
		else
			@width = 800
			@height = 447

		@world ||= new World(@width, @height, Globals.Input)

		loader =	Globals.Loader
		
		bg = document.createElement( 'canvas' )
		ctx = bg.getContext('2d')
		ctx.fillStyle = '#ccc'
		ctx.fillRect( 0, 0, @width, @height )
		
		@bg = new StretchySprite(0, 0, @width, @height, 200, 1, bg) # bg img hacked in loader.coffee
		
		@freezeGame = true
		@initialLoad = true
		
		@refreshSprites()
		
		@loadingEnemy = {}
		
		@world.reset()
		
		@last = 0
		@time = 15	
		@score = 0
				
		@displayMsg = "\n Instructions:"
		@displayMsg += "\n Cross road back and forth, knock out foam sword foes"
		@displayMsg += "\n Use arrow keys to move"
		@displayMsg += "\n Getting hit by a green or white bus will kill you"
		@displayMsg += "\n Purple buses don't do damage, because you're Nick"
		@displayMsg += "\n ... and you're pretty much invincible"
		@displayMsg += "\n You have 15 seconds each time to cross the road"
		@displayMsg += "\n\nClick anywhere to start"
		
		
		@keyState = {
			left: false
			right: false
			up: false
		}
		unless dontOverrideInput
			@world.handleInput = => # override handleInput
				@world.p1.handleInput(Globals.Input)
		super()
		
		canvas = Globals.Manager.canvas
		_this = @
		canvas.addEventListener 'click', ->
			_this.handleMouseDown()
		, true 
		canvas.addEventListener 'touchstart',	->
			_this.handleMouseDown()
		, true

	refreshSprites: ->
		@sprites = []
		@sprites.push(@bg, @world.road, @world.bushes, @world.building1, @world.building2, @world.p1) 
		# store on-screen button rects
		gamepad = new GamePad
			left: [ 0, @height-Constants.BOTTOM, @width / 4, Constants.BOTTOM ],
			right: [ @width / 4, @height-Constants.BOTTOM, @width / 4, Constants.BOTTOM ],
			up: [ 2 * @width / 4, @height-Constants.BOTTOM, @width / 4, Constants.BOTTOM ],
			down: [ 3 * @width / 4, @height-Constants.BOTTOM, @width / 4, Constants.BOTTOM ]
		@buttons['gamepad'] = gamepad # so that gamepad will receive our input
		
		if `!!('ontouchstart' in window) ? 1 : 0` # touch screen devices, show the gamepad UI
			gamepadUI = new Sprite( 0, @height * .85, @width, @height * .15, Globals.Loader.getAsset( 'gamepad' ) )
			@sprites.push gamepadUI

	start: ->
		document.getElementById( 'ui2' ).style.display = 'none'
		document.getElementById( 'ui' ).style.display = 'none'
		@refreshSprites()
			
		@time = 15
		@score = 0
		@world.enemies = {}
		@world.foamEnemies = {}
		@displayMsg = null # displayMsg is drawn in the center of the screen unless null
		@freezeGame = false
		
		@world.p1.stop = false
		@world.p1.x = @width/2-@world.p1.width/2
		@world.p1.y = @height - @world.p1.height
		@world.p1.toggleDirection() if @world.p1.curDir == 'Down'
		
		@timeInterval = setInterval =>
			if @time == 1
				@time--
				@handleWin()
			else
				@time--
		, 1000
		
		Enemy.fetchCanvases()
		
		# How often enemies are loaded in (uses random 80% - 120% of this #)
		@interval = 2500
		#@intervalStep = 10
		# number in with the -= increases by
		#@intervalIncrease = 5
		@loadEnemy(0)
		@loadEnemy(1)
		@loadEnemy(2)
		@loadEnemy(3)
		
		
		@loadFoamEnemy( 'top' )

	handleMouseDown: (e) ->
		if @freezeGame
			@start()
			@world.lastStep = false 

	loadFoamEnemy: ( dir ) ->
		# FoamEnemy.fetchCanvas()
		enemy = new FoamEnemy( dir )
		id = ( @sprites.push enemy ) - 1
		@sprites[id].id = id
		@world.foamEnemies[id] = enemy
	
	loadEnemy: (lane) ->
		if !@freezeGame
			enemy = new Enemy( lane )
			id = ( @sprites.push enemy ) - 1
			@sprites[id].id = id
			@world.enemies[id] = enemy
			
			_this = @
			@loadingEnemy[lane] = setTimeout ->
				_this.loadEnemy( lane )
			, ( 0.8 + 0.4 * Math.random() ) * ( 10 * @width / @enemyVel )
			

	showMessage: (msg) ->
		if window.innerWidth < 450 # don't need these on mobile phones
			return
		# return if fd.dt > 70 # low fps
		msgObj = new Message( msg, @world.p1.x, @world.p1.y )
		@sprites.push ( msgObj )
		
		textInterval = setInterval(->
			if msgObj.opacity > 0.005
				msgObj.opacity -= 0.005
				msgObj.fontSize += 0.2
			else
				msgObj.remove = true
				clearInterval textInterval
		, 10)

			
	###
	
	# Set a minimum for it
	if @interval - @intervalStep >= 1000 && @interval > 1000
		@interval -= @intervalStep
		@intervalStep += @intervalIncrease
	else if @interval > 1000
		@interval = 1000
	else if @interval > 500
		@interval -= 7
	###

	inputChanged: -> # returns whether input has been received since last check
		input = Globals.Input
		changed = false
		for own key, val of @keyState
			currState = input[key](0) # pass 0 to signify 'p1'
			if val != currState
				changed = {} unless changed
				changed[key] = currState
				@keyState[key] = currState # save change to keyState
		changed
		
	pause: ->
		@freezeGame = true
		@displayMsg = "Paused. Click to resume"
	
	draw: ->
		# draw everything!
		@ctx.clearRect(0, 0, @width, @height) 
		for sprite, i in @sprites
			sprite.draw(@ctx) if sprite && !sprite.remove
							
		@ctx.font = 'bold 18px '+ Constants.MSG_FONT
		@ctx.fillStyle = '#ffffff'
		@ctx.textAlign = 'left'
		msg = "Score: " + @score
		@ctx.lineWidth = 1
		@ctx.strokeStyle = "rgba( 0, 0, 0, 0.8 )"
		@ctx.fillText(msg, 15, 25)
		if window.innerWidth > 500 && false
			@ctx.strokeText(msg, 15, 25)
		
		@ctx.textAlign = 'right'
		###
		time = new Date().getTime()
		@zzz = (time-@last) if !( time % 10 )
		if !@zzz
			@zzz = 0
		###
		msg = "Time: " + @time
		@ctx.fillText(msg, @width - 15, 25)
		if window.innerWidth > 500 && false
			@ctx.strokeText(msg, @width - 15, 25)
		#@last = time

		# draw displayMsg, if any
		if @displayMsg			
			@ctx.font = 'bold ' + ( 36 * Globals.sizeRatio ) + 'px '+ Constants.MSG_FONT
			@ctx.fillStyle = '#ffffff'
			@ctx.lineWidth = 1;
			@ctx.strokeStyle = "rgba( 0, 0, 0, 0.8 )"
			@ctx.textAlign = 'center'
			@ctx.fillText("Nick VS. Bus", @width/2 - 20, @height * .33)
			if window.innerWidth > 500 && false
				@ctx.strokeText("Nick VS. Bus", @width/2 - 20, @height * .33)

	
			@ctx.fillStyle = '#ffffff'
			@ctx.lineWidth = 0.5;
			@ctx.strokeStyle = "rgba( 0, 0, 0, 0.8 )"
			@ctx.textAlign = 'center'
			msgs = @displayMsg.split("\n")
			if msgs.length > 0 # draw sub text
				for msg, i in msgs
					if i >= 5 # avoid yellow line
						offset = @height * .08
					else
						offset = 5
						
					@ctx.font = 'bold ' + ( 12 * Globals.sizeRatio ) + 'px ' + Constants.MSG_FONT
					@ctx.fillText(msg, @width/2 - 20, @height * .33 + offset + i * 14 * Globals.sizeRatio)
					if window.innerWidth > 500 && false
						@ctx.strokeText(msg, @width/2 - 20, @height * .33 + offset + i * 14 * Globals.sizeRatio)

	incrementScore: (score = 1) ->
		@score += score
		@showMessage "+" + score

	handleWin: (winner) ->
		if !@freezeGame
			@freezeGame = true
			
			@world.reset()
			
			@displayMsg = "\nGame over!\nClick to play again"
			
			container = document.getElementById( 'content' )
			
			container.innerHTML = ''
			
			leaderboard = ( new Clay.Leaderboard( { id: 14, showPersonal: true, filters: ['all', 'month', 'day', 'hour'], tabs: [
				{ id: 14, title: 'Cumulative', cumulative: true, showPersonal: true, filters: ['all', 'month', 'day', 'hour'] },
				{ id: 14, title: 'Personal Best', self: true, filters: ['all', 'month', 'day', 'hour'] }
			] } ) )
			
			p1 = document.createElement 'p'
			post = document.createElement 'a'
			post.href = 'javascript: void( 0 );'
			text = document.createTextNode 'Post My High Score'
			post.appendChild text
			posted = false
			post.onclick = =>
				if !posted
					leaderboard.post( { score: @score }, =>
						leaderboard.show( { html: "<a href='javascript: void( 0 );' onclick='facebook(" + @score + ");'>Post to Facebook</a> or <a href='javascript: void( 0 );' onclick='tweet(" + @score + ");'>Post to Twitter</a>" } )	
					)
					posted = true
			p1.appendChild post
				
			p2 = document.createElement 'p'
			show = document.createElement 'a'
			show.href = 'javascript: void( 0 );'
			text = document.createTextNode 'View High Scores'
			show.appendChild text
			show.onclick = =>
				leaderboard.show()
			p2.appendChild show
			
			p3 = document.createElement 'p'
			about = document.createElement 'a'
			about.href = 'javascript: void( 0 );'
			text = document.createTextNode 'About the Developer'
			about.appendChild text
			about.onclick = =>
				ele = document.getElementById( 'ui-content' )
				ele.innerHTML = "<p>My name is Austin Hallock, I'm a CS major at the University of Texas. I'm also co-founder of this site, <a href='http://clay.io' target='_BLANK'>Clay.io</a>, which is a hub for games that are playable in a browser <em>and</em> on your phone. I like making games :)</p><p>Twitter: <a href='http://twitter.com/austinhallock' target='_BLANK'>@austinhallock</a></p>"
				ele.style.display = 'block'
				ui = document.getElementById( 'ui' )
				ui.setAttribute('style', 'display: block !important');
				Clay.Stats.logStat { name: 'aboutClick', quantity: 1 }

			p3.appendChild about
			
				
			container.appendChild p1
			container.appendChild p2
			container.appendChild p3
			
			document.getElementById( 'ui2' ).style.display = 'block'
			

			# Clay achievement - > 25
			if @score > 5000
				( new Clay.Achievement( { id: 75 } ) ).award()
			if @score > 10000
				( new Clay.Achievement( { id: 76 } ) ).award()
			if @score > 20000
				( new Clay.Achievement( { id: 77 } ) ).award()
			if @score > 50000
				( new Clay.Achievement( { id: 78 } ) ).award()
			if @score > 100000
				( new Clay.Achievement( { id: 79 } ) ).award()
			if @score > 150000
				( new Clay.Achievement( { id: 80 } ) ).award()

	# main "loop" iteration
	step: (timestamp) ->
		this.next() # constantly demand ~60fps
		return this.draw() if @freezeGame # don't change anything!
		# apply input and then step
		@world.step() # step physics
		# this.handleWin(winner)
		this.draw()
	
	buttonPressed: (e) -> # menu pressed, end game and pop
		Globals.Manager.popScene()
		
