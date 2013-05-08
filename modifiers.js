function calcSpinOffset() {
    offx = (cwidth - width * scale) / 2;
    offy = (cheight - height * scale) / 2;
}

function rotate(context, ang) {
    context.translate(cwidth / 2, cheight / 2);
    context.rotate(ang);
    context.translate(-cwidth / 2, -cheight / 2);
}

// 0MG PRO SKILLZZZZ
var shakecanvas = null;
var shakectx = null;
var shakex = 11;
var shakey = 0;
var shakedx = 0;
var shakedy = 0;
function shake() {
    if(shakecanvas == null || shakectx == null) {
        shakecanvas = document.createElement('canvas');
        shakecanvas.width = width;
        shakecanvas.height = height;
        shakectx = shakecanvas.getContext('2d');
    }
    shakex += shakedx;
    shakey += shakedy;
    var a = Math.atan2(shakey, shakex);
    var r = Math.sqrt(shakex*shakex + shakey*shakey);
    if(r > 10) {
        var b = a + Math.random() * Math.PI/2 + Math.PI/2;
        shakedx = 10 * Math.cos(b);
        shakedy = 10 * Math.sin(b);
    }
    shakectx.translate(-shakex, -shakey);
    shakectx.drawImage(framebuffer, 0, 0);
    shakectx.translate(+shakex, +shakey);
    screen.drawImage(shakecanvas, 0, 0);
}

var hoff = 0;
var dh = 0.005;
function colorize() {
    hoff += dh;
    if(hoff > 1) {
        hoff = 0;
    }
    var imgd = screen.getImageData(0, 0, width, height);
    var pix = imgd.data;
    for(var i = 0; i < pix.length; i += 4) {
        if(pix[i] == 0 && pix[i+1] == 0 && pix[i+2] == 0)
            continue;
        var hsl = rgbToHsl(pix[i], pix[i+1], pix[i+2]);
        hsl[0] = hsl[0] + hoff;
        if(hsl[0] > 1) hsl[0] -= 1.0;
        var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        pix[i] = rgb[0];
        pix[i+1] = rgb[1];
        pix[i+2] = rgb[2];
    }
    screen.putImageData(imgd, 0, 0);
}

var splitcanvas = null;
var splitctx = null;
function horizsplit() {
    if(splitcanvas == null || splitctx == null) {
        splitcanvas = document.createElement('canvas');
        splitcanvas.width = width;
        splitcanvas.height = height;
        splitctx = splitcanvas.getContext('2d');
    }
    splitctx.translate(-width / 2, 0);
    splitctx.drawImage(framebuffer, 0, 0);
    splitctx.translate(width, 0);
    splitctx.drawImage(framebuffer, 0, 0);
    splitctx.translate(-width / 2, 0);
    screen.drawImage(splitcanvas, 0, 0);
}

function vertsplit() {
    if(splitcanvas == null || splitctx == null) {
        splitcanvas = document.createElement('canvas');
        splitcanvas.width = width;
        splitcanvas.height = height;
        splitctx = splitcanvas.getContext('2d');
    }
    splitctx.translate(0, -height / 2);
    splitctx.drawImage(framebuffer, 0, 0);
    splitctx.translate(0, height);
    splitctx.drawImage(framebuffer, 0, 0);
    splitctx.translate(0, -height / 2);
    screen.drawImage(splitcanvas, 0, 0);
}


// Color stuff
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}
