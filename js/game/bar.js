var Bar = arc.Class.create(arc.display.DisplayObject, {
    initialize:function(data, startColor, midColor, endColor, width, height){
        this.startColor = startColor;
        this.midColor = midColor;
        this.endColor = endColor;
        this.width = width || 0;
        this.height = height || 5;
        this.val = this.width;
        this.drawColor = this.getDrawColor(this.startColor);
        this.context = arc.display.Image.context;
    },
    setPosition:function(x, y){
        this.setX(x), this.setY(y);
    },
    getDrawColor: function(color) {
        var draw = [];
        draw.push("rgba(" + ( color[0] > 255 ? 255 : color[0] < 0 ? 0 : ~~color[0] ) );
        draw.push( color[1] > 255 ? 255 : color[1] < 0 ? 0 : ~~color[1] );
        draw.push( color[2] > 255 ? 255 : color[2] < 0 ? 0 : ~~color[2] );
        draw.push( (color[3] > 1 ? 1 : color[3] < 0 ? 0 : color[3].toFixed( 2 ) ) + ")");
        return draw.join(",");
    },
    update: function(val){
        var color = val > 66 ? this.startColor : val > 33 ? this.midColor : this.endColor;
        this.drawColor = this.getDrawColor(color);
        this.val = ~~(this.width * val / 100);
    },
    draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
        var ctx = this.context, x = this.getX(), y = this.getY();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.drawColor;
        ctx.fillRect(x, y, this.val, this.height);
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.strokeRect(x, y, this.width, this.height);
    }
});