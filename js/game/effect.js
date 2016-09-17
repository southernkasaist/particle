var Effect = arc.Class.create(arc.display.ParticleEmitter, {
    initialize:function(texture, canvas, owner, name){
        this.owner = owner;
        this.name = name;
    }
});

var EffectLoader = arc.Class.create(arc.Ajax, {
    initialize:function(){
        this.effects = [];
        this.effectIdx = 0;
        var self = this;
        this.addEventListener(arc.Event.COMPLETE, function(){
            var obj = this.effects[this.effectIdx];
            var e = obj.effect, p = obj.params;
            e.loadFromJSON(self.getResponseJSON());
            e.setPosition(p.pos.x, p.pos.y);
            if(e.owner)
                e.owner[p.handle](p.identifier, e);
            p.handler[p.handle](e);
            self.unload();
            if(this.effectIdx == this.effects.length - 1) {
                this.effects = [];
                this.effectIdx = 0;
            } else {
                self.load(this.effects[++this.effectIdx].url);
            }
        });
    },
    push:function(url, effect, params){
        this.effects.push({
            url:url, 
            effect:effect, 
            params:params
        });
    },
    loadEffects:function(){
        this.load(this.effects[this.effectIdx].url);
    },
    effectsLoaded:function(){
        return this.effects.length == 0;
    }
});