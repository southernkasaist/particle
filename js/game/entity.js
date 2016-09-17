var Entity = arc.Class.create(arc.display.Sprite, {
    initialize:function(data, owner, name, hp, mp){
        this.owner = owner;
        this.name = name;
        this.hp = hp || 0;
        this.mp = mp || 0;
        this.effects = {};
        this.counters = {};
        this.genId = 0;
        this.isAlive = true;
        this.setAlign(arc.display.Align.CENTER);
        this.hpBar = this.hp ? new Bar(null, [0,255,0,1], [255,255,0,1], [255,0,0,1], data.getWidth(), 5) : null;
        this.mpBar = this.mp ? new Bar(null, [21,138,255,1], [21,138,255,1], [21,138,255,1], data.getWidth(), 5) : null;
        this.pause = false;
    },
    getGenId:function(){
        if(this.genId++ == 1000)
            this.genId = 0;
        return this.genId;
    },
    addEffect:function(name, effect) {
        this.effects[name] = effect;
    },
    removeEffect:function(name) {
        if(this.effects[name])
            delete this.effects[name];
    },
    getEffect:function(name) {
        return this.effects[name];
    },
    setPosition:function(x, y){
        this.setX(x), this.setY(y);
        var effect;
        for(var prop in this.effects){
            effect = this.effects[prop];
            effect.setPosition(x, y);
        }
    },
    updateCounters:function() {
        var prop, counter;
        for(prop in this.counters) {
            counter = this.counters[prop];
            counter.count = counter.count == counter.threshold ? 0 : counter.count;
            counter.count++;
        }
    },
    counterHit:function(name){
        var counter = this.counters[name];
        if(counter)
            return counter.count == counter.threshold;
        else
            return false;
    },
    outOfBound:function(boundx, boundy){
        var x = this.getX(), y = this.getY(), gw = this.getWidth() >> 1, gh = this.getHeight() >> 1, flag = 0x0;
        if(x < gw)
            flag |= 0x1;//left
        if(x + gw > boundx)
            flag |= 0x2;//right
        if(y < gh)
            flag |= 0x4;//up
        if(y + gh > boundy)
            flag |= 0x8;//down
        return flag;
    },
    centerInside:function(boundx, boundy){
        var x = this.getX(), y = this.getY();
        return x >= 0 && x <= boundx && y >= 0 && y <= boundy;
    },
    adjustPosition:function(boundx, boundy) {
        var hfw = this.getWidth() >> 1, hfh = this.getHeight() >> 1;
        var flag = this.outOfBound(boundx, boundy);
        if(flag & 0x1)
            this.setPosition(hfw, this.getY());
        if(flag & 0x2)
            this.setPosition(boundx - hfw, this.getY());
        if(flag & 0x4)
            this.setPosition(this.getX(), hfh);
        if(flag & 0x8)
            this.setPosition(this.getX(), boundy - hfh);
    },
    getDelta:function(fps){
        return 1.0 - ((fps - 60.0) / 60.0);
    }
});
var Fighter = arc.Class.create(Entity, {
    initialize:function(data, owner, name, hp, mp){
        this.bulletType = BULLETS.BulletB;
        this.damage = 10;
        this.defence = 0;
        this.counters = {
            'bullet': {
                count:0,
                threshold:80
            },
            'update':{
                count:0,
                threshold:2
            }
        };
        this.maxBullets = 1;
        this.bulletMap = {
            'bullet': BULLETS.BulletB
        };
        this.trackIndex = 0;
        this.trackPattern = null;
        this.track = [];
        this.dir = {
            x:0,
            y:0
        };
        this.speed = 0.8;
    },
    setPosition:function(x, y){
        this.setX(x), this.setY(y);
        this.hpBar.setPosition(x - (this.getWidth() >> 1), y - (this.getHeight() >> 1));
    },
    hitBullet:function(bullet){
        var damage = bullet.damage * (1.0 - this.defence);
        this.hp -= damage;
        this.hp = this.hp < 0 ? 0 : this.hp;
    },
    hitActor:function(actor){
    },
    dead:function(boundx, boundy){
        var y = this.getY(), gh = this.getHeight() >> 1;
        return y + 100 < 0 || y > boundy + 100;
    },
    startTrack:function(){
        var start = this.track[this.trackIndex];
        this.setPosition(start.x, start.y);
        this.updateTrack();
    },
    updateTrack:function(){
        var next = this.track[++this.trackIndex];
        var vx = next.x - this.getX(), vy = next.y - this.getY(), dist = Math.sqrt(vx*vx + vy*vy);
        this.dir.x = vx/dist, this.dir.y = vy/dist;
    },
    update:function(fps) {
        if(this.pause)
            return;
        
        this.updateCounters();
        var delta = this.getDelta(fps), prop;
        
        var next = this.track[this.trackIndex];
        var vx = next.x - this.getX(), vy = next.y - this.getY(), dist = Math.sqrt(vx*vx + vy*vy);
        if(dist <= 3) {
            if(this.trackIndex < this.track.length - 1) {
                this.updateTrack();
            } else if(this.trackPattern == 'repeat') {
                this.trackIndex = -1;
                this.updateTrack();
            }
        }
        this.setPosition(this.getX() + this.dir.x * this.speed, this.getY() + this.dir.y * this.speed);
        
        for(prop in this.effects)
            this.effects[prop].update(delta);
        this.hpBar.update(this.hp);
    }
});
var TieFighter = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
    }
});
var Tibirium = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.speed = 1.6;
    }
});
var XWing = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.speed = 1.6;
        this.defence = 0.2;
        this.counters['bullet'].threshold = 40;
    }
});
var YWing = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.speed = 1.6;
        this.defence = 0.4;
        this.counters['bullet'].threshold = 40;
    }
});
var DridStarFighter = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.speed = 1.6;
        this.defence = 0.2;
        this.counters['bullet'].threshold = 40;
    }
});
var RepublicCruiser = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.bulletType = BULLETS.BulletE;
        this.speed = 1.0;
        this.defence = 0.4;
        this.counters = {
            'bullet': {
                count:0,
                threshold:80
            },
            'update':{
                count:0,
                threshold:2
            }
        };
    }
});
var Corellian = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.speed = 1.6;
        this.defence = 0.6;
        this.counters = {
            'bullet': {
                count:0,
                threshold:60
            },
            'update':{
                count:0,
                threshold:2
            }
        };
        this.maxBullets = 3;
    }
});
var JediStarFighter = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.speed = 1.0;
        this.defence = 0.85;
        this.counters = {
            'bullet': {
                count:0,
                threshold:80
            },
            'bullet0': {
                count:0,
                threshold:180
            },
            'update':{
                count:0,
                threshold:2
            }
        };
        this.maxBullets = 6;
        this.bulletMap = {
            'bullet0': BULLETS.BulletD
        };
    }
});
var MilleniumFalcon = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.speed = 1.6;
        this.defence = 0.2;
        this.counters['bullet'].threshold = 40;
    }
});
var Asteroid1 = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.speed = 2.6;
        this.defence = 0.2;
        this.damage = 40;
        this.counters = {};
    }
});
var Asteroid2 = arc.Class.create(Fighter, {
    initialize:function(data, owner, name, hp, mp){
        this.speed = 3.6;
        this.defence = 0.2;
        this.damage = 50;
        this.counters = {};
    }
});

var Player = arc.Class.create(Entity, {
    initialize:function(data, owner, name, hp, mp, bulletType, life, lifeImg){
        this.bulletType = bulletType;
        this.maxBullets = 1;
        this.counters = {
            'bullet': {
                count:0,
                threshold:20
            },
            'hitActor': {
                count:0,
                threshold:30
            },
            'shield': {
                count: 0,
                threshold: 5 * 60
            },
            'beam': {
                count: 0,
                threshold: 10 * 60
            }
        };
        this.maxBullets = 1;
        this.onTouch = false;
        this.hpBar.width = lifeImg.getWidth() * 3;
        this.mpBar.width = this.hpBar.width;
        this.hpBar.setPosition(2, 2);
        this.mpBar.setPosition(this.hpBar.getX(), this.hpBar.getY() + this.hpBar.height);
        this.startX = null, this.startY = null;
        this.lifeImg = lifeImg;
        this.life = [];
        for(var i = 0; i < life; i++)
            this.life.push(new arc.display.Sprite(this.lifeImg));
    },
    setPosition:function(x, y){
        this.setX(x), this.setY(y);
        var effect;
        if((effect = this.getEffect(EFFECTS.BLUE_BEAM)))
            effect.setPosition(x, y - ~~(this.getHeight() >> 1));
        if((effect = this.getEffect(EFFECTS.ANNULUS_SHIELD)))
            effect.setPosition(x, y);
        if((effect = this.getEffect(EFFECTS.ENGINE_HEAT)))
            effect.setPosition(x, y + ~~(this.getHeight() / 4));
    },
    hitBullet:function(bullet){
        if(this.getEffect(EFFECTS.ANNULUS_SHIELD))
            this.hp -= 0;
        else
            this.hp -= bullet.damage;
        this.hp = this.hp < 0 ? 0 : this.hp;
    },
    hitActor:function(actor){
        if(this.counterHit('hitActor')) {
            if(this.getEffect(EFFECTS.ANNULUS_SHIELD))
                this.hp -= 0;
            else
                this.hp -= actor.damage;
            this.hp = this.hp < 0 ? 0 : this.hp;
        }
    },
    dead:function(boundx, boundy){
        return this.hp == 0;
    },
    update:function(fps) {
        this.updateCounters();
        this.hpBar.update(this.hp);
        this.mpBar.update(this.mp);
        var delta = this.getDelta(fps), prop;
        for(prop in this.effects)
            this.effects[prop].update(delta);
    }
});

var Item = arc.Class.create(Entity, {
    initialize:function(data, owner, name, hp, mp){
        this.counters = {
        };
        this.trackIndex = 0;
        this.track = [];
        this.dir = {
            x:0,
            y:0
        };
        this.hpBar = null;
        this.mpBar = null;
    },
    setPosition:function(x, y){
        this.setX(x), this.setY(y);
    },
    hitBullet:function(bullet){
    },
    hitActor:function(actor){
    },
    dead:function(boundx, boundy){
        var y = this.getY(), gh = this.getHeight() >> 1;
        return y > boundy + gh;
    },
    startTrack:function(){
        var start = this.track[this.trackIndex];
        this.setPosition(start.x, start.y);
        this.updateTrack();
    },
    updateTrack:function(){
        var next = this.track[++this.trackIndex];
        var vx = next.x - this.getX(), vy = next.y - this.getY(), dist = Math.sqrt(vx*vx + vy*vy);
        this.dir.x = vx/dist, this.dir.y = vy/dist;
    },
    update:function(fps) {
        if(this.pause)
            return;
        
        this.updateCounters();
        var delta = this.getDelta(fps), prop;
        
        var next = this.track[this.trackIndex];
        var vx = next.x - this.getX(), vy = next.y - this.getY(), dist = Math.sqrt(vx*vx + vy*vy);
        if(dist <= 3) {
            if(this.trackIndex < this.track.length - 1) {
                this.updateTrack();
            }
        }
        this.setPosition(this.getX() + this.dir.x * 2, this.getY() + this.dir.y * 2);
        
        for(prop in this.effects)
            this.effects[prop].update(delta);
    }
});
var BeamGun = arc.Class.create(Item, {
    initialize:function(data, owner, name, hp, mp){
        this.itemType = ITEMS.BEAM_GUN;
    }
});
var Shield = arc.Class.create(Item, {
    initialize:function(data, owner, name, hp, mp){
        this.itemType = ITEMS.SHIELD;
    }
});
var Life = arc.Class.create(Item, {
    initialize:function(data, owner, name, hp, mp){
        this.itemType = ITEMS.LIFE;
    }
});

var Bullet = arc.Class.create(Entity, {
    initialize:function(data, owner, name){
        this.damage = 10;
        this.accel = 0.0;
        this.dirX = 0;
        this.dirY = 0;
        this.speedX = 10;
        this.speedY = 10;
        this.counters = {
            'update': {
                count:0, 
                threshold:1
            }
        };
    },
    to:function(x, y) {
        var dx = x - this.getX(), dy = y - this.getY();
        if(dx == 0 && dy == 0){
            this.dirX = 0;
            this.dirY = 0;
        } else {
            var len = Math.sqrt(dx * dx + dy * dy);
            this.dirX = dx / len;
            this.dirY = dy / len;
        }
    },
    dead:function(boundx, boundy){
        return this.outOfBound(boundx, boundy);
    },
    update:function(fps) {
        if(this.pause)
            return;
        
        this.updateCounters();
        if(this.counterHit('update')) {
            var delta = this.getDelta(fps);
            this.speedX += delta * this.accel;
            this.speedY += delta * this.accel;
            this.setPosition(this.getX() + this.dirX * this.speedX, this.getY() + this.dirY * this.speedY);
            for(var prop in this.effects)
                this.effects[prop].update(delta);
        }
    }
});

var BulletA = arc.Class.create(Bullet, {
    initialize:function(data, owner, name){
        this.damage = 20;
        this.accel = 0.1;
        this.dirX = 0;
        this.dirY = 0;
        this.speedX = 15;
        this.speedY = 15;
        this.counters = {
            'update': {
                count:0,
                threshold:2
            }
        };
    }
});
var BulletB = arc.Class.create(Bullet, {
    initialize:function(data, owner, name){
        this.damage = 15;
        this.accel = 0.0;
        this.dirX = 0;
        this.dirY = 0;
        this.speedX = 6;
        this.speedY = 6;
        this.counters = {
            'update': {
                count:0, 
                threshold:2
            }
        };
    }
});
var BulletC = arc.Class.create(Bullet, {
    initialize:function(data, owner, name, target){
        this.target = target;
        this.damage = 20;
        this.accel = 1.0;
        this.dirX = 0;
        this.dirY = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.counters = {
            'update': {
                count:0, 
                threshold:2
            }
        };
    },
    update:function(fps) {
        if(this.pause)
            return;
        
        this.to(this.target.getX(), this.target.getY());
        this.setPosition(this.getX(), this.getY());
        this.updateCounters();
        if(this.counterHit('update')) {
            var delta = this.getDelta(fps);
            this.speedX += delta * this.accel;
            this.speedY += delta * this.accel;
            this.setPosition(this.getX() + this.dirX * this.speedX, this.getY() + this.dirY * this.speedY);
            for(var prop in this.effects)
                this.effects[prop].update(delta);
        }
    }
});