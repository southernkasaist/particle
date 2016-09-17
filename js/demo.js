(function(){
    var GameMain = arc.Class.create(arc.Game, {

        initialize:function(canvas){
            this.canvas = canvas;
            this.context = this.canvas.getContext('2d');
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.pe = new arc.display.ParticleEmitter(null, this.canvas);
            this.pe.maxParticles = 100;
            this.pe.setX(~~((this.width >> 1) - (this.pe.startSize >> 1)));
            this.pe.setY(~~((this.height >> 1) - (this.pe.startSize >> 1)));
        
            this.addChild(this.pe);
        
            var stage = this.getStage();
            stage.addEventListener(arc.Event.TOUCH_START, arc.util.bind(this._onTouchStart, this));
            stage.addEventListener(arc.Event.TOUCH_MOVE, arc.util.bind(this._onTouchMove, this));
        },
        _onTouchStart:function(evt) {
            this.pe.setX(evt.x - ~~(this.pe.startSize >> 1));
            this.pe.setY(evt.y - ~~(this.pe.startSize >> 1));
        },
        _onTouchMove:function(evt) {
            this.pe.setX(evt.x - ~~(this.pe.startSize >> 1));
            this.pe.setY(evt.y - ~~(this.pe.startSize >> 1));
        },
        update:function(){
            var ctx = this.context;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, this.width, this.height);
        
            this.pe.update(1.0);
            
            document.title = "FPS: " + this._system.getFps().toFixed(2) + " NUM: " + this.pe.maxParticles;
        }
    });
    
    window.addEventListener('DOMContentLoaded', function(e){
        var system = new arc.System(320, 480, 'canvas');
        system.setGameClass(GameMain, system.getCanvas());
        system.addEventListener(arc.Event.PROGRESS, function(e){
            console.log(e.loaded + ", " + e.total);
        });
        system.addEventListener(arc.Event.COMPLETE, function(){
            console.log('loaded');
        });
        var images = [
        ];
        system.load(images);
    }, false);
})();