if module
	Sprite = require('./sprite')
	Constants = require('./constants')

class Enemy extends Sprite
	@enemies = ['purple', 'green', 'white']
	@colors = ['#6A0475', '#048C0D', '#eee']

	@canvases = []
	
	@width = 0
	@height = 0
	
	@fetchCanvases: ->
		Enemy.width = 170 * 1 * Globals.sizeRatio
		Enemy.height = 30 * 1 * Globals.sizeRatio
		for foe, i in Enemy.enemies
			canv1 = document.createElement( 'canvas' )
			ctx = canv1.getContext('2d')
			canv1.width = Enemy.width
			canv1.height = Enemy.height
			ctx.fillStyle = Enemy.colors[i]
			ctx.fillRect( 0, 0, Enemy.width, Enemy.height )
			ctx.drawImage( Globals.Loader.getAsset('bus'), 0, 0, Enemy.width, Enemy.height )
			
			### flipped buses
			canv2 = document.createElement( 'canvas' )
			ctx = canv2.getContext('2d')
			canv2.width = Enemy.width
			canv2.height = Enemy.height
			ctx.fillStyle = Enemy.colors[i]
			ctx.rotate( 0.5 )
			ctx.translate(canv2.width / 2, canv2.height / 2)
			ctx.fillRect( 0, 0, Enemy.width, Enemy.height )
			ctx.drawImage( Globals.Loader.getAsset('bus'), 0, 0, Enemy.width, Enemy.height )
			###
			Enemy.canvases.push canv1
			#Enemy.canvases.push canv2

	constructor: (lane) ->		
		direction = if lane <= 1 then 1 else 0
		#direction = Math.round( Math.random() ) # 0 - left, 1 - right
		#lane = Math.floor( 2 * Math.random() ) # 0, 1 (in the correct direction)
		
		# offset from where road starts
		offsetY = ( Globals.scene.height - Globals.scene.world.road.height ) / 2 + ( Globals.scene.world.road.height / 8 ) - Enemy.height / 2
		
		# determine which lane it's in, and which direction it's coming from
		@x = direction * Globals.scene.width
		@y = offsetY + lane * ( Globals.scene.world.road.height / 4 )
		
		#enemyInt = ( 1 + Math.floor( Math.random() * 3 ) ) * 2 - 2
		#if !direction
		#	enemyInt += 1
		enemyInt = Math.floor( Math.random() * 3 )
		@enemy = Enemy.enemies[ enemyInt ]
		
		@alive = true
		
		if direction == 0 # from left side, offset by length
			@x -= Enemy.width
		
		@originalWidth = Enemy.width
		@originalHeight = Enemy.height
		
		@bg = Enemy.canvases[enemyInt]
		
		@mass = Constants.BALL_MASS
		super(@x, @y, Enemy.width, Enemy.height, @bg)
		
		###
		# aim at player sin theta = op / hyp
		dx = ( @x + @width / 2 ) - ( target.x + target.width / 2 )
		dy = ( @y + @height / 2 ) -  ( target.y + target.height / 2 )
		theta = Math.atan2( dy, dx )
		
		dirX = -Math.cos theta
		dirY = -Math.sin theta
		###
		@dirX = if direction then -1 * Globals.sizeRatio else Globals.sizeRatio
		# dirY = 0
				
		@velocity.x = Globals.scene.enemyVel * @dirX
		# @velocity.y = Globals.scene.enemyVel * dirY
	incrementPosition: (numFrames) ->
		@velocity.x = Globals.scene.enemyVel * @dirX
		super(numFrames)
		# Check for collisions with the player
		player = Globals.scene.world.p1
		topRight1 = ( @right > player.left && @right < player.right && @top < player.bottom && @top > player.top )
		topRight2 = ( player.right > @left && player.right < @right && player.top < @bottom && player.top > @top )
		topRight = topRight1 || topRight2
		topLeft1 = ( @left < player.right && @left > player.left && @top < player.bottom && @top > player.top )
		topLeft2 = ( player.left < @right && player.left > @left && player.top < @bottom && player.top > @top )
		topLeft = topLeft1 || topLeft2
		bottomRight1 = ( @right > player.left && @right < player.right && @bottom > player.top && @bottom < player.bottom )
		bottomRight2 = ( player.right > @left && player.right < @right && player.bottom > @top && player.bottom < @bottom )
		bottomRight = bottomRight1 || bottomRight2
		bottomLeft1 = ( @left < player.right && @left > player.left && @bottom > player.top && @bottom < player.bottom )
		bottomLeft2 = ( player.left < @right && player.left > @left && player.bottom > @top && player.bottom < @bottom )
		bottomLeft = bottomLeft1 || bottomLeft2

		if ( topRight || topLeft || bottomRight || bottomLeft )
			if @enemy == 'purple' && @alive # purple buses are no match for nick
				@implode()
				Globals.scene.showMessage "SAFE..."
			else if @alive
				Globals.scene.showMessage "OUCH..."
				@stop = true
				Globals.scene.world.p1.stop = true
				setTimeout ->
					Globals.scene.handleWin()
				, 1800
			@alive = false

		if( @left > Globals.scene.width + 5 || @right < -5 )
			@remove = true

		###
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
		###
	implode: ->
		if @width < 0.1 * @originalWidth
			delete Globals.scene.sprites[@id]
			delete Globals.scene.world.enemies[@id]
		else 
			@x += @width * .05
			@y += @height * .05
			@width *= .9
			@height *= .9
			_this = @
			setTimeout ->
				_this.implode()
			, 10
		
module.exports = Enemy if module