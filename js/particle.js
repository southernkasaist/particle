(function(){
    //Particle
    var Particle = arc.Class.create({
        initialize:function(){
            this.lifeSpan = 0;
            this.x = 0;
            this.y = 0;
            this.startX = 0;
            this.startY = 0;
            this.startSize = 0;
            this.sharpness = 0;
            this.finishSize = 0;
            this.rotation = 0;
            this.rotationDelta = 0;
            
            //gravity
            this.velocityX = 0;
            this.velocityY = 0;
            this.radialAcceleration = 0;
            this.tangentialAcceleration = 0;
            //radial
            this.emitRadius = 0;
            this.emitRadiusDelta = 0;
            this.emitRotation = 0;
            this.emitRotationDelta = 0;
            
            this.color = [];
            this.colorDelta = [];
            this.drawColor = '';
            
            this.visible = true;
        }
    });
    //ParticleEmitter
    arc.display.ParticleEmitter = arc.Class.create(arc.display.DisplayObject, {
        
        initialize:function(texture, canvas){
            this.enableTexture = true;
            this.texture = texture;
            this.boundX = canvas.width;
            this.boundY = canvas.height;
            this.context = canvas.getContext("2d");
            
            this.scaleX = 1;
            this.scaleY = 1;
            
            //context global settings
            this.blendModes = ["source-over", "lighter", "copy", "xor"];
            this.globalCompositeOperation = this.blendModes[1];
            this.globalAlpha = 1;
            
            //mode
            this.emitterType = 0;//0: gravity, 1: radial
            this.renderMode = 0;//0: arc, 1: rect
            
            //particle properties
            this.maxParticles = 50;
            this.lifeSpan = 20;
            this.lifeSpanVar = 5;
            this.emitXVar = 0;
            this.emitYVar = 0;
            this.startSize = 50;
            this.startSizeVar = 10;
            this.sharpness = 40;
            this.sharpnessVar = 0;
            this.finishSize = 0;
            this.finishSizeVar = 0;
            this.emitAngle = 270;
            this.emitAngleVar = 0;
            this.startRotation = 0;
            this.startRotationVar = 0;
            this.endRotation = 0;
            this.endRotationVar = 0;
            this.startRadialGradient = 0;
            this.endRadialGradient = 1;
            //gravity properties
            this.speed = 3;
            this.speedVar = 1;
            this.gravityX = 0;
            this.gravityY = 0;
            this.radialAcceleration = 0;
            this.radialAccelerationVar = 0;
            this.tangentialAcceleration = 0;
            this.tangentialAccelerationVar = 0;
            //radial properties
            this.maxRadius = 0;
            this.maxRadiusVar = 0;
            this.minRadius = 0;
            this.degreesPerSecond = 0;
            this.degreesPerSecondVar = 0;
            //particle color
            this.startColor = [255, 118, 0, 0.6];
            this.startColorVar = [0, 0, 0, 0];
            this.finishColor = [255, 80, 0, 0];
            this.finishColorVar = [0, 0, 0, 0];
            
            //emitter properties
            this.active = true;
            this.elapsedTime = 0;
            this.duration = -1;
            this.emissionRate = 0;
            this.emitCounter = 0;
            this.particleCount = 0;
            this.particleIndex = 0;
            this.particles = [];
//            this.boundBox = {
//                minX:0,
//                maxX:0,
//                minY:0,
//                maxY:0
//            };
        },
        saveAsJSON:function(){
            var json = {
                //mode
                emitterType: this.emitterType,
                //particle properties
                maxParticles: this.maxParticles,
                lifeSpan: this.lifeSpan,
                lifeSpanVar: this.lifeSpanVar,
                emitXVar: this.emitXVar,
                emitYVar: this.emitYVar,
                startSize: this.startSize,
                startSizeVar: this.startSizeVar,
                sharpness: this.sharpness,
                sharpnessVar: this.sharpnessVar,
                finishSize: this.finishSize,
                finishSizeVar: this.finishSizeVar,
                emitAngle: this.emitAngle,
                emitAngleVar: this.emitAngleVar,
                startRotation: this.startRotation,
                startRotationVar: this.startRotationVar,
                endRotation: this.endRotation,
                endRotationVar: this.endRotationVar,
                startRadialGradient: this.startRadialGradient,
                endRadialGradient: this.endRadialGradient,
                //gravity properties
                speed: this.speed,
                speedVar: this.speedVar,
                gravityX: this.gravityX,
                gravityY: this.gravityY,
                radialAcceleration: this.radialAcceleration,
                radialAccelerationVar: this.radialAccelerationVar,
                tangentialAcceleration: this.tangentialAcceleration,
                tangentialAccelerationVar: this.tangentialAccelerationVar,
                //radial properties
                maxRadius: this.maxRadius,
                maxRadiusVar: this.maxRadiusVar,
                minRadius: this.minRadius,
                degreesPerSecond: this.degreesPerSecond,
                degreesPerSecondVar: this.degreesPerSecondVar,
                startColor: this.startColor,
                startColorVar: this.startColorVar,
                finishColor: this.finishColor,
                finishColorVar: this.finishColorVar,
                active : this.active
            };
            return JSON.stringify(json);
        },
        loadFromJSON:function(json) {
            for(var prop in json) {
                if(prop == 'textureurl') {
                    var self = this;
                    var img = document.createElement('img');
                    img.src = json[prop];
                    img.onload = function(e) {
                        self['setTexture'](img);
                    }
                } else
                    this[prop] = json[prop];
            }
        },
        setPosition:function(x, y) {
            if(this.enableTexture && this.texture) {
                this.setX(x - ~~(this.texture.getWidth() >> 1));
                this.setY(y - ~~(this.texture.getHeight() >> 1));
            } else {
                this.setX(x - ~~(this.startSize >> 1));
                this.setY(y - ~~(this.startSize >> 1));
            }
        },
        setTexture: function(data) {
            if(this.texture)
                delete this.texture;
            this.texture = new arc.display.Image(data);
        },
        addParticle: function(){
            if(this.particleCount == this.maxParticles) {
                return false;
            }	
            var particle = new Particle();
            this.initParticle(particle);
            this.particles[this.particleCount++] = particle;
            return true;
        },
        initParticle: function(particle){
            var RANDM1TO1 = function(){
                return Math.random() * 2.0 - 1.0;
            };
            particle.lifeSpan = this.lifeSpan + this.lifeSpanVar * RANDM1TO1();
            if (particle.lifeSpan <= 0.0) return;
            particle.x = this.getX() + this.emitXVar * RANDM1TO1();
            particle.y = this.getY() + this.emitYVar * RANDM1TO1();
            particle.startX = this.getX();
            particle.startY = this.getY();
            
            var startRotation = this.startRotation + this.startRotationVar * RANDM1TO1();
            var endRotation = this.endRotation + this.endRotationVar * RANDM1TO1();
            particle.rotation = startRotation;
            particle.rotationDelta = (endRotation - startRotation) / particle.lifeSpan;
            
            var angle = this.emitAngle + this.emitAngleVar * RANDM1TO1();
            var speed = this.speed + this.speedVar * RANDM1TO1();
            //gravity
            particle.velocityX = speed * Math.cos(angle * Math.PI / 180);
            particle.velocityY = speed * Math.sin(angle * Math.PI / 180);
            particle.radialAcceleration = this.radialAcceleration + this.radialAccelerationVar * RANDM1TO1();
            particle.tangentialAcceleration = this.tangentialAcceleration + this.tangentialAccelerationVar * RANDM1TO1();
            //radial
            particle.emitRadius = this.maxRadius + this.maxRadiusVar * RANDM1TO1();
            particle.emitRadiusDelta = (this.maxRadius - this.minRadius) / particle.lifeSpan;
            particle.emitRotation = this.emitAngle + this.emitAngleVar * RANDM1TO1();
            particle.emitRotationDelta = this.degreesPerSecond + this.degreesPerSecondVar * RANDM1TO1();
            
            /*particle.startSize = this.startSize + this.startSizeVar * RANDM1TO1();
            particle.finishSize = this.finishSize + this.finishSizeVar * RANDM1TO1();
            particle.size = particle.startSize;
            particle.sizeDelta = (particle.finishSize - particle.startSize) / particle.lifeSpan;*/
            particle.startSize = ~~(this.startSize + this.startSizeVar * RANDM1TO1());
            particle.sharpness = this.sharpness + this.sharpnessVar * RANDM1TO1();
            particle.finishSize = ~~((particle.startSize / 200) * particle.sharpness);
            
            var start = [
            this.startColor[ 0 ] + this.startColorVar[ 0 ] * RANDM1TO1(),
            this.startColor[ 1 ] + this.startColorVar[ 1 ] * RANDM1TO1(),
            this.startColor[ 2 ] + this.startColorVar[ 2 ] * RANDM1TO1(),
            this.startColor[ 3 ] + this.startColorVar[ 3 ] * RANDM1TO1()
            ];
            var end = [
            this.finishColor[ 0 ] + this.finishColorVar[ 0 ] * RANDM1TO1(),
            this.finishColor[ 1 ] + this.finishColorVar[ 1 ] * RANDM1TO1(),
            this.finishColor[ 2 ] + this.finishColorVar[ 2 ] * RANDM1TO1(),
            this.finishColor[ 3 ] + this.finishColorVar[ 3 ] * RANDM1TO1()
            ];
            particle.color = start;
            particle.colorDelta = [
            (end[0] - start[0]) / particle.lifeSpan,
            (end[1] - start[1]) / particle.lifeSpan,
            (end[2] - start[2]) / particle.lifeSpan,
            (end[3] - start[3]) / particle.lifeSpan
            ];
        },
        update: function(delta){
            this.emissionRate = this.maxParticles / this.lifeSpan;
            if(this.active && this.emissionRate > 0){
                var rate = 1 / this.emissionRate;
                this.emitCounter += delta;
                this.particleCount = this.particleCount > this.maxParticles ? this.maxParticles : this.particleCount;
                while(this.particleCount < this.maxParticles && this.emitCounter > rate){
                    this.addParticle();
                    this.emitCounter -= rate;
                }
                this.elapsedTime += delta;
                if(this.duration != -1 && this.duration < this.elapsedTime){
                    this.stopParticleEmitter();
                }
            }

            this.particleIndex = 0;
            while(this.particleIndex < this.particleCount) {
                var particle = this.particles[this.particleIndex];
                if( particle .lifeSpan > 0 ){
                    if(this.emitterType == 0) {
                        var distanceX = particle.x - particle.startX;
                        var distanceY = particle.y - particle.startY;
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
                
                        particle.velocityX += delta * (this.gravityX + radialX + tangentialX);
                        particle.velocityY += delta * (this.gravityY + radialY + tangentialY);
                        particle.x += particle.velocityX * delta;
                        particle.y += particle.velocityY * delta;
                    } else {
                        particle.emitRotation += particle.emitRotationDelta * delta;
                        particle.emitRadius   -= particle.emitRadiusDelta   * delta;
                        particle.x = this.getX() - Math.cos(particle.emitRotation * Math.PI / 180) * particle.emitRadius;
                        particle.y = this.getY() - Math.sin(particle.emitRotation * Math.PI / 180) * particle.emitRadius;
                    }
                    
                    /*particle.size += particle.sizeDelta;
                    particle.size = particle.sizeDelta > 0 ? 
                        (particle.size > particle.finishSize ? particle.finishSize : particle.size) :
                        (particle.size < particle.finishSize ? particle.finishSize : particle.size);*/
                    
                    particle.rotation += particle.rotationDelta * delta;
                    
                    particle.color[0] += (particle.colorDelta[0] * delta);
                    particle.color[1] += (particle.colorDelta[1] * delta);
                    particle.color[2] += (particle.colorDelta[2] * delta);
                    particle.color[3] += (particle.colorDelta[3] * delta);
                    particle.drawColour = this.getDrawColor(particle.color);
                    
                    particle.lifeSpan -= delta;
                    
                    var gap = this.enableTexture && this.texture ? Math.max(this.texture.getWidth(), this.texture.getHeight()) : Math.max(particle.startSize, particle.finishSize);
                    if(particle.x > this.boundX + gap || particle.x + gap < 0 || particle.y > this.boundY + gap || particle.y + gap < 0)
                        particle.visible = false;
                    else
                        particle.visible = true;
                    
                    /*this.boundBox.minX = particle.x < this.boundBox.minX ? particle.x : this.boundBox.minX;
                    this.boundBox.maxX = particle.x > this.boundBox.maxX ? particle.x : this.boundBox.maxX;
                    this.boundBox.minY = particle.y < this.boundBox.minY ? particle.y : this.boundBox.minY;
                    this.boundBox.maxY = particle.y > this.boundBox.maxY ? particle.y : this.boundBox.maxY;*/
                    
                    this.particleIndex++;
                } else {
                    if(this.particleIndex != this.particleCount - 1){
                        this.particles[this.particleIndex] = this.particles[this.particleCount-1];
                    }
                    this.particleCount--;
                }
            }
        },
        getDrawColor: function(color) {
            var draw = [];
            draw.push("rgba(" + ( color[0] > 255 ? 255 : color[0] < 0 ? 0 : ~~color[0] ) );
            draw.push( color[1] > 255 ? 255 : color[1] < 0 ? 0 : ~~color[1] );
            draw.push( color[2] > 255 ? 255 : color[2] < 0 ? 0 : ~~color[2] );
            draw.push( (color[3] > 1 ? 1 : color[3] < 0 ? 0 : color[3].toFixed( 2 ) ) + ")");
            return draw.join(",");
        },
        stopParticleEmitter: function(){
            this.active = false;
            this.elapsedTime = 0;
            this.emitCounter = 0;
        },
        draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
            var context = this.context;
            var gCompositeOperation = context.globalCompositeOperation;
            context.globalCompositeOperation = this.globalCompositeOperation;
            var gAlpha = context.globalAlpha;
            context.globalAlpha = this.globalAlpha;
            var srg = this.startRadialGradient, erg = this.endRadialGradient;
            for( var i = 0, j = this.particleCount; i < j; i++ ){
                var particle = this.particles[i];
                if(!particle.visible) continue;
                var size = particle.startSize;
                var halfSize = ~~(size >> 1);
                var x = ~~particle.x;
                var y = ~~particle.y;
            
                context.save();
                context.translate(x, y);
                context.scale(this.scaleX, this.scaleY);
                context.rotate(particle.rotation * Math.PI / 180);
                if(this.enableTexture && this.texture) {
                    var w = this.texture.getWidth();
                    var h = this.texture.getHeight();
                    context.drawImage(this.texture._data, 0, 0, w, h, -~~(w>>1), -~~(h>>1), w, h);
                } else {
                    var radgrad = context.createRadialGradient(halfSize, halfSize, particle.finishSize, halfSize, halfSize, halfSize);
                    radgrad.addColorStop(0, particle.drawColour);
                    radgrad.addColorStop(1, 'rgba(0,0,0,0)');
                    context.fillStyle = radgrad;
                    context.fillRect(0, 0, size, size);
                }
                context.restore();
            }
            context.globalAlpha = gAlpha;
            context.globalCompositeOperation = gCompositeOperation;
        }
    });
})();