Constants = require('./constants') if module

# Sprite class - a base class for anything that exists in a World
class Sprite
	constructor: (@x, @y, @width, @height, @bg, @id = false) ->
		@velocity ||= { x: 0, y: 0 }
		@rot = 0
		@rotVel = 0
		@acceleration ||= { x: 0, y: Constants.GRAVITY }
		@mass ||= 1.0
		
		@stop = false
		
		@left = @x
		@right = @x + @width
		@top = @y
		@bottom = @top + @y
		
		@remove = false # set to true to remove from sprites list

	setPosition: (x, y) -> 
		if !y # enable passing associative array e.g. {x:1,y:2}
			y = x['y'] if x['y']
			x = x['x'] if x['x']
		@x = x
		@y = y

	incrementPosition: (numFrames) ->
		return if @stop
		@x += @velocity.x*numFrames
		@y += @velocity.y*numFrames
		
		@rot += @rotVel*numFrames
		@velocity.x += @acceleration.x * @mass * numFrames * numFrames
		
		@left = @x
		@right = @left + @width
		@top = @y
		@bottom = @top + @height 
	draw: (ctx, x, y) -> 
		x ||= @x
		y ||= @y
		# For objs that rotate
		if @rot != 0
			ctx.save() # save current state
			tx = x + @width / 2
			ty = y + @height / 2
			ctx.translate(tx, ty)
			ctx.rotate(@rot) # rotate
			ctx.translate(-tx, -ty)
			ctx.drawImage(@bg, x, y, @width, @height) if @bg
			ctx.restore()
		else
			ctx.drawImage(@bg, x, y, @width, @height) if @bg			

	getState: ->
		x: @x
		y: @y
		width: @width
		height: @height
		velocity:
			x: @velocity.x
			y: @velocity.y

	setState: (objState) ->
		return if !objState
		@x = objState.x
		@y = objState.y
		@width = objState.width
		@height = objState.height
		@velocity =
			x: objState.velocity.x
			y: objState.velocity.y
		
module.exports = Sprite if module