(function(){
    var GameMain = arc.Class.create(arc.Game, {

        initialize:function(canvas){
            this.canvas = canvas;
            var w = this.canvas.width;
            var h = this.canvas.height;
            this.pe = new arc.display.ParticleEmitter(null, this.canvas);
            this.pe.setPosition(w >> 1, h >> 1);
            this.addChild(this.pe);
            this.peCounter = 0;
        
            var stage = this.getStage();
            stage.addEventListener(arc.Event.TOUCH_START, arc.util.bind(this._onTouchStart, this));
            stage.addEventListener(arc.Event.TOUCH_MOVE, arc.util.bind(this._onTouchMove, this));
            
            /* context global settings */
            //this.blendModes = ["source-over", "lighter", "copy", "xor"];
            //this.context.globalCompositeOperation = this.blendModes[1];
            //this.context.globalAlpha = 1;
            
            /* particle properties */
            //maxParticles;
            this.initSlider(this.pe, "maxParticles", 500);
            //lifeSpan
            this.initSlider(this.pe, "lifeSpan", 100);
            //lifeSpanVar
            this.initSlider(this.pe, "lifeSpanVar", 100);
            //startSize
            this.initSlider(this.pe, "startSize", 100);
            //startSizeVar
            this.initSlider(this.pe, "startSizeVar", 100);
            //finishSize
            this.initSlider(this.pe, "finishSize", 100);
            //finishSizeVar
            this.initSlider(this.pe, "finishSizeVar", 100);
            //emitXVar
            this.initSlider(this.pe, "emitXVar", 300);
            //emitYVar
            this.initSlider(this.pe, "emitYVar", 400);
            //emitAngle
            this.initSlider(this.pe, "emitAngle", 360);
            //emitAngleVar
            this.initSlider(this.pe, "emitAngleVar", 360);
            //startRotation
            this.initSlider(this.pe, "startRotation", 360);
            //startRotationVar
            this.initSlider(this.pe, "startRotationVar", 360);
            //endRotation
            this.initSlider(this.pe, "endRotation", 360);
            //endRotationVar
            this.initSlider(this.pe, "endRotationVar", 360);
            //startRadialGradient
            this.initSlider(this.pe, "startRadialGradient", 0.99, 0, 0.01);
            //endRadialGradient
            this.initSlider(this.pe, "endRadialGradient", 1, 0, 0.01);
            
            /* gravity properties */
            //speed
            this.initSlider(this.pe, "speed", 10);
            //speedVar
            this.initSlider(this.pe, "speedVar", 10);
            //gravityX
            this.initSlider(this.pe, "gravityX", 10, -10);
            //gravityY
            this.initSlider(this.pe, "gravityY", 10, -10);
            //radialAcceleration
            this.initSlider(this.pe, "radialAcceleration", 10, -10);
            //radialAccelerationVar
            this.initSlider(this.pe, "radialAccelerationVar", 10);
            //tangentialAcceleration
            this.initSlider(this.pe, "tangentialAcceleration", 10, -10);
            //tangentialAccelerationVar
            this.initSlider(this.pe, "tangentialAccelerationVar", 10);
            
            /* radial properties */
            //maxRadius
            this.initSlider(this.pe, "maxRadius", 200);
            //maxRadiusVar
            this.initSlider(this.pe, "maxRadiusVar", 200);
            //minRadius
            this.initSlider(this.pe, "minRadius", 200);
            //degreesPerSecond
            this.initSlider(this.pe, "degreesPerSecond", 360, -360);
            //degreesPerSecondVar
            this.initSlider(this.pe, "degreesPerSecondVar", 360);
        
            /* particle color */
            //startColor
            this.initSliderColor(this.pe, "startColor", 0, 255);
            this.initSliderColor(this.pe, "startColor", 1, 255);
            this.initSliderColor(this.pe, "startColor", 2, 255);
            this.initSliderColor(this.pe, "startColor", 3, 255);
            this.finishInitSliderColor(this.pe, "startColor");
            //startColorVar
            this.initSliderColor(this.pe, "startColorVar", 0, 255);
            this.initSliderColor(this.pe, "startColorVar", 1, 255);
            this.initSliderColor(this.pe, "startColorVar", 2, 255);
            this.initSliderColor(this.pe, "startColorVar", 3, 255);
            this.finishInitSliderColor(this.pe, "startColorVar");
            //finishColor
            this.initSliderColor(this.pe, "finishColor", 0, 255);
            this.initSliderColor(this.pe, "finishColor", 1, 255);
            this.initSliderColor(this.pe, "finishColor", 2, 255);
            this.initSliderColor(this.pe, "finishColor", 3, 255);
            this.finishInitSliderColor(this.pe, "finishColor");
            //finishColorVar
            this.initSliderColor(this.pe, "finishColorVar", 0, 255);
            this.initSliderColor(this.pe, "finishColorVar", 1, 255);
            this.initSliderColor(this.pe, "finishColorVar", 2, 255);
            this.initSliderColor(this.pe, "finishColorVar", 3, 255);
            this.finishInitSliderColor(this.pe, "finishColorVar");
            
            /* emitter mode */
            //emitterType - 0: gravity, 1: radial
            this.initEmitterTypePanel(this.pe, "emitterType");
            //enableTexture
            initEnableTexture();
        },
        _onTouchStart:function(evt) {
            this.pe.setPosition(evt.x, evt.y);
        },
        _onTouchMove:function(evt) {
            this.pe.setPosition(evt.x, evt.y);
        },
        update:function(){
            var w = this.canvas.width;
            var h = this.canvas.height;
            var ctx = this.canvas.getContext('2d');
            //ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, w, h);
        
            var fps = this._system.getFps();
            var inc = 1.0 / fps;
            this.peCounter += inc;
            var threshold = 1/70;
            if(this.peCounter >= 1/60) {
                this.pe.update(1.0 * threshold * 60);
                this.peCounter = 0;
            }
            
            document.title = "FPS: " + fps;
        },
        initSlider:function(obj, p, maxVal, minVal, step) {
            $("#" + p).slidify({
                obj: obj, 
                prop: p, 
                max:maxVal, 
                min:minVal,
                step:step
            });
            document.getElementById(p+"Tag").value = obj[p];
        },
        initSliderColor:function(obj, p, idx, maxVal, minVal) {
            $("#" + p + idx).slidifyColor({
                parent: obj,
                obj: obj[p],
                prop: idx,
                label: p,
                max:maxVal,
                min:minVal
            });
        },
        finishInitSliderColor:function(obj, p) {
            var color = obj[p];
            refreshPreview(p, color[0], color[1], color[2], color[3]);
        },
        initEmitterTypePanel:function(obj, prop) {
            initEmitterType(obj, prop);
            changeEmitterType();
        }
    });
    
    window.addEventListener('DOMContentLoaded', function(e){
        var system = new arc.System(320, 480, 'canvas');
        system.setGameClass(GameMain, system.getCanvas());
        system.start();
    }, false);
})();