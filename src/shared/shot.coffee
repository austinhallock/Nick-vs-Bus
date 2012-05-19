if module
	Sprite = require('./sprite')
	Constants = require('./constants')

class Shot extends Sprite
	constructor: (@x, @y) ->
		@radius = Constants.BALL_RADIUS
		@bg = Globals.Loader.getAsset('ball') if typeof Globals != 'undefined'
		@mass = Constants.BALL_MASS
		
		@locked = true
		
		width = Constants.SHOT_WIDTH * Constants.LOGO_SCALE * Globals.sizeRatio * Constants.TECHSTARS_RELATIVE
		height = Constants.SHOT_HEIGHT * Constants.LOGO_SCALE * Globals.sizeRatio * Constants.TECHSTARS_RELATIVE
		@x -= width / 2
		@y -= height / 2
		super(@x, @y, width, height, @bg)
	shoot: ->
		@locked = false
		playerRot = Globals.scene.world.p1.rot
		dirX = Math.cos playerRot - 3.14 / 2
		dirY = Math.sin playerRot - 3.14 / 2
		@velocity.x = Constants.SHOT_VEL * dirX
		@velocity.y = Constants.SHOT_VEL * dirY
		@rot = playerRot
	incrementPosition: (numFrames) ->
		super(numFrames)
		
		# Remove obj if off screen
		if @id && ( @x < 0 || @y < 0 || @x > Globals.scene.world.width || @y > Globals.scene.world.width )
			delete Globals.scene.sprites[@id]
			delete Globals.scene.world.shots[@id]
	# draw based on the logo as tranlation
	draw: (ctx, x, y) ->
		if @locked
			x ||= Globals.scene.world.p1.x
			y ||= Globals.scene.world.p1.y
			ctx.save() # save current state
			tx = x + Globals.scene.world.p1.width / 2
			ty = y + Globals.scene.world.p1.height / 2
			ctx.translate(tx, ty)
			ctx.rotate(Globals.scene.world.p1.rot) # rotate
			ctx.translate(-tx, -ty)
			ctx.drawImage(@bg, tx - @width / 2, ty - @height / 2 - Globals.scene.world.p1.height * .28, @width, @height) if @bg
			ctx.restore()
			@x = tx
			@y = ty
		else
			super( ctx, x, y )
module.exports = Shot if module