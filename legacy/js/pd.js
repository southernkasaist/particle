//PDParticle
    var PDParticle = arc.Class.create({
        initialize:function(){
            this.position = new Vector();
            this.startPosition = new Vector();
            this.velocity = new Vector();
            this.currentTime = 0;
            this.totalTime = 0;
            this.color = new Color();
            this.colorDelta = new Color();
            this.radialAcceleration = 0;
            this.tangentialAcceleration = 0;
            this.emitRadius = 0;
            this.emitRadiusDelta = 0;
            this.emitRotation = 0;
            this.emitRotationDelta = 0;
            this.rotation = 0;
            this.rotationDelta = 0;
            this.size = 0;
            this.sizeDelta = 0;
            this.sizeSmall = 0;
            this.sharpness = 0;
            this.drawColor = '';
        }
    });
    //ExtParticleEmitter
    var PDParticleEmitter = arc.Class.create(arc.display.DisplayObject, {
        
        initialize:function(texture, context){
            this.texture = texture || null;
            this.context = context || arc.display.Image.context;
        
            //emitter configuration
            this.emitterType = 0;//0: gravity, 1: radial
            this.emitterVariance = new Vector();
        
            //particle configuration
            this.maxParticles = 300;
            this.lifespan = 2.0;
            this.lifespanVariance = 1.9;
            this.startSize = 70.0;
            this.startSizeVariance = 49.5;
            this.endSize = 10.0;
            this.endSizeVariance = 5.0;
            this.emitAngle = 270.0;
            this.emitAngleVariance = 0.0;
            this.startRotation = 0.0;
            this.startRotationVariance = 0.0;
            this.endRotation = 0.0;
            this.endRotationVariance = 0.0;
        
            //gravity configuration
            this.speed = 100.0;
            this.speedVariance = 30.0;
            this.gravity = new Vector();
            this.radialAcceleration = 0.0;
            this.radialAccelerationVariance = 0.0;
            this.tangentialAcceleration = 0.0;
            this.tangentialAccelerationVariance = 0.0;
        
            //radial configuration 
            this.maxRadius = 100.0;
            this.maxRadiusVariance = 0.0;
            this.minRadius = 0.0;
            this.rotatePerSecond = 0.0;
            this.rotatePerSecondVariance = 0.0;
        
            //color configuration
            this.startColor = new Color(1.0 * 255, 0.3 * 255, 0, 0.6 * 255);
            this.startColorVariance = new Color();
            this.endColor = new Color(1.0 * 255, 0.3 * 255);
            this.endColorVariance = new Color();
        
            this.globalCompositeOperation = [
            'source-atop',
            'source-in',
            'source-out',
            'source-over',
            'destination-atop',
            'destination-in',
            'destination-out',
            'destination-over',
            'lighter',
            'copy',
            'xor'
            ];
            this.context.globalCompositeOperation = this.globalCompositeOperation[8];
        
            this.sharpness = 40;
            this.sharpnessVariance = 10;

            //control
            this.active = true;
            this.particles = [];
            this.particleCount = 0;
            this.elapsedTime = 0;
            this.duration = -1;
            this.emissionRate = this.maxParticles / this.lifespan;
            this.emitCounter = 0;
            this.particleIndex = 0;
            this.enabledTexture = false;
        
        
        },
        addParticle: function(){
            if(this.particleCount == this.maxParticles) {
                return false;
            }
            // Take the next particle out of the particle pool we have created and initialize it	
            var particle = new PDParticle();
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
         
            // for performance reasons, the random variances are calculated inline instead
            // of calling a function
            
            var lifespan = this.lifespan + this.lifespanVariance * RANDM1TO1(); 
            if (lifespan <= 0.0) return;
            
            particle.currentTime = 0.0;
            particle.totalTime = lifespan;
            
            particle.position.x = this.getX() + this.emitterVariance.x * RANDM1TO1();
            particle.position.y = this.getY() + this.emitterVariance.y * RANDM1TO1();
            particle.startPosition.x = this.getX();
            particle.startPosition.y = this.getY();
            
            var angle = this.emitAngle + this.emitAngleVariance * RANDM1TO1();
            var speed = this.speed + this.speedVariance * RANDM1TO1();
            particle.velocity.x = speed * Math.cos(angle);
            particle.velocity.y = speed * Math.sin(angle);
            
            particle.emitRadius = this.maxRadius + this.maxRadiusVariance * RANDM1TO1();
            particle.emitRadiusDelta = this.maxRadius / lifespan;
            particle.emitRotation = this.emitAngle + this.emitAngleVariance * RANDM1TO1(); 
            particle.emitRotationDelta = this.rotatePerSecond + this.rotatePerSecondVariance * RANDM1TO1(); 
            particle.radialAcceleration = this.radialAcceleration + this.radialAccelerationVariance * RANDM1TO1();
            particle.tangentialAcceleration = this.tangentialAcceleration + this.tangentialAccelerationVariance * RANDM1TO1();
        
            var startSize = this.startSize + this.startSizeVariance * RANDM1TO1(); 
            var endSize = this.endSize + this.endSizeVariance * RANDM1TO1();
            if (startSize < 0.1) startSize = 0.1;
            if (endSize < 0.1)   endSize = 0.1;
            particle.size = startSize
            particle.sizeDelta = (endSize - startSize) / lifespan;
            particle.sharpness = this.sharpness + this.sharpnessVariance * RANDM1TO1();
            particle.sharpness = particle.sharpness > 100 ? 100 : particle.sharpness < 0 ? 0 : particle.sharpness;
            // internal circle gradient size - affects the sharpness of the radial gradient
            particle.sizeSmall = ~~( ( particle.size / 200 ) * particle.sharpness ); //(size/2/100)
            
            // colors
            var startColor = particle.color;
            var colorDelta = particle.colorDelta;
            
            startColor.red   = this.startColor.red;
            startColor.green = this.startColor.green;
            startColor.blue  = this.startColor.blue;
            startColor.alpha = this.startColor.alpha;
            
            if (this.startColorVariance.red != 0)   startColor.red   += this.startColorVariance.red   * RANDM1TO1();
            if (this.startColorVariance.green != 0) startColor.green += this.startColorVariance.green * RANDM1TO1();
            if (this.startColorVariance.blue != 0)  startColor.blue  += this.startColorVariance.blue  * RANDM1TO1();
            if (this.startColorVariance.alpha != 0) startColor.alpha += this.startColorVariance.alpha * RANDM1TO1();
            
            var endColorRed   = this.endColor.red;
            var endColorGreen = this.endColor.green;
            var endColorBlue  = this.endColor.blue;
            var endColorAlpha = this.endColor.alpha;

            if (this.endColorVariance.red != 0)   endColorRed   += this.endColorVariance.red   * RANDM1TO1();
            if (this.endColorVariance.green != 0) endColorGreen += this.endColorVariance.green * RANDM1TO1();
            if (this.endColorVariance.blue != 0)  endColorBlue  += this.endColorVariance.blue  * RANDM1TO1();
            if (this.endColorVariance.alpha != 0) endColorAlpha += this.endColorVariance.alpha * RANDM1TO1();
            
            colorDelta.red   = (endColorRed   - startColor.red)   / lifespan;
            colorDelta.green = (endColorGreen - startColor.green) / lifespan;
            colorDelta.blue  = (endColorBlue  - startColor.blue)  / lifespan;
            colorDelta.alpha = (endColorAlpha - startColor.alpha) / lifespan;
            
            // rotation
            var startRotation = this.startRotation + this.startRotationVariance * RANDM1TO1();
            var endRotation   = this.endRotation   + this.endRotationVariance   * RANDM1TO1();
            
            particle.rotation = startRotation;
            particle.rotationDelta = (endRotation - startRotation) / lifespan;
        },
        advanceParticle: function( particle, passedTime) {
            
            var restTime = particle.totalTime - particle.currentTime;
            passedTime = restTime > passedTime ? passedTime : restTime;
            particle.currentTime += passedTime;
            
            if (this.emitterType == 1)//radial mode
            {
                particle.emitRotation += particle.emitRotationDelta * passedTime;
                particle.emitRadius   -= particle.emitRadiusDelta   * passedTime;
                particle.position.x = this.getX() - Math.cos(particle.emitRotation) * particle.emitRadius;
                particle.position.y = this.getY() - Math.sin(particle.emitRotation) * particle.emitRadius;
                
                if (particle.emitRadius < this.minRadius)
                    particle.currentTime = particle.totalTime;
            }
            else//gravity mode
            {
                var distanceX = particle.position.x - particle.startPosition.x;
                var distanceY = particle.position.y - particle.startPosition.y;
                var distanceScalar = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                if (distanceScalar < 0.01) distanceScalar = 0.01;
                
                var radialX = distanceX / distanceScalar;
                var radialY = distanceY / distanceScalar;
                var tangentialX = radialX;
                var tangentialY = radialY;
                
                radialX *= particle.radialAcceleration;
                radialY *= particle.radialAcceleration;
                
                var newY = tangentialX;
                tangentialX = -tangentialY * particle.tangentialAcceleration;
                tangentialY = newY * particle.tangentialAcceleration;
                
                particle.velocity.x += passedTime * (this.gravity.x + radialX + tangentialX);
                particle.velocity.y += passedTime * (this.gravity.y + radialY + tangentialY);
                particle.position.x += particle.velocity.x * passedTime;
                particle.position.y += particle.velocity.y * passedTime;
            }
            
            particle.size += particle.sizeDelta * passedTime;
            particle.rotation += particle.rotationDelta * passedTime;
            
            particle.color.red   += particle.colorDelta.red   * passedTime;
            particle.color.green += particle.colorDelta.green * passedTime;
            particle.color.blue  += particle.colorDelta.blue  * passedTime;
            particle.color.alpha += particle.colorDelta.alpha * passedTime;
            
            particle.drawColor = particle.color.toDrawColor();
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

                var particle = this.particles[ this.particleIndex ];

                // If the current particle is alive then update it
                if( particle.totalTime > particle.currentTime){
                    this.advanceParticle(particle, delta);
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
            for( var i = 0, j = this.particleCount; i < j; i++ ){
                context.save();
                var particle = this.particles[ i ];
                var size = particle.size;
                var halfSize = size >> 1;
                var x = ~~particle.position.x;
                var y = ~~particle.position.y;
            
                var radgrad = context.createRadialGradient( x + halfSize, y + halfSize, particle.sizeSmall, x + halfSize, y + halfSize, halfSize);  
                radgrad.addColorStop( 0, particle.drawColor );
                /*radgrad.addColorStop( 0.2, 'rgba(51,0,51,0)' );
            radgrad.addColorStop( 0.4, 'rgba(102,0,102,0)' );
            radgrad.addColorStop( 0.5, 'rgba(153,0,153,0)' );
            radgrad.addColorStop( 0.6, 'rgba(204,0,204,0)' );*/
                radgrad.addColorStop( 1, 'rgba(255,0,255,0)' );
                context.fillStyle = radgrad;
                context.fillRect( x, y, size, size );
                if(this.enabledTexture && this.texture) {
                    var w = this.texture.getWidth();
                    var h = this.texture.getHeight();
                    context.drawImage(this.texture._data, 0, 0, w, h, x, y, w, h);
                }
                context.restore();
            }
        }
    });