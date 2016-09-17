var Locker = arc.Class.create(arc.display.DisplayObject, {
    initialize:function(data, name, target, startWidth, startHeight, endWidth, endHeight){
        this.name = name;
        this.target = target;
        this.startWidth = startWidth;
        this.startHeight = startHeight;
        this.endWidth = endWidth;
        this.endHeight = endHeight;
        this.width = this.startWidth;
        this.height = this.startHeight;
        this.widthDelta = (this.endWidth - this.startWidth) / 100;
        this.heightDelta = (this.endHeight - this.startHeight) / 100;
        this.context = arc.display.Image.context;
        this.setPosition(target.getX(), target.getY());
    },
    setPosition:function(x, y){
        this.setX(x), this.setY(y);
    },
    locked:function(){
        return this.width == this.target.getWidth() && this.height == this.target.getHeight();
    },
    update: function(fps){
        var target = this.target;
        this.setPosition(target.getX() - (this.width >> 1), target.getY() - (this.height >> 1));
        if(this.locked())
            return;
        var delta = (1.0 - ((fps - 60.0) / 60.0)) * 5;
        this.width += this.widthDelta * delta;
        this.height += this.heightDelta * delta;
        if(Math.abs(this.width - target.getWidth()) <= 10)
            this.width = target.getWidth();
        if(Math.abs(this.height - target.getHeight()) <= 10)
            this.height = target.getHeight();
    },
    draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
        var ctx = this.context, x = this.getX(), y = this.getY() - ~~(this.target.getHeight()/8);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        var lineWidth = ctx.lineWidth;
        ctx.lineWidth = 2;
        var strokeStyle = ctx.strokeStyle;
        ctx.strokeStyle = this.locked() ? 'rgba(255,0,0,1)' : 'rgba(0,255,0,1)';
        ctx.beginPath();
        var w = ~~this.width, h = ~~this.height, wq = ~~(w/4), hq = ~~(h/4);
        ctx.moveTo(x, y + hq);
        ctx.lineTo(x, y);
        ctx.lineTo(x + wq, y);
        ctx.moveTo(x + w - wq, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + hq);
        ctx.moveTo(x + w, y + h - hq);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w - wq, y + h);
        ctx.moveTo(x + wq, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + h - hq);
        ctx.stroke();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
    }
});