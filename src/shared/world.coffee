if module
	Constants = require('./constants')
	Helpers = require('./helpers')
	Sprite = require('./sprite')
	Player = require('./player')
	
class World
	constructor: (@width, @height, @input) ->
		# initialize game state variables
		@lastStep = null
		@clock = 0
		@shots = {}
		@enemies = {}
		@foamEnemies = {}
		# initialize game objects
		width = 50 * Globals.sizeRatio
		height = 50 * Globals.sizeRatio
		@p1 = new Player(@width/2-width/2, @height - height, false)
		
		rwidth = @width
		rheight = @height * .7
		# draw the road in a canvas
		# this caches and drastically improves the FPS on large svgs
		rbg = document.createElement( 'canvas' )
		rbg.height = rheight
		rbg.width = rwidth
		ctx = rbg.getContext('2d')
		ctx.drawImage( Globals.Loader.getAsset( 'road' ), 0, 0, rwidth, rheight )

		@road = new Sprite( 0, @height/2-rheight/2, rwidth, rheight, rbg )
		
		###
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
		###
		
		bwidth = @width * .2
		bheight = @width * .2
		bld = document.createElement( 'canvas' )
		bld.height = bheight
		bld.width = bwidth
		bctx = bld.getContext( '2d' )
		bctx.drawImage( Globals.Loader.getAsset( 'building' ), 0, 0, bwidth, bheight )
		@building1 = new Sprite( 50, @height * .88, bwidth, bheight, bld )
		@building2 = new Sprite( @width - bwidth - 50, @height * .88, bwidth, bheight, bld )
		
		bushes = document.createElement( 'canvas' )
		bushes.width = @width / 1.2
		bushes.height = @height * .1
		
		bctx = bushes.getContext( '2d' )
		bush = Globals.Loader.getAsset( 'bush' )
		for i in [0...10]
			bctx.drawImage( bush, i * bushes.width / 10, 0, bushes.height, bushes.height )
		bwidth = @width * .1
		bheight = @height * .1
		@bushes = new Sprite( 200, @height * .95 - bheight, bushes.width, bushes.height, bushes )
				
	reset: -> # called right when game ends
		main = Globals.scene
		
		main.enemyVel = 5 * Constants.ENEMY_VEL # bus speed, increases over time

		clearInterval main.timeInterval
		if main.loadingEnemy
			for i, interval of main.loadingEnemy
				clearTimeout interval
				delete main.loadingEnemy[i]

		@numFrames = 1

	# update positions via velocities, resolve collisions
	step: (interval, dontIncrementClock) ->
		# precalculate the number of frames (of length TICK_DURATION) this step spans
		now = new Date().getTime()
		tick = Constants.TICK_DURATION
		interval ||= now - @lastStep if @lastStep # && !@deterministic
		interval ||= tick # in case no interval is passed
		@lastStep = now unless dontIncrementClock
 
		# automatically break up longer steps into a series of shorter steps
		if interval >= 1.3 * tick && @deterministic
			while interval > 0
				newInterval = if interval >= 1.3 * tick then tick else interval
				this.step(newInterval, dontIncrementClock)
				interval -= newInterval
			return # don't continue stepping
		else if @deterministic
			interval = tick
		
		@numFrames = interval / tick

		@clock += interval

		@handleInput()
		
		for id, enemy of @enemies
			if enemy
				enemy.incrementPosition(@numFrames)
				
		for id, enemy of @foamEnemies
			if enemy
				enemy.incrementPosition(@numFrames)
	
		@p1.incrementPosition(@numFrames)
	
		###
		if now - @stateSaves.lastPush > Constants.STATE_SAVE # save current state every STATE_SAVE ms
			@stateSaves.lastPush = now
			@stateSaves.push # push a frame structure on to @stateSaves
				state: this.getState()
				input: null
		###


	handleInput: ->
		@p1.handleInput(@input)


	### -- GAME STATE GETTER + SETTERS -- ###
	getState: ->
		p1:   @p1.getState()
		clock: @clock
	setState: (state) ->
		@p1.setState(state.p1)
	getInput: ->
		p1: @input.getState(0)
	setInput: (newInput) ->
		return unless newInput
		@input.setState(newInput.p1, 0) if newInput.p1	
	setFrame: (frame) ->
		return unless frame
		this.setState(frame.state)
		this.setInput(frame.input)
	getFrame: -> # returns a frame with no input
		state: this.getState()
		input: this.getInput()


module.exports = World if module # in case we are using node.js