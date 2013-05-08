var Font = function() {
    this.image = new Image();
    this.image.src = "8x8font.png";
    this.image.onload = (function(f) {
        return function() { f.ready = true; };
    })(this);
    this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?\"#$%&\'()*+,-." +
                 "/:;<>=@[]^\\_`{}|~ ";
}

Font.prototype = {
    render: function(text, screen, x, y) {
        if(!this.ready)
            return;
        text = text.toUpperCase();
        for(var i = 0; i < text.length; i++) {
            var idx = this.chars.indexOf(text[i]);
            var xx = idx % 32;
            var yy = Math.floor(idx / 32);
            screen.drawImage(this.image, xx * 8, yy * 8, 8, 8, x + i * 8, y, 8, 8);
        }
    }
};

