if module
	Sprite = require('./sprite')
	Constants = require('./constants')

class FoamEnemy extends Sprite
	### Not caching it since we want svg anim
	@canvas = document.createElement( 'canvas' )
	@fetchCanvas: ->
		FoamEnemy.canvas.width = Globals.scene.world.p1.width
		FoamEnemy.canvas.height = Globals.scene.world.p1.height
		
		FoamEnemy.ctx = FoamEnemy.canvas.getContext( '2d' )
		FoamEnemy.updateCanvas()
	@updateCanvas: ( dir = 'down' ) ->
		person = Globals.Loader.getAsset( if dir == 'down' then 'crowdDown' else 'crowdUp' )
		FoamEnemy.ctx.drawImage person, 0, 0, FoamEnemy.canvas.width, FoamEnemy.canvas.height
	###
	constructor: (@side = 'top') ->	
		direction = if side == 'top' then 1 else -1
		
		@alive = true
		
		@width ||= Globals.scene.world.p1.width
		@height ||= Globals.scene.world.p1.height
		
		# determine which lane it's in, and which direction it's coming from
		@x = Globals.scene.width / 4 + Math.random() * ( Globals.scene.width / 2 )
		@y = if side == 'top' then -1 * @height else Globals.scene.height
		
		@originalWidth = @width
		@originalHeight = @height
		
		@bg = Globals.Loader.getAsset( if side == 'top' then 'crowdDown' else 'crowdUp' ) #FoamEnemy.canvas
		
		super(@x, @y, @width, @height, @bg)
				
		# @velocity.x = Constants.ENEMY_VEL * dirX
		@velocity.y = Constants.ENEMY_VEL * direction * 1
	incrementPosition: (numFrames) ->
		super(numFrames)
		
		if ( ( @side == 'top' && @bottom > Globals.scene.height * 0.12 ) || ( @side == 'bottom' && @top < Globals.scene.height * .88 ) )
			@velocity.y = 0
		
		# Check for collisions with the player
		player = Globals.scene.world.p1
		topRight1 = ( @right >= player.left && @right <= player.right && @top <= player.bottom && @top >= player.top )
		topRight2 = ( player.right >= @left && player.right <= @right && player.top <= @bottom && player.top >= @top )
		topRight = topRight1 || topRight2
		topLeft1 = ( @left <= player.right && @left >= player.left && @top <= player.bottom && @top >= player.top )
		topLeft2 = ( player.left <= @right && player.left >= @left && player.top <= @bottom && player.top >= @top )
		topLeft = topLeft1 || topLeft2
		bottomRight1 = ( @right >= player.left && @right <= player.right && @bottom >= player.top && @bottom <= player.bottom )
		bottomRight2 = ( player.right >= @left && player.right <= @right && player.bottom >= @top && player.bottom <= @bottom )
		bottomRight = bottomRight1 || bottomRight2
		bottomLeft1 = ( @left <= player.right && @left >= player.left && @bottom >= player.top && @bottom <= player.bottom )
		bottomLeft2 = ( player.left <= @right && player.left >= @left && player.bottom >= @top && player.bottom <= @bottom )
		bottomLeft = bottomLeft1 || bottomLeft2

		if ( topRight || topLeft || bottomRight || bottomLeft )
			# turn player 1 around
			if @alive
				@implode()
				Globals.scene.enemyVel += .33 # speed up buses
				Globals.scene.world.p1.toggleDirection()
				Globals.scene.incrementScore 1000 + Globals.scene.time * 100
				Globals.scene.time = 15 # reset time
				Globals.scene.loadFoamEnemy( if @side == 'top' then 'bottom' else 'top' )
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
			delete Globals.scene.world.foamEnemies[@id]
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