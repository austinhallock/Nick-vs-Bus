if module
	Sprite = require('./sprite') 
	Constants = require('./constants')

class Player extends Sprite
	constructor: (@x, @y, @isP2) ->
		@score = 0
		
		# draw the player
		@width = Globals.sizeRatio * 30 * .6
		@height = Globals.sizeRatio * 70 * .6
		
		@curDir = 'Up'
		@offset = @height / 2 # for foam sword, don't want on collisions
		
		###
		@bg = document.createElement( 'canvas' )
		ctx = @bg.getContext('2d')
		ctx.fillStyle = '#361B09'
		ctx.fillRect( 1, @height / 2 + 1, @width - 1, @height / 2 - 1)
		ctx.fillStyle = '#fff'
		ctx.strokeRect( 0, @height / 2, @width, @height / 2 )
		ctx.fillStyle = '#fff' # swort
		ctx.fillRect( 0, 0, @width / 5, @height / 2 )
		###
		###
		canv = document.createElement( 'canvas' )
		ctx = canv.getContext( '2d' )
		ctx.drawImage Globals.Loader.getAsset( 'player' ), 0, 0, @width, @height # can't do this because of svg anim
		###

		super(@x, @y, @width, @height, Globals.Loader.getAsset( 'playerUp' ))

	handleInput: (input) ->
		# check for up, left, right
		pNum = 0
		if input.left(pNum) && @left > 0
			@velocity.x = -3 * Globals.sizeRatio
		else if input.right(pNum) && @right < Globals.scene.width
			@velocity.x = 3 * Globals.sizeRatio
		else
			@velocity.x = 0

		if input.up(pNum) && @top > 0
			@velocity.y = -3 * Globals.sizeRatio
		else if input.down(pNum) && @bottom < Globals.scene.height
			@velocity.y = 3 * Globals.sizeRatio
		else
			@velocity.y = 0
			
	# face the other way
	toggleDirection: ->
		dir = if @curDir == 'Up' then 'Down' else 'Up'
		@bg = Globals.Loader.getAsset( 'player' + dir )
		@curDir = dir
		@offset *= -1
			
	incrementPosition: (numFrames) ->		
		super(numFrames)
		#console.log @velocity.y
		if @curDir == 'Up'
			@top += @offset
		else
			@bottom += @offset
	draw: (ctx) ->
		# draw the player sprite
		super(ctx)

module.exports = Player if module