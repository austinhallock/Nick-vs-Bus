if module
	Sprite = require('./sprite')
	Constants = require('./constants')

class Message extends Sprite
	constructor: (@msg, @x, @y) ->
		@opacity = 0.5
		@fontSize = 14
	draw: (@ctx) ->
		@ctx.font = 'bold ' + @fontSize + 'px ' + Constants.MSG_FONT
		@ctx.fillStyle = 'rgba( 255, 255, 255, ' + @opacity + ')'
		@ctx.textAlign = 'left'
		msg = "Score: " + @score
		@ctx.lineWidth = 1
		@ctx.strokeStyle = "rgba( 0, 0, 0, 0.8 )"
		@ctx.fillText(@msg, @x, @y)
		@ctx.strokeText(@msg, @x, @y)

		super( @ctx )
		
module.exports = Message if module