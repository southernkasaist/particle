(function(){
    var GameMain = arc.Class.create(arc.Game, {

        initialize:function(canvas){
            this.name = 'GameMain';
            this.genId = 0;
            this.canvas = canvas;
            this.context = canvas.getContext('2d');
            this.width = canvas.width;
            this.height = canvas.height;
            
            this.sceneMgr = new SceneManager(this, this.width, this.height);
            
            this.effectLoader = new EffectLoader();
            this.player = null;
            this.tieFighter = null;
            
            //basic explosion
            this.explosion = null;
            
            //audio
            this.audios = {};
            
            this._initBackground();
            this._initPlayer();
            this._initStage();
            this._initAudio();
            this._initEventHandling();
        },
        getGenId:function(){
            if(this.genId++ == 1000)
                this.genId = 0;
            return this.genId;
        },
        _initBackground:function(){
            this.sceneMgr.setBackground(new Background(this._system.getImage(IMAGE.BackgroundStage1), this.canvas));
        },
        _initPlayer:function(){
            var player = new Player(this._system.getImage(IMAGE.NabooBomber), null, 'player', 100, 100, BULLETS.BulletA, 3, this._system.getImage(IMAGE.NabooBomberSmall));
            player.startX = ~~(this.width >> 1), player.startY = this.height - ~~(player.getHeight() >> 1);
            player.setPosition(player.startX, player.startY);
            this.sceneMgr.setPlayer(player);
            
            var effect;
            /*effect = new Effect(null, this.canvas, player, player.name + '_' + EFFECTS.BLUE_BEAM);
            this.effectLoader.push('js/game/json/effect/' + EFFECTS.BLUE_BEAM + '.json', effect, 
            {
                pos: {
                    x: player.getX(),
                    y: player.getY() - ~~(player.getHeight() >> 1)
                },
                identifier: EFFECTS.BLUE_BEAM,
                handler: this.sceneMgr,
                handle: 'addEffect'
            });*/
            
            /*effect = new Effect(null, this.canvas, player, player.name + '_' + EFFECTS.ANNULUS_SHIELD);
            this.effectLoader.push('js/game/json/effect/' + EFFECTS.ANNULUS_SHIELD + '.json', effect,
            {
                pos: {
                    x: player.getX(),
                    y: player.getY()
                },
                identifier: EFFECTS.ANNULUS_SHIELD,
                handler: this.sceneMgr,
                handle: 'addEffect'
            });*/
            effect = new Effect(null, this.canvas, player, player.name + '_' + EFFECTS.ENGINE_HEAT);
            this.effectLoader.push('js/game/json/effect/' + EFFECTS.ENGINE_HEAT + '.json', effect,
            {
                pos: {
                    x: player.getX(),
                    y: player.getY() + (player.getHeight() / 4)
                },
                identifier: EFFECTS.ENGINE_HEAT,
                handler: this.sceneMgr,
                handle: 'addEffect'
            });
            
            this.explosion = new Effect(null, this.canvas, null, EFFECTS.BASIC_EXPLOSION);
            this.effectLoader.push('js/game/json/effect/' + EFFECTS.BASIC_EXPLOSION + '.json', this.explosion,
            {
                pos: {
                    x: -1,
                    y: -1
                },
                handler: this.sceneMgr,
                handle: 'addEffect'
            });
            
            this.effectLoader.loadEffects();
            
            this.player = player;
        },
        _initStage:function(){
        },
        _initAudio:function(){
            if(!Audio)
                return;
            var background = new Audio('music/TheDeal.mp3');
            if(!background)
                return;
            background.loop = true;
            this.audios[MUSICS.BACKGROUND] = background;
            background.addEventListener('canplaythrough', function(){
                background.play();
            }, false);
            
            var explode = new Audio('music/Explode.wav');
            explode.autoplay = false;
            this.audios[MUSICS.EXPLODE] = explode;
            
            var item = new Audio('music/FoundItem.wav');
            item.autoplay = false;
            this.audios[MUSICS.ITEM] = item;
        },
        playMusic:function(name){
            var audio = this.audios[name];
            if(audio && audio.readyState == 4) {
                audio.currentTime = 0;
                audio.play();
            }
        },
        _initEventHandling:function(){
            var stage = this.getStage();
            stage.addEventListener(arc.Event.TOUCH_START, arc.util.bind(this._onTouchStart, this));
            stage.addEventListener(arc.Event.TOUCH_MOVE, arc.util.bind(this._onTouchMove, this));
            stage.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onTouchEnd, this));
        },
        _onTouchStart:function(evt) {
            var player = this.player, hfw = player.getWidth() >> 1, hfh = player.getHeight() >> 1, x = player.getX(), y = player.getY(), evtX = evt.x, evtY = evt.y;
            player.onTouch = evtX >= x - hfw && evtX <= x + hfw && evtY >= y - hfh && evtY <= y + hfh;
        },
        _onTouchMove:function(evt) {
            var player = this.player;
            if(player.onTouch){
                player.setPosition(evt.x, evt.y - 30);
                player.adjustPosition(this.width, this.height);
            }
        },
        _onTouchEnd:function(evt){
            var player = this.player;
            if(player.onTouch){
                player.setPosition(evt.x, evt.y - 30);
                player.adjustPosition(this.width, this.height);
                player.onTouch = false;
            }
        },
        _gameLoaded:function(){
            return this.effectLoader.effectsLoaded();
        },
        gameover:function(){
            var text;
            if(this.player.life.length == 0) {
                text = 'Mission Failed';
            } else {
                text = 'Mission Completed';
            }
            var cover = new Cover(text, null, this.width, this.height);
            this.addChild(cover);
            this._system.stop();
        },
        update:function(){
            var fps = this._system.getFps();
          
            this.sceneMgr.update(fps);

            document.title = "FPS: " + fps.toFixed(2) + " NUM: " + this._displayArr.length;
        }
    });
    
    var Cover = arc.Class.create(arc.display.DisplayObjectContainer, {
        initialize:function(text, msg, width, height){
            this._bg = new arc.display.Shape();
            this._bg.beginFill(0x000000, 0.7);
            this._bg.drawRect(0, 0, width, height);
            this._bg.endFill();
            this.addChild(this._bg);

            this._txt = new arc.display.TextField();
            this._txt.setAlign(arc.display.Align.CENTER);
            this._txt.setFont("Helvetica", 30, true);
            this._txt.setText(text);
            this._txt.setX(width / 2);
            this._txt.setY(height / 2);
            this._txt.setColor(0xffffff);
            this.addChild(this._txt);
            
            if(typeof msg != 'undefined' && msg != null && msg.length != 0) {
                this._msg = new arc.display.TextField();
                this._msg.setAlign(arc.display.Align.CENTER);
                this._msg.setFont("Helvetica", 30, true);
                this._msg.setText(msg);
                this._msg.setX(width / 2);
                this._msg.setY(height / 2 + 50);
                this._msg.setColor(0xffff00);
                this.addChild(this._msg);
            }
        }
    });
    
    window.addEventListener('DOMContentLoaded', function(e){
        var system = new arc.System(320, 416, 'canvas');
        system.setGameClass(GameMain, system.getCanvas());
        system.addEventListener(arc.Event.PROGRESS, function(e){
            console.log(e.loaded + ", " + e.total);
        });
        system.addEventListener(arc.Event.COMPLETE, function(){
            console.log('loaded');
        });
        var images = [];
        for(var prop in IMAGE) {
            images.push(IMAGE[prop]);
        }
        system.load(images);
    }, false);
})();
