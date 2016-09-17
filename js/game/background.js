var Background = arc.Class.create(arc.display.DisplayObject, {
    initialize:function(data, canvas){
        this.data = data;
        this.context = canvas.getContext('2d');
        this.boundX = canvas.width;
        this.boundY = canvas.height;
        this.clipX = 0;
        this.clipY = 0;
        this.moveX = 1;
        this.moveY = 0;
        this.prevMoveX = this.moveX;
        this.prevMoveY = this.moveY;
        this.moveStep = 0.01;
        this.moveShift = 0.5 * this.boundY / this.data.getWidth();
    },
    update:function(fps){
        var movement = fps * this.moveStep;
        var w = this.data.getWidth(), h = this.data.getHeight();
        var x = this.clipX, y = this.clipY, bx = this.boundX, by = this.boundY;
        x += movement * this.moveX;
        y += movement * this.moveY;
        x = x >= w - bx ? w - bx : x <= 0 ? 0 : x;
        y = y >= h - by ? h - by : y <= 0 ? 0 : y;
        this.clipX = x;
        this.clipY = y;
        var rt = x == w - bx && y == 0 ? true : false,
        rb = x == w - bx && y == h - by ? true : false,
        lb = x == 0 && y == h - by ? true : false,
        lt = x == 0 && y == 0 ? true : false;
        var wid = this.moveShift * h;
        var gap = y / wid;
        var igap = parseInt(gap);
        var thresh = movement;
        var shift = y > thresh && y < h - by - thresh && (y - igap * wid <= thresh) && (x == 0 || x == w - bx) ? true : false;
            
        if(shift && !rt && !rb && !lb && !lt){
            if(x == w - bx) {
                if(this._movingDown() || this._movingUp()) {
                    this._moveLeft();
                } else if(this._movingRight()) {
                    if(this._prevMovingDown())
                        this._moveDown();
                    else if(this._prevMovingUp())
                        this._moveUp();
                }
            } else if(x == 0) {
                if(this._movingDown() || this._movingUp()) {
                    this._moveRight();
                } else if(this._movingLeft()) {
                    if(this._prevMovingDown())
                        this._moveDown();
                    else if(this._prevMovingUp())
                        this._moveUp();
                }
            }
        } else if(rt) {
            if(this._movingRight())
                this._moveDown();
            else if(this._movingUp())
                this._moveLeft();
        } else if(rb) {
            if(this._movingRight())
                this._moveUp();
            else if(this._movingDown())
                this._moveLeft();
        } else if(lb){
            if(this._movingLeft())
                this._moveUp();
            else if(this._movingDown())
                this._moveRight();
        } else if(lt){
            if(this._movingLeft())
                this._moveDown();
            else if(this._movingUp())
                this._moveRight();
        }
    },
    _prevMovingRight:function(){
        return this.prevMoveX == 1 && this.prevMoveY == 0;
    },
    _movingRight:function(){
        return this.moveX == 1 && this.moveY == 0;
    },
    _moveRight:function(){
        this.prevMoveX = this.moveX;
        this.prevMoveY = this.moveY;
        this.moveX = 1;
        this.moveY = 0;
    },
    _prevMovingDown:function(){
        return this.prevMoveX == 0 && this.prevMoveY == 1;
    },
    _movingDown:function(){
        return this.moveX == 0 && this.moveY == 1;
    },
    _moveDown:function(){
        this.prevMoveX = this.moveX;
        this.prevMoveY = this.moveY;
        this.moveX = 0;
        this.moveY = 1;
    },
    _prevMovingLeft:function(){
        return this.prevMoveX == -1 && this.prevMoveY == 0;
    },
    _movingLeft:function(){
        return this.moveX == -1 && this.moveY == 0;
    },
    _moveLeft:function(){
        this.prevMoveX = this.moveX;
        this.prevMoveY = this.moveY;
        this.moveX = -1;
        this.moveY = 0;
    },
    _prevMovingUp:function(){
        return this.prevMoveX == 0 && this.prevMoveY == -1;
    },
    _movingUp:function(){
        return this.moveX == 0 && this.moveY == -1;
    },
    _moveUp:function(){
        this.prevMoveX = this.moveX;
        this.prevMoveY = this.moveY;
        this.moveX = 0;
        this.moveY = -1;
    },
    draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
        var gAlpha = this.context.globalAlpha;
        this.context.globalAlpha = 1;
        this.context.drawImage(this.data._data, ~~this.clipX, ~~this.clipY, this.boundX, this.boundY, 0, 0, this.boundX, this.boundY);
        this.context.globalAlpha = gAlpha;
    }
});
