var Scene = arc.Class.create({
    initialize:function(url, handler){
        this.url = url;
        this.stage = [];
        this.handler = handler;
        this.started = false;
        this.boss = null;
    },
    loadFromJSON:function(json){
        this.stage = json.stage;
    },
    _getActorFunc:function(name) {
        switch(name){
            case ACTORS.TieFighter:
                return TieFighter;
            case ACTORS.Tibirium:
                return Tibirium;
            case ACTORS.XWing:
                return XWing;
            case ACTORS.YWing:
                return YWing;
            case ACTORS.DridStarFighter:
                return DridStarFighter;
            case ACTORS.RepublicCruiser:
                return RepublicCruiser;
            case ACTORS.Corellian:
                return Corellian;
            case ACTORS.JediStarFighter:
                return JediStarFighter;
            case ACTORS.MilleniumFalcon:
                return MilleniumFalcon;
            case ACTORS.Asteroid1:
                return Asteroid1;
            case ACTORS.Asteroid2:
                return Asteroid2;
            case ACTORS.BeamGun:
                return BeamGun;
            case ACTORS.Shield:
                return Shield;
            case ACTORS.Life:
                return Life;
        }
    },
    setup:function(){
        if(this.stage.length > 0) {
            var objArr = this.stage[0], i, j, obj, actor, func;
            for(i = 0; i < objArr.length; i++) {
                obj = objArr[i];
                func = this._getActorFunc(obj[0]);
                actor = new func(this.handler._system.getImage(IMAGE[obj[0]]), null, obj[0] + this.handler.getGenId(), 100, null);
                actor.trackPattern = obj[1];
                if(obj[2] == 'boss') {
                    j = 3;
                    this.boss = actor;
                } else {
                    j = 2;
                }
                for(;j < obj.length; j++)
                    actor.track.push(obj[j]);
                actor.startTrack();
                objArr[i] = actor;
            }
            this.started = true;
        }
    },
    update:function(fps){
        if(this.stage.length > 0) {
            var objArr = this.stage[0], alive = false;
            for(var i = 0; i < objArr.length; i++) {
                if(objArr[i].isAlive) {
                    alive = true;
                    break;
                }
            }
            if(!alive) {
                this.stage.shift();
                this.started = false;
            }
        }
    }
});

var SceneLoader = arc.Class.create(arc.Ajax, {
    initialize:function(){
        this.scenes = [];
        this.sceneIdx = 0;
        var self = this;
        this.addEventListener(arc.Event.COMPLETE, function(){
            var scene = this.scenes[this.sceneIdx];
            scene.loadFromJSON(self.getResponseJSON());
            self.unload();
            if(this.sceneIdx == this.scenes.length - 1) {
                this.scenes = [];
                this.sceneIdx = 0;
            } else {
                self.load(this.scenes[++this.sceneIdx].url);
            }
        });
    },
    push:function(scene){
        this.scenes.push(scene);
    },
    loadScenes:function(){
        this.load(this.scenes[this.sceneIdx].url);
    },
    scenesLoaded:function(){
        return this.scenes.length == 0;
    }
});

var SceneManager = arc.Class.create({
    initialize:function(handler, w, h){
        this.handler = handler;
        this.width = w;
        this.height = h;
        this.background = null;
        this.player = null;
        this.actors = {};
        this.effects = {};
        this.bullets = {};
        this.lockers = {};
        
        this.actorContainer = this.handler;
        this.effectContainer = this.handler;
        this.bulletContainer = this.handler;
        this.miscContainer = this.handler;
        
        this.sceneLoader = new SceneLoader();
        this.sceneIndex = 0;
        this.scenes = [
        new Scene('js/game/json/scene/scene1.json', this.handler)
        ];
        for(var i = 0; i < this.scenes.length; i++)
            this.sceneLoader.push(this.scenes[i]);
        this.sceneLoader.loadScenes();
        
        this.sceneCounter = 0;
        
        this.regionHor = 4;
        this.regionVer = 6;
        this.regionWidth = ~~(w/this.regionHor);
        this.regionHeight = ~~(h/this.regionVer);
        this.regionEntityHash = {};
        for(i = 0; i < this.regionHor; i++)
            for(var j = 0; j < this.regionVer; j++)
                this.regionEntityHash[[i,j].toString()] = {};
        this.entityRegionHash = {};
    },
    _calcRegion:function(entity){
        var hor = Math.floor(entity.getX() / this.regionWidth), ver = Math.floor(entity.getY() / this.regionHeight);
        if(hor < 0 || hor >= this.regionHor || ver < 0 || ver >= this.regionVer)
            return false;
        else
            return [hor,ver];
    },
    _updateRegionHashing:function(entity){
        var region = this._calcRegion(entity);
        if(!region)
            return;
        
        var oldRegion = this.entityRegionHash[entity.name];
        if(oldRegion) {
            delete this.regionEntityHash[oldRegion.toString()][entity.name];
            delete this.entityRegionHash[entity.name];
        }
        this.regionEntityHash[region.toString()][entity.name] = entity;
        this.entityRegionHash[entity.name] = region;
    },
    _removeRegionHashing:function(entity){
        var region = this.entityRegionHash[entity.name];
        if(region) {
            delete this.regionEntityHash[region.toString()][entity.name];
            delete this.entityRegionHash[entity.name];
        }
    },
    _calcDistance:function(entity1, entity2) {
        var vx = entity1.getX() - entity2.getX(), vy = entity1.getY() - entity2.getY();
        return Math.sqrt(vx * vx + vy * vy);
    },
    _collided:function(entity1, entity2, threshold){
        var distSq = this._calcDistance(entity1, entity2), radSq = (entity1.getWidth() + entity2.getWidth()) >> 1, thresh = threshold || 0;
        return thresh + distSq <= radSq/2;
    },
    _doBulletCollisionDetection:function(actor){
        var region = this._calcRegion(actor);
        if(!region)
            return;
        var bullets = this.regionEntityHash[region.toString()];
        var prop, bullet;
        for(prop in bullets) {
            bullet = bullets[prop];
            if(bullet.owner.name != actor.name && (bullet.owner.name == this.player.name || actor.name == this.player.name) && this._collided(actor, bullet)) {
                actor.hitBullet(bullet);
                this.removeBullet(bullet);
            }
        }
    },
    _doCollisionDetection:function(){
        var prop, actor, player = this.player;
        if(!player.isAlive)
            return;
        
        for(prop in this.actors) {
            actor = this.actors[prop];
            if(!actor.getVisible())
                continue;
            if(actor.name != player.name) {
                if(this._collided(actor, player)) {
                    if(actor.itemType) {
                        this._getItem(actor);
                    } else {
                        player.hitActor(actor);
                    }
                }
            }
            if(player.hp == 0) {
                this._checkActor(player);
            }
            this._checkActor(actor);
            if(!actor.isAlive) continue;
            this._doBulletCollisionDetection(actor);
            this._checkActor(actor);
        }
    },
    _getItem:function(actor) {
        var effect, life, lifeArr, lastLife, player = this.player;
        switch(actor.itemType) {
            case ITEMS.BEAM_GUN:
                this.player.bulletType = BULLETS.BulletC;
                this._killActor(actor);
                player.counters['beam'].count = 0;
                break;
            case ITEMS.SHIELD:
                effect = new Effect(null, this.handler.canvas, player, player.name + '_' + EFFECTS.ANNULUS_SHIELD);
                this.handler.effectLoader.push('js/game/json/effect/' + EFFECTS.ANNULUS_SHIELD + '.json', effect,
                {
                    pos: {
                        x: player.getX(),
                        y: player.getY()
                    },
                    identifier: EFFECTS.ANNULUS_SHIELD,
                    handler: this,
                    handle: 'addEffect'
                });
                this.handler.effectLoader.loadEffects();
                this._killActor(actor);
                player.counters['shield'].count = 0;
                break;
            case ITEMS.LIFE:
                lifeArr = this.player.life;
                life = new arc.display.Sprite(this.player.lifeImg);
                lastLife = lifeArr[lifeArr.length-1];
                life.setX(lastLife.getX() + lastLife.getWidth());
                life.setY(lastLife.getY());
                this.miscContainer.addChild(life);
                lifeArr.push(life);
                this.player.hp = 100;
                this._killActor(actor);
                break;
        }
        this.handler.playMusic(MUSICS.ITEM);
    },
    _checkActor:function(actor){
        if(actor.hp == 0) {
            actor.setVisible(false);
            this._explodeActor(actor);
            if(actor.name == this.player.name) {
                this.miscContainer.removeChild(actor.life.pop());
                if(actor.life.length >= 1) {
                    actor.hp = 100;
                    actor.setPosition(actor.startX, actor.startY);
                    actor.onTouch = false;
                    actor.counters['hitActor'].count = 0;
                } else {
                    this._killActor(actor);
                }
            } else {
                this._killActor(actor);
            }
        }
    },
    _killActor:function(actor){
        this.removeActor(actor);
        actor.isAlive = false;
    },
    _explodeActor:function(actor) {
        var effect = this.effects[EFFECTS.BASIC_EXPLOSION];
        var scale = actor.getWidth() * 2 / 96;
        effect.scaleX = scale;
        effect.scaleY = scale;
        effect.setPosition(actor.getX(), actor.getY());
        effect.active = true;
        this.handler.playMusic(MUSICS.EXPLODE);
    },
    setBackground:function(background){
        if(this.background)
            this.miscContainer.removeChild(this.background);
        this.background = background;
        this.miscContainer.addChild(this.background);
    },
    getBackground:function(){
        return this.background;
    },
    setPlayer:function(player){
        if(this.player)
            this.removeActor(this.player);
        this.player = player;
        this.addActor(this.player);
        var bar = this.player.hpBar, coordx = bar.getX(), coordy = bar.getY() + bar.height + 3, life;
        for(var i = 0; i < this.player.life.length; i++) {
            life = this.player.life[i];
            life.setX(coordx);
            life.setY(coordy);
            coordx += life.getWidth();
            this.miscContainer.addChild(life);
        }
    },
    getPlayer:function(){
        return this.player;  
    },
    addActor:function(actor) {
        this.actorContainer.addChild(actor);
        if(actor.hpBar)
            this.miscContainer.addChild(actor.hpBar);
        if(actor.mpBar)
            this.miscContainer.addChild(actor.mpBar);
        this.actors[actor.name] = actor;
    },
    _updateActor:function(actor, fps){
        actor.update(fps);
    },
    removeActor:function(actor) {
        this.actorContainer.removeChild(actor);
        delete this.actors[actor.name];
        if(actor.hpBar)
            this.miscContainer.removeChild(actor.hpBar);
        if(actor.mpBar)
            this.miscContainer.removeChild(actor.mpBar);
        var effects = actor.effects;
        for(var prop in effects)
            this.removeEffect(effects[prop]);
    },
    addEffect:function(effect) {
        this.effectContainer.addChild(effect);
        if(!effect.owner)
            this.effects[effect.name] = effect;
    },
    _updateEffect:function(effect, fps){
        effect.update(1.0 - ((fps - 60.0) / 60.0));
    },
    removeEffect:function(effect){
        this.effectContainer.removeChild(effect);
        if(!effect.owner)
            delete this.effects[effect.name];
    },
    addBullet:function(bullet) {
        this.bulletContainer.addChild(bullet);
        this.bullets[bullet.name] = bullet;
        this._updateRegionHashing(bullet);
    },
    _updateBullet:function(bullet, fps){
        bullet.update(fps);
        this._updateRegionHashing(bullet);
    },
    removeBullet:function(bullet){
        this.bulletContainer.removeChild(bullet);
        delete this.bullets[bullet.name];
        this._removeRegionHashing(bullet);
        for(var prop in bullet.effects){
            this.removeEffect(bullet.effects[prop]);
        }
    },
    _createBullet:function(actor, bulletType, random, target){
        var player = this.player;
        if(!player.isAlive)
            return;
        var bullet, effect;
        switch(bulletType){
            case BULLETS.BulletA:
                bullet = new BulletA(this.handler._system.getImage(IMAGE[BULLETS.BulletA]), actor, actor.name + '_' + actor.bulletType + '_' + actor.getGenId());
                actor.counters['bullet'] = {
                    count: 0,
                    threshold: 20
                };
                break;
            case BULLETS.BulletB:
                bullet = new BulletB(this.handler._system.getImage(IMAGE[BULLETS.BulletB]), actor, actor.name + '_' + actor.bulletType + '_' + actor.getGenId());
                break;
            case BULLETS.BulletC:
                if(!target)
                    return;
                bullet = new BulletC(this.handler._system.getImage(IMAGE[BULLETS.BulletC]), actor, actor.name + '_' + actor.bulletType + '_' + actor.getGenId(), target);
                effect = new Effect(null, this.handler.canvas, bullet, bullet.name + '_' + EFFECTS.SUPER_BULLET);
                this.handler.effectLoader.push('js/game/json/effect/' + EFFECTS.SUPER_BULLET + '.json', effect, 
                {
                    pos: {
                        x: bullet.getX(),
                        y: bullet.getY()
                    },
                    identifier: EFFECTS.SUPER_BULLET,
                    handler: this,
                    handle: 'addEffect'
                });
                this.handler.effectLoader.loadEffects();
                actor.counters['bullet'] = {
                    count: 0,
                    threshold: 40
                };
                break;
            case BULLETS.BulletD:
                bullet = new BulletB(this.handler._system.getImage(IMAGE[BULLETS.BulletD]), actor, actor.name + '_' + actor.bulletType + '_' + actor.getGenId());
                bullet.damage = 100;
                bullet.speedX = 0;
                bullet.speedY = 0;
                bullet.accel = 1.5;
                break;
            case BULLETS.BulletE:
                bullet = new BulletB(this.handler._system.getImage(IMAGE[BULLETS.BulletC]), actor, actor.name + '_' + actor.bulletType + '_' + actor.getGenId());
                bullet.speedX = 0;
                bullet.speedY = 0;
                bullet.accel = 2;
                effect = new Effect(null, this.handler.canvas, bullet, bullet.name + '_' + EFFECTS.REGIONAL_BOMB);
                this.handler.effectLoader.push('js/game/json/effect/' + EFFECTS.REGIONAL_BOMB + '.json', effect, 
                {
                    pos: {
                        x: bullet.getX(),
                        y: bullet.getY()
                    },
                    identifier: EFFECTS.REGIONAL_BOMB,
                    handler: this,
                    handle: 'addEffect'
                });
                this.handler.effectLoader.loadEffects();
                actor.counters['bullet'] = {
                    count: 0,
                    threshold: 60
                };
                break;
        }
        if(actor.name == player.name) {
            bullet.setPosition(actor.getX(), actor.getY() - ~~(actor.getHeight() >> 1));
            bullet.to(bullet.getX(), -1);
        } else {
            if(random) {
                var RANDM1TO1 = function(){
                    return Math.random() * 2.0 - 1.0;
                };
                var aw = actor.getWidth() >> 1, ah = actor.getHeight() >> 1, pw = player.getWidth() >> 1, ph = player.getHeight() >> 1;
                bullet.setPosition(actor.getX(), actor.getY() + ah);
                bullet.to(player.getX() - (~~pw) + (~~(pw * RANDM1TO1())), player.getY() - (~~ph) + (~~(ph * RANDM1TO1())));
            }else{
                bullet.setPosition(actor.getX(), actor.getY() + ~~(actor.getHeight() >> 1));
                bullet.to(player.getX(), player.getY());
            }
        }
        this.addBullet(bullet);
    },
    _addSceneActors:function(scene){
        if(scene.started) {
            var objs = scene.stage[0];
            for(var i = 0; i < objs.length; i++) {
                this.addActor(objs[i]);
            }
        }
    },
    _updateScene:function(fps){
        var scene = this.scenes[this.sceneIndex];
        if(scene.stage.length == 0) {
            if(this.sceneIndex < this.scenes.length - 1)
                scene = this.scenes[++this.sceneIndex];
        }
        if(scene){
            if(scene.boss && !scene.boss.isAlive) {
                this.handler.gameover();
            }
            if(!scene.started) {
                scene.setup();
                this._addSceneActors(scene);
                this.sceneCounter = 0;
            } else {
                if(this.sceneCounter++ == 60 * 10) {
                    if(scene.stage.length > 1) {
                        var prev = scene.stage.shift();
                        scene.started = false;
                        scene.setup();
                        this._addSceneActors(scene);
                        scene.stage[0] = prev.concat(scene.stage[0]);
                    }
                    this.sceneCounter = 0;
                }
            }
            scene.update(fps);
        }
    },
    lockon:function(actor){
        if(actor.centerInside(this.width, this.height)) {
            var locker, aw = actor.getWidth(), ah = actor.getHeight();
            locker = new Locker(null, 'locker' + this.handler.getGenId(), actor, aw * 2, ah * 2, aw, ah);
            this.lockers[locker.target.name] = locker;
            this.miscContainer.addChild(locker);
        }
    },
    lockonAll:function(){
        var prop, actor;
        for(prop in this.actors) {
            actor = this.actors[prop];
            if(actor.isAlive && !actor.itemType && actor.name != this.player.name && !this.lockers[actor.name]) {
                this.lockon(actor);
            }
        }
    },
    clearLockers:function(){
        var prop, locker;
        for(prop in this.lockers) {
            locker = this.lockers[prop];
            this.miscContainer.removeChild(locker);
        }
    },
    update:function(fps){
        this._updateScene(fps);
        
        if(this.background)
            this.background.update(fps);
        var RANDM1TO1 = function(){
            return Math.random() * 2.0 - 1.0;
        };
        var prop, actor, locker, bullet, i, w = this.width, h = this.height, effect, bulletExt, cnt, lck;
        for(prop in this.actors) {
            actor = this.actors[prop];
            if(!actor.getVisible() && actor.life && actor.life.length >= 1)
                actor.setVisible(true);
            if(actor.counters['bullet'] && actor.counterHit('bullet')) {
                for(i = 0; i < actor.maxBullets; i++)
                    this._createBullet(actor, actor.bulletType, actor.maxBullets > 1);
            }
            for(i = 0;; i++) {
                bulletExt = 'bullet' + i;
                if(actor.counters[bulletExt]) {
                    if(actor.counterHit(bulletExt))
                        this._createBullet(actor, actor.bulletMap[bulletExt]);
                } else
                    break;
            }
            this._updateActor(actor, fps);
            if(actor.name == this.player.name) {
                if((effect = this.player.getEffect(EFFECTS.ANNULUS_SHIELD)) && this.player.counterHit('shield')) {
                    delete this.player.effects[EFFECTS.ANNULUS_SHIELD];
                    this.removeEffect(effect);
                }
                if(this.player.counters['beam'] && this.player.counterHit('beam')) {
                    this.player.bulletType = BULLETS.BulletA;
                    this.clearLockers();
                }
                if(actor.counterHit('bullet') && this.player.bulletType == BULLETS.BulletC) {
                    this.lockonAll();
                    for(lck in this.lockers) {
                        locker = this.lockers[lck];
                        this._createBullet(actor, actor.bulletType, false, locker.target);
                        cnt++;
                    }
                }
            }
            if(actor.dead(w, h)) {
                this.removeActor(actor);
                actor.isAlive = false;
            }
        }
        for(prop in this.lockers){
            locker = this.lockers[prop];
            if(!locker.target.isAlive) {
                this.miscContainer.removeChild(locker);
                delete this.lockers[prop];
            } else {
                locker.update(fps);
            }
        }
        for(prop in this.bullets) {
            bullet = this.bullets[prop];
            if(bullet.dead(w, h))
                this.removeBullet(bullet);
            else
                this._updateBullet(bullet, fps);
        }
        for(prop in this.effects)
            this._updateEffect(this.effects[prop], fps);
        
        this._doCollisionDetection();
        
        if(this.player.life.length == 0)
            this.handler.gameover();
    }
});