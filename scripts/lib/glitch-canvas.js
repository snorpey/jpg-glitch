//! glitch-canvas by snorpey, MIT License
(function(window, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        window.glitch = factory();
    }
})(this, function() {
    var canvas_1 = document.createElement("canvas");
    var canvas_2 = document.createElement("canvas");
    var ctx_1 = canvas_1.getContext("2d");
    var ctx_2 = canvas_2.getContext("2d");
    var base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64_map = base64_chars.split("");
    var reversed_base64_map = {};
    var params;
    var base64;
    var byte_array;
    var jpg_header_length;
    var img;
    var new_image_data;
    var i;
    var len;
    base64_map.forEach(function(val, key) {
        reversed_base64_map[val] = key;
    });
    function glitchImageData(image_data, parameters, callback) {
        if (isValidImageData(image_data) && checkType(parameters, "parameters", "object") && checkType(callback, "callback", "function")) {
            params = getNormalizedParameters(parameters);
            resizeCanvas(canvas_1, image_data);
            resizeCanvas(canvas_2, image_data);
            base64 = getBase64FromImageData(image_data, params.quality);
            byte_array = base64ToByteArray(base64);
            jpg_header_length = getJpegHeaderSize(byte_array);
            for (i = 0, len = params.iterations; i < len; i++) {
                glitchJpegBytes(byte_array, jpg_header_length, params.seed, params.amount, i, params.iterations);
            }
            img = new Image();
            img.onload = function() {
                ctx_1.drawImage(img, 0, 0);
                new_image_data = ctx_1.getImageData(0, 0, image_data.width, image_data.height);
                callback(new_image_data);
            };
            img.src = byteArrayToBase64(byte_array);
        }
    }
    function resizeCanvas(canvas, size) {
        if (canvas.width !== size.width) {
            canvas.width = size.width;
        }
        if (canvas.height !== size.height) {
            canvas.height = size.height;
        }
    }
    function glitchJpegBytes(byte_array, jpg_header_length, seed, amount, i, len) {
        var max_index = byte_array.length - jpg_header_length - 4;
        var px_min = parseInt(max_index / len * i, 10);
        var px_max = parseInt(max_index / len * (i + 1), 10);
        var delta = px_max - px_min;
        var px_i = parseInt(px_min + delta * seed, 10);
        if (px_i > max_index) {
            px_i = max_index;
        }
        var index = Math.floor(jpg_header_length + px_i);
        byte_array[index] = Math.floor(amount * 256);
    }
    function getBase64FromImageData(image_data, quality) {
        var q = typeof quality === "number" && quality < 1 && quality > 0 ? quality : .1;
        ctx_2.putImageData(image_data, 0, 0);
        var base64 = canvas_2.toDataURL("image/jpeg", q);
        switch (base64.length % 4) {
          case 3:
            base64 += "=";
            break;

          case 2:
            base64 += "==";
            break;

          case 1:
            base64 += "===";
            break;
        }
        return base64;
    }
    function getJpegHeaderSize(data) {
        var result = 417;
        for (i = 0, len = data.length; i < len; i++) {
            if (data[i] === 255 && data[i + 1] === 218) {
                result = i + 2;
                break;
            }
        }
        return result;
    }
    function base64ToByteArray(str) {
        var result = [];
        var digit_num;
        var cur;
        var prev;
        for (i = 23, len = str.length; i < len; i++) {
            cur = reversed_base64_map[str.charAt(i)];
            digit_num = (i - 23) % 4;
            switch (digit_num) {
              case 1:
                result.push(prev << 2 | cur >> 4);
                break;

              case 2:
                result.push((prev & 15) << 4 | cur >> 2);
                break;

              case 3:
                result.push((prev & 3) << 6 | cur);
                break;
            }
            prev = cur;
        }
        return result;
    }
    function byteArrayToBase64(arr) {
        var result = [ "data:image/jpeg;base64," ];
        var byte_num;
        var cur;
        var prev;
        for (i = 0, len = arr.length; i < len; i++) {
            cur = arr[i];
            byte_num = i % 3;
            switch (byte_num) {
              case 0:
                result.push(base64_map[cur >> 2]);
                break;

              case 1:
                result.push(base64_map[(prev & 3) << 4 | cur >> 4]);
                break;

              case 2:
                result.push(base64_map[(prev & 15) << 2 | cur >> 6]);
                result.push(base64_map[cur & 63]);
                break;
            }
            prev = cur;
        }
        if (byte_num === 0) {
            result.push(base64_map[(prev & 3) << 4]);
            result.push("==");
        } else if (byte_num === 1) {
            result.push(base64_map[(prev & 15) << 2]);
            result.push("=");
        }
        return result.join("");
    }
    function getImageDataCopy(image_data) {
        var copy = ctx_2.createImageData(image_data.width, image_data.height);
        copy.data.set(image_data.data);
        return copy;
    }
    function getNormalizedParameters(parameters) {
        return {
            seed: (parameters.seed || 0) / 100,
            quality: (parameters.quality || 0) / 100,
            amount: (parameters.amount || 0) / 100,
            iterations: parameters.iterations || 0
        };
    }
    function isValidImageData(image_data) {
        if (checkType(image_data, "image_data", "object") && checkType(image_data.width, "image_data.width", "number") && checkType(image_data.height, "image_data.height", "number") && checkType(image_data.data, "image_data.data", "object") && checkType(image_data.data.length, "image_data.data.length", "number") && checkNumber(image_data.data.length, "image_data.data.length", isPositive, "> 0")) {
            return true;
        } else {
            return false;
        }
    }
    function checkType(it, name, expected_type) {
        if (typeof it === expected_type) {
            return true;
        } else {
            error(it, "typeof " + name, '"' + expected_type + '"', '"' + typeof it + '"');
            return false;
        }
    }
    function checkNumber(it, name, condition, condition_name) {
        if (condition(it) === true) {
            return true;
        } else {
            error(it, name, condition_name, "not");
        }
    }
    function isPositive(nr) {
        return nr > 0;
    }
    function error(it, name, expected, result) {
        throw new Error("glitch(): Expected " + name + " to be " + expected + ", but it was " + result + ".");
    }
    return glitchImageData;
});