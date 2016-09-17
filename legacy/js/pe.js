//Particle
    var Particle = arc.Class.create({
        initialize:function(){
            this.position = new Vector();
            this.direction = new Vector();
            this.size = 0;
            this.sizeSmall = 0;
            this.timeToLive = 0;
            this.colour = [];
            this.drawColour = "";
            this.deltaColour = [];
            this.sharpness = 0;
        }
    });
    //ParticleEmitter
    var ParticleEmitter = arc.Class.create(arc.display.DisplayObject, {
        
        initialize:function(texture, context){
            this.context = context;
            this.maxParticles = 20;
            this.particles = [];
            this.active = true;

            // Properties
            //this.position = new Vector( this.getX(), this.getY() );
            this.positionRandom = new Vector( 10, 10 );
            this.size = 90;
            this.sizeRandom = 15;
            this.speed = 5;
            this.speedRandom = 1.5;
            this.lifeSpan = 10;
            this.lifeSpanRandom = 7;
            this.angle = 0;
            this.angleRandom = 360;
            this.gravity = new Vector( 0.4, 0.5 );
            this.startColour = [ 250, 218, 68, 1 ];
            this.startColourRandom = [ 62, 60, 60, 0 ];
            this.finishColour = [ 245, 35, 0, 0 ];
            this.finishColourRandom = [ 60, 60, 60, 0 ];
            this.sharpness = 40;
            this.sharpnessRandom = 10;

            this.particleCount = 0;
            this.elapsedTime = 0;
            this.duration = -1;
            this.emissionRate = 0;
            this.emitCounter = 0;
            this.particleIndex = 0;
            
            //init
            this.blendModes = [ "source-over", "lighter", "darker", "xor" ];
            this.context.globalCompositeOperation = this.blendModes[1];
            
            this.emissionRate = this.maxParticles / this.lifeSpan;
            this.emitCounter = 0;
        
            this.texture = texture || null;
        },
        addParticle: function(){
            if(this.particleCount == this.maxParticles) {
                return false;
            }
		
            // Take the next particle out of the particle pool we have created and initialize it	
            var particle = new Particle();
            this.initParticle( particle );
            this.particles[ this.particleCount ] = particle;
            // Increment the particle count
            this.particleCount++;

            return true;
        },
        initParticle: function( particle ){
            var RANDM1TO1 = function(){
                return Math.random() * 2 - 1;
            };
		
            particle.position.x = this.getX() - (this.size >> 1) + this.positionRandom.x * RANDM1TO1();
            particle.position.y = this.getY() - (this.size >> 1) + this.positionRandom.y * RANDM1TO1();

            var newAngle = (this.angle + this.angleRandom * RANDM1TO1() ) * ( Math.PI / 180 ); // convert to radians
            var vector = new Vector( Math.cos( newAngle ), Math.sin( newAngle ) ); // Could move to lookup for speed
            var vectorSpeed = this.speed + this.speedRandom * RANDM1TO1();
            particle.direction = Vector.multiply( vector, vectorSpeed );

            particle.size = this.size + this.sizeRandom * RANDM1TO1();
            particle.size = particle.size < 0 ? 0 : ~~particle.size;
            particle.timeToLive = this.lifeSpan + this.lifeSpanRandom * RANDM1TO1();
		
            particle.sharpness = this.sharpness + this.sharpnessRandom * RANDM1TO1();
            particle.sharpness = particle.sharpness > 100 ? 100 : particle.sharpness < 0 ? 0 : particle.sharpness;
            // internal circle gradient size - affects the sharpness of the radial gradient
            particle.sizeSmall = ~~( ( particle.size / 200 ) * particle.sharpness ); //(size/2/100)

            var start = [
            this.startColour[ 0 ] + this.startColourRandom[ 0 ] * RANDM1TO1(),
            this.startColour[ 1 ] + this.startColourRandom[ 1 ] * RANDM1TO1(),
            this.startColour[ 2 ] + this.startColourRandom[ 2 ] * RANDM1TO1(),
            this.startColour[ 3 ] + this.startColourRandom[ 3 ] * RANDM1TO1()
            ];

            var end = [
            this.finishColour[ 0 ] + this.finishColourRandom[ 0 ] * RANDM1TO1(),
            this.finishColour[ 1 ] + this.finishColourRandom[ 1 ] * RANDM1TO1(),
            this.finishColour[ 2 ] + this.finishColourRandom[ 2 ] * RANDM1TO1(),
            this.finishColour[ 3 ] + this.finishColourRandom[ 3 ] * RANDM1TO1()
            ];

            particle.colour = start;
            particle.deltaColour[ 0 ] = ( end[ 0 ] - start[ 0 ] ) / particle.timeToLive;
            particle.deltaColour[ 1 ] = ( end[ 1 ] - start[ 1 ] ) / particle.timeToLive;
            particle.deltaColour[ 2 ] = ( end[ 2 ] - start[ 2 ] ) / particle.timeToLive;
            particle.deltaColour[ 3 ] = ( end[ 3 ] - start[ 3 ] ) / particle.timeToLive;
        },
        update: function( delta ){
            if( this.active && this.emissionRate > 0 ){
                var rate = 1 / this.emissionRate;
                this.emitCounter += delta;
                while( this.particleCount < this.maxParticles && this.emitCounter > rate ){
                    this.addParticle();
                    this.emitCounter -= rate;
                }
                this.elapsedTime += delta;
                if( this.duration != -1 && this.duration < this.elapsedTime ){
                    this.stopParticleEmitter();
                }
            }

            this.particleIndex = 0;
            while( this.particleIndex < this.particleCount ) {

                var currentParticle = this.particles[ this.particleIndex ];

                // If the current particle is alive then update it
                if( currentParticle.timeToLive > 0 ){

                    // Calculate the new direction based on gravity
                    currentParticle.direction = Vector.add( currentParticle.direction, this.gravity );
                    currentParticle.position = Vector.add( currentParticle.position, currentParticle.direction );
                    currentParticle.timeToLive -= delta;

                    // Update colours based on delta
                    var r = currentParticle.colour[ 0 ] += ( currentParticle.deltaColour[ 0 ] * delta );
                    var g = currentParticle.colour[ 1 ] += ( currentParticle.deltaColour[ 1 ] * delta );
                    var b = currentParticle.colour[ 2 ] += ( currentParticle.deltaColour[ 2 ] * delta );
                    var a = currentParticle.colour[ 3 ] += ( currentParticle.deltaColour[ 3 ] * delta );
				
                    // Calculate the rgba string to draw.
                    var draw = [];
                    draw.push("rgba(" + ( r > 255 ? 255 : r < 0 ? 0 : ~~r ) );
                    draw.push( g > 255 ? 255 : g < 0 ? 0 : ~~g );
                    draw.push( b > 255 ? 255 : b < 0 ? 0 : ~~b );
                    draw.push( (a > 1 ? 1 : a < 0 ? 0 : a.toFixed( 2 ) ) + ")");
                    currentParticle.drawColour = draw.join( "," );
				
                    this.particleIndex++;
                } else {
                    // Replace particle with the last active 
                    if( this.particleIndex != this.particleCount - 1 ){
                        this.particles[ this.particleIndex ] = this.particles[ this.particleCount-1 ];
                    }
                    this.particleCount--;
                }
            }
        },
        stopParticleEmitter: function(){
            this.active = false;
            this.elapsedTime = 0;
            this.emitCounter = 0;
        },
        draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
            var context = this.context;
            context.save();
            for( var i = 0, j = this.particleCount; i < j; i++ ){
                var particle = this.particles[ i ];
                var size = particle.size;
                var halfSize = size >> 1;
                var x = ~~particle.position.x;
                var y = ~~particle.position.y;
            
                var radgrad = context.createRadialGradient( x + halfSize, y + halfSize, particle.sizeSmall, x + halfSize, y + halfSize, halfSize);  
                radgrad.addColorStop( 0, particle.drawColour );
                /*radgrad.addColorStop( 0.2, 'rgba(51,0,51,0)' );
            radgrad.addColorStop( 0.4, 'rgba(102,0,102,0)' );
            radgrad.addColorStop( 0.5, 'rgba(153,0,153,0)' );
            radgrad.addColorStop( 0.6, 'rgba(204,0,204,0)' );*/
                radgrad.addColorStop( 1, 'rgba(255,0,255,0)' );
                context.fillStyle = radgrad;
                context.fillRect( x, y, size, size );
                if(this.texture) {
                    var w = this.texture.getWidth();
                    var h = this.texture.getHeight();
                    context.drawImage(this.texture._data, 0, 0, w, h, x, y, w, h);
                }
            }
            context.restore();
        }
    });