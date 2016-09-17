//Color
var Color = arc.Class.create({
    initialize: function(red, green, blue, alpha) {
        this.set(red, green, blue, alpha);
    },
    assign: function(color) {
        this.set(color.red, color.green, color.blue, color.alpha);
    },
    set: function(red, green, blue, alpha) {
        this.red = ~~red;
        this.green = ~~green;
        this.blue = ~~blue;
        this.alpha = ~~alpha;
        
        this.red = this.red < 0 ? 0 : (this.red > 255 ? 255 : this.red);
        this.green = this.green < 0 ? 0 : (this.green > 255 ? 255 : this.green);
        this.blue = this.blue < 0 ? 0 : (this.blue > 255 ? 255 : this.blue);
        this.alpha = this.alpha < 0 ? 0 : (this.alpha > 255 ? 255 : this.alpha);
    },
    toDrawColor: function() {
        var draw = [];
        draw.push("rgba(" + ( this.red > 255 ? 255 : this.red < 0 ? 0 : ~~this.red ) );
        draw.push( this.green > 255 ? 255 : this.green < 0 ? 0 : ~~this.green );
        draw.push( this.blue > 255 ? 255 : this.blue < 0 ? 0 : ~~this.blue );
        draw.push( (this.alpha > 1 ? 1 : this.alpha < 0 ? 0 : this.alpha.toFixed( 2 ) ) + ")");
        return draw.join( "," );
    }
});
//Vector
var Vector = arc.Class.create({
    initialize: function(x, y, z) {
        this.set(x, y, z);
    },
    set: function(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    },
    squaredLength: function() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
});
Vector.add = function(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}
Vector.subtract = function(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}
Vector.multiply = function(vec, val) {
    return new Vector(vec.x * val, vec.y * val, vec.z * val);
}
Vector.divide = function(vec, val) {
    return new Vector(vec.x / val, vec.y / val, vec.z / val);
}
Vector.crossProduct = function(v1, v2) {
    return new Vector(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
}
Vector.dotProduct = function(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
Vector.normalize = function(v) {
    var len = v.length();
    if(len != 1 && len != 0) {
        var s = 1.0 / len;
        v = Vector.multiply(v, s);
    }
    return v;
}
Vector.rotateX = function(v, angle) {
    if(angle == 0)
        return new Vector(v.x, v.y, v.z);
    var sin = Math.sin(Math.PI * angle / 180);
    var cos = Math.cos(Math.PI * angle / 180);
    return new Vector(v.x, v.y * cos - v.z * sin, v.y * sin + v.z * cos);
}
Vector.rotateY = function(v, angle) {
    if(angle == 0)
        return new Vector(v.x, v.y, v.z);
    var sin = Math.sin(Math.PI * angle / 180);
    var cos = Math.cos(Math.PI * angle / 180);
    return new Vector(v.x * cos + v.z * sin, v.y, - v.x * sin + v.z * cos);
}
Vector.rotateZ = function(v, angle) {
    if(angle == 0)
        return new Vector(v.x, v.y, v.z);
    var sin = Math.sin(Math.PI * angle / 180);
    var cos = Math.cos(Math.PI * angle / 180);
    return new Vector(v.x * cos - v.y * sin, v.x * sin + v.y * cos, v.z);
}
Vector.rotatedAxis = function(v, angle, axis) {
    if(angle == 0)
        return new Vector(v.x, v.y, v.z);
    var u = axis.getNormalized();
    var vec = new Vector();
    var sin = Math.sin(Math.PI * angle / 180);
    var cos = Math.cos(Math.PI * angle / 180);
    vec.x  = (cos + (1 - cos) * u.x * u.x) * v.x;
    vec.x += ((1 - cos) * u.x * u.y - u.z * sin) * v.y;
    vec.x += ((1 - cos) * u.x * u.z + u.y * sin) * v.z;
    vec.y  = ((1 - cos) * u.x * u.y + u.z * sin) * v.x;
    vec.y += (cos + (1 - cos) * u.y * u.y) * v.y;
    vec.y += ((1 - cos) * u.y * u.z - u.x * sin) * v.z;
    vec.z  = ((1 - cos) * u.x * u.z - u.y * sin) * v.x;
    vec.z += ((1 - cos) * u.y * u.z + u.x * sin) * v.y;
    vec.z += (cos + (1 - cos) * u.z * u.z) * v.z;
    return vec;
}

//ExtParticle
var ExtParticle = arc.Class.create({
    initialize:function(){
        this.position = new Vector();
        this.direction = new Vector();//gravity mode
        this.size = 0;
        this.sizeSmall = 0;
        this.timeToLive = 0;
        this.colour = [];
        this.drawColour = "";
        this.deltaColour = [];
        this.sharpness = 0;
        
        /**************** extension ******************/
        this.rotation = 0;
        this.deltaRotation = 0;
        
        //gravity mode
        this.radialAccel = 0;
        this.tangentialAccel = 0;
        
        //radius mode
        this.angle = 0;
        this.degreesPerSecond = 0;
        this.radius = 0;
        this.deltaRadius = 0;
    }
});
//ExtParticleEmitter
var ExtParticleEmitter = arc.Class.create(arc.display.DisplayObject, {
        
    initialize:function(texture, context){
        this.fc = 0;
        this.context = context;
        this.maxParticles = 50;
        this.particles = [];
        this.active = true;

        // Properties
        //this.position = new Vector( this.getX(), this.getY() );
        this.positionRandom = new Vector( 10, 10 );
        this.lifeSpan = 20;
        this.lifeSpanRandom = 7;
        this.size = 50;
        this.sizeRandom = 15;
        this.speed = 2;
        this.speedRandom = 1.5;
        this.angle = 270;
        this.angleRandom = 0;
        this.gravity = new Vector( 0, 0 );
        this.startColour = [ 100, 118, 250, 1 ];
        this.startColourRandom = [ 62, 60, 60, 0 ];
        this.finishColour = [ 245, 0, 0, 0.6 ];
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
        this.blendModes = 
        [
        "source-over", "source-atop", "source-in", "source-out", 
        "destination-over", "destination-atop", "destination-in", 
        "destination-out", "lighter", "copy", "xor"
        ];
        this.context.globalCompositeOperation = this.blendModes[8];
        this.context.globalAlpha=0.2;
        
        this.emissionRate = this.maxParticles / this.lifeSpan;
        this.emitCounter = 0;
        
        /**************** extension ******************/
        
        //rotation
        this.startSpin = 0;
        this.startSpinVar = 0;
        this.endSpin = 0;
        this.endSpinVar = 0;
        
        //gravity
        this.emitterMode = 1;//0:gravity; 1:radial
        this.radialAccel = 0;
        this.tangentialAccel = 0;
        this.radialAccelVar = 0;
        this.tangentialAccelVar = 0;
        //radius
        this.changeRadius = true;
        this.startRadius = 10;
        this.startRadiusVar = 1;
        this.endRadius = 200;
        this.endRadiusVar = 0;
        this.rotatePerSecond = 5;
        this.rotatePerSecondVar = 0;
        
        //image
        this.texture = texture || null;
        this.enableTexture = false;
    },
    setContext: function(context) {
        this.context = context;  
    },
    setTexture: function(texture) {
        this.texture = texture;
    },
    refresh: function() {
            
    },
    addParticle: function(){
        if(this.particleCount == this.maxParticles) {
            return false;
        }
		
        // Take the next particle out of the particle pool we have created and initialize it	
        var particle = new ExtParticle();
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
        
        // rotation
        var startA = this.startSpin + this.startSpinVar * RANDM1TO1();
        var endA = this.endSpin + this.endSpinVar * RANDM1TO1();
        particle.rotation = startA;
        particle.deltaRotation = (endA - startA) / particle.timeToLive;
        
        var newAngle = (this.angle + this.angleRandom * RANDM1TO1() ) * ( Math.PI / 180 ); // convert to radians
        if(this.emitterMode == 0) {//gravity
            var vector = new Vector( Math.cos( newAngle ), Math.sin( newAngle ) ); // Could move to lookup for speed
            var vectorSpeed = this.speed + this.speedRandom * RANDM1TO1();
            particle.direction = Vector.multiply( vector, vectorSpeed );
            particle.radialAccel = this.radialAccel + this.radialAccelVar * RANDM1TO1();
            particle.tangentialAccel = this.tangentialAccel + this.tangentialAccelVar * RANDM1TO1();
        } else {//radius
            var startRadius = this.startRadius + this.startRadiusVar * RANDM1TO1();
            var endRadius = this.endRadius + this.endRadiusVar * RANDM1TO1();

            particle.radius = startRadius;
            particle.deltaRadius = this.changeRadius ? (endRadius - startRadius) / particle.timeToLive : 0;

            particle.angle = newAngle;
            particle.degreesPerSecond = this.rotatePerSecond + this.rotatePerSecondVar * RANDM1TO1();
        }
    },
    update: function( delta ){
        this.emissionRate = this.maxParticles / this.lifeSpan;
        if( this.active && this.emissionRate > 0 ){
            var rate = 1 / this.emissionRate;
            this.emitCounter += delta;
            this.particleCount = this.particleCount > this.maxParticles ? this.maxParticles : this.particleCount;
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
                
                if(this.emitterMode == 0) {
                    var radial;
                    // radial acceleration
                    if (currentParticle.position.x || currentParticle.position.y)
                        radial = Vector.normalize(currentParticle.position);

                    var tangential = radial;
                    radial = Vector.multiply(radial, currentParticle.radialAccel);

                    // tangential acceleration
                    var newy = tangential.x;
                    tangential.x = -tangential.y;
                    tangential.y = newy;
                    tangential = Vector.multiply(tangential, currentParticle.tangentialAccel);

                    // (gravity + radial + tangential) * dt
                    currentParticle.direction = Vector.add(currentParticle.direction, 
                        Vector.multiply(Vector.add(Vector.add(radial, tangential), this.gravity), delta));
                    currentParticle.position = Vector.add(currentParticle.position, Vector.multiply(currentParticle.direction, delta));
                } else {
                    currentParticle.angle += currentParticle.degreesPerSecond * delta;
                    currentParticle.radius += currentParticle.deltaRadius * delta;

                    currentParticle.position.x = this.getX() - Math.cos(currentParticle.angle * Math.PI / 180) * currentParticle.radius;
                    currentParticle.position.y = this.getY() - Math.sin(currentParticle.angle * Math.PI / 180) * currentParticle.radius;
                }
                
                // angle
                currentParticle.rotation += (currentParticle.deltaRotation * delta);

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
        for( var i = 0, j = this.particleCount; i < j; i++ ){
            var particle = this.particles[ i ];
            var size = particle.size;
            var halfSize = size >> 1;
            var x = ~~particle.position.x;
            var y = ~~particle.position.y;
            
            context.save();
            context.translate(x, y);
            //var radgrad = context.createRadialGradient( x + halfSize, y + halfSize, particle.sizeSmall, x + halfSize, y + halfSize, halfSize);
            var radgrad = context.createRadialGradient( halfSize, halfSize, particle.sizeSmall, halfSize, halfSize, halfSize);
            radgrad.addColorStop( 0, particle.drawColour );
            radgrad.addColorStop( 1, 'rgba(0,0,0,0)' );
            context.fillStyle = radgrad;
            //context.fillStyle = particle.drawColour;
            if(this.changeRotation)
                context.rotate(particle.rotation*Math.PI/180);
            if(this.enableTexture && this.texture) {
                var w = this.texture.getWidth();
                var h = this.texture.getHeight();
                context.drawImage(this.texture._data, 0, 0, w, h, -w/2, -h/2, w, h);
            } else {
                context.fillRect( 0, 0, size, size );
            }
            context.restore();
        }
    }
});