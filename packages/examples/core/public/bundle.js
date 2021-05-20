(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var Paintable = /** @class */ (function () {
        function Paintable(canvas, initialOptions) {
            this.canvas = canvas;
            //optional options
            this.scaleFactor = 1;
            this.useEraser = false;
            this.thicknessEraser = 40;
            this.thickness = 10;
            this.color = '#000000';
            this.onLongPress = function () { };
            this.onSave = function () { };
            // internal state
            this.undoList = [];
            this.redoList = [];
            this.longPressTimer = null;
            this.lastPoint = null;
            this.canvasSaved = false;
            this.bounding = this.canvas.getBoundingClientRect();
            this.context = this.canvas.getContext('2d');
            this.width = initialOptions.width;
            this.canvas.width = this.width;
            this.height = initialOptions.height;
            this.canvas.height = this.height;
            this.active = initialOptions.active;
            if (initialOptions.scaleFactor !== undefined) {
                this.scaleFactor = initialOptions.scaleFactor;
            }
            if (initialOptions.useEraser !== undefined) {
                this.setUseEraser(initialOptions.useEraser);
            }
            if (initialOptions.thicknessEraser !== undefined) {
                this.setThicknessEraser(initialOptions.thicknessEraser);
            }
            if (initialOptions.thickness !== undefined) {
                this.setThickness(initialOptions.thickness);
            }
            if (initialOptions.color !== undefined) {
                this.setColor(initialOptions.color);
            }
            if (initialOptions.image !== undefined) {
                this.setImage(initialOptions.image);
            }
            if (initialOptions.onLongPress !== undefined) {
                this.onLongPress = initialOptions.onLongPress;
            }
            if (initialOptions.onSave !== undefined) {
                this.onSave = initialOptions.onSave;
            }
            this.usedLineWidth = this.useEraser ? this.thicknessEraser : this.thickness;
            this.setStyle();
            this.registerEvents();
        }
        Paintable.prototype.setColor = function (color) {
            this.color = color;
        };
        Paintable.prototype.setActive = function (active) {
            var wasActive = this.active;
            this.active = active;
            this.canvas.style.zIndex = this.active ? '9999' : '-10';
            if (wasActive && !this.active) {
                this.saveImage();
            }
        };
        Paintable.prototype.setScaleFactor = function (scaleFactor) {
            this.scaleFactor = scaleFactor;
        };
        Paintable.prototype.setUseEraser = function (useEraser) {
            this.useEraser = useEraser;
        };
        Paintable.prototype.setThickness = function (thickness) {
            if (thickness > 1) {
                this.thickness = thickness;
            }
            else {
                console.warn("Invalid thickness: thickness must be greater than 1. Received: " + thickness);
            }
        };
        Paintable.prototype.setThicknessEraser = function (thicknessEraser) {
            if (thicknessEraser > 1) {
                this.thicknessEraser = thicknessEraser;
            }
            else {
                console.warn("Invalid thicknessEraser: thicknessEraser must be greater than 1. Received: " + thicknessEraser);
            }
        };
        Paintable.prototype.setImage = function (image) {
            this.restoreCanvas(image);
        };
        Paintable.prototype.undo = function () {
            var undoCopy = __spreadArrays(this.undoList);
            var lastItem = undoCopy.pop();
            if (lastItem) {
                this.undoList = undoCopy;
                this.redoList = __spreadArrays(this.redoList, [this.canvas.toDataURL()]);
                this.restoreCanvas(lastItem);
            }
        };
        Paintable.prototype.redo = function () {
            var redoCopy = __spreadArrays(this.redoList);
            var lastItem = redoCopy.pop();
            if (lastItem) {
                this.undoList = __spreadArrays(this.undoList, [this.canvas.toDataURL()]);
                this.redoList = redoCopy;
                this.restoreCanvas(lastItem);
            }
        };
        Paintable.prototype.clearCanvas = function () {
            if (!this.isCanvasBlank()) {
                this.undoList = __spreadArrays(this.undoList, [this.canvas.toDataURL()]);
                this.redoList = [];
                this.context.clearRect(0, 0, this.width, this.height);
            }
        };
        Paintable.prototype.setStyle = function () {
            this.canvas.style.position = 'absolute';
            this.canvas.style.zIndex = this.active ? '9999' : '-10';
            this.canvas.style.backgroundColor = 'transparent';
        };
        Paintable.prototype.registerEvents = function () {
            this.canvas.addEventListener('mousedown', this.onDrawStart.bind(this));
            this.canvas.addEventListener('mousemove', this.onDrawMove.bind(this));
            this.canvas.addEventListener('mouseup', this.onDrawEnd.bind(this));
            this.canvas.addEventListener('mouseout', this.onDrawEnd.bind(this));
            this.canvas.addEventListener('touchstart', this.onDrawStart.bind(this));
            this.canvas.addEventListener('touchmove', this.onDrawMove.bind(this));
            this.canvas.addEventListener('touchend', this.onDrawEnd.bind(this));
        };
        Paintable.prototype.setDrawOptions = function () {
            this.context.globalCompositeOperation = this.useEraser
                ? 'destination-out'
                : 'source-over';
            this.usedLineWidth = this.useEraser ? this.thicknessEraser : this.thickness;
            this.context.fillStyle = this.color;
        };
        Paintable.prototype.onDrawStart = function (e) {
            this.startLongPressTimer();
            if (this.active) {
                this.setDrawOptions();
                var mousePosition = this.getMousePosition(e);
                this.lastPoint = mousePosition;
            }
        };
        Paintable.prototype.onDrawMove = function (e) {
            if (this.lastPoint && this.active) {
                if (!this.canvasSaved) {
                    this.undoList = __spreadArrays(this.undoList, [this.canvas.toDataURL()]);
                    this.redoList = [];
                    this.canvasSaved = true;
                }
                this.stopLongPressTimer();
                var mousePosition = this.getMousePosition(e);
                var dist = this.distanceBetween(this.lastPoint, mousePosition);
                var angle = this.angleBetween(this.lastPoint, mousePosition);
                for (var i = 0; i < dist; i += 1) {
                    var x = this.lastPoint.x + Math.sin(angle) * i;
                    var y = this.lastPoint.y + Math.cos(angle) * i;
                    this.context.beginPath();
                    this.context.arc(x, y, this.usedLineWidth / 2, 0, Math.PI * 2, false);
                    this.context.closePath();
                    this.context.fill();
                }
                this.lastPoint = mousePosition;
            }
        };
        Paintable.prototype.onDrawEnd = function () {
            if (this.active) {
                this.stopLongPressTimer();
                this.lastPoint = null;
                this.canvasSaved = false;
            }
        };
        Paintable.prototype.startLongPressTimer = function () {
            var _this = this;
            var timerId = setTimeout(function () {
                _this.longPressTimer = null;
                _this.onLongPress();
            }, 500);
            this.longPressTimer = timerId;
        };
        Paintable.prototype.stopLongPressTimer = function () {
            if (this.longPressTimer !== null) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        };
        Paintable.prototype.distanceBetween = function (point1, point2) {
            return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
        };
        Paintable.prototype.angleBetween = function (point1, point2) {
            return Math.atan2(point2.x - point1.x, point2.y - point1.y);
        };
        Paintable.prototype.saveImage = function () {
            this.undoList = [];
            this.redoList = [];
            var image = this.canvas.toDataURL();
            this.onSave(image);
        };
        Paintable.prototype.getMousePosition = function (e) {
            var rect = this.canvas.getBoundingClientRect();
            // use mouse as default
            var clientX = e.clientX;
            var clientY = e.clientY;
            // use first touch if available
            if (e.changedTouches &&
                e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            }
            // return mouse/touch position inside canvas
            return {
                x: ((clientX || 0) - rect.left) / this.scaleFactor,
                y: ((clientY || 0) - rect.top) / this.scaleFactor,
            };
        };
        Paintable.prototype.restoreCanvas = function (base64Image) {
            var _this = this;
            if (base64Image) {
                var image_1 = new Image();
                image_1.onload = function () {
                    _this.context.globalCompositeOperation = 'source-over';
                    _this.context.clearRect(0, 0, _this.width, _this.height);
                    _this.context.drawImage(image_1, 0, 0);
                };
                image_1.src = base64Image;
            }
        };
        Paintable.prototype.isCanvasBlank = function () {
            var pixelBuffer = new Uint32Array(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer);
            return !pixelBuffer.some(function (color) { return color !== 0; });
        };
        return Paintable;
    }());

    window.addEventListener('load', init);

    function init() {
      const canvas = document.getElementById('canvas');

      let active = false;
      let useEraser = false;
      let color = '#FF0000';
      let thickness = 5;

      const clearButton = document.getElementById('clearButton');
      const undoButton = document.getElementById('undoButton');
      const redoButton = document.getElementById('redoButton');
      const editButton = document.getElementById('editButton');
      const useEraserButton = document.getElementById('useEraserButton');
      const colorInput = document.getElementById('colorInput');
      colorInput.value = color;
      const rangeInput = document.getElementById('rangeInput');
      rangeInput.value = thickness;

      const paintable = new Paintable(canvas, {
        // required
        width: 1024,
        height: 768,
        active,

        // optional
        scaleFactor: 1,
        useEraser,
        thicknessEraser: 40,
        thickness,
        color,
        image: localStorage.getItem('/') || undefined,
        onLongPress: () => console.log('longPress'),
        onSave: (image) => localStorage.setItem('/', image),
      });

      editButton.addEventListener('click', function() {
        active = !active;
        paintable.setActive(active);
        editButton.innerText = active ? 'Save' : 'Edit';
      });

      useEraserButton.addEventListener('click', function() {
        useEraser = !useEraser;
        paintable.setUseEraser(useEraser);
        useEraserButton.innerText = useEraser ? 'use pencil' : 'use eraser';
      });

      colorInput.addEventListener('change', function(e) {
        color = e.target.value;
        paintable.setColor(color);
        colorInput.value = color;
      });

      rangeInput.addEventListener('change', function(e) {
        thickness = Number(e.target.value);
        console.log({ thickness });
        paintable.setThickness(thickness);
        rangeInput.value = thickness;
      });

      clearButton.addEventListener('click', function() {
        paintable.clearCanvas();
      });

      undoButton.addEventListener('click', function() {
        paintable.undo();
      });

      redoButton.addEventListener('click', function() {
        paintable.redo();
      });
    }

}());
