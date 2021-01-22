(function () {
  'use strict';

  // Copyright Joyent, Inc. and other Node contributors.

  var R = typeof Reflect === 'object' ? Reflect : null;
  var ReflectApply = R && typeof R.apply === 'function'
    ? R.apply
    : function ReflectApply(target, receiver, args) {
      return Function.prototype.apply.call(target, receiver, args);
    };

  var ReflectOwnKeys;
  if (R && typeof R.ownKeys === 'function') {
    ReflectOwnKeys = R.ownKeys;
  } else if (Object.getOwnPropertySymbols) {
    ReflectOwnKeys = function ReflectOwnKeys(target) {
      return Object.getOwnPropertyNames(target)
        .concat(Object.getOwnPropertySymbols(target));
    };
  } else {
    ReflectOwnKeys = function ReflectOwnKeys(target) {
      return Object.getOwnPropertyNames(target);
    };
  }

  function ProcessEmitWarning(warning) {
    if (console && console.warn) console.warn(warning);
  }

  var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
    return value !== value;
  };

  function EventEmitter() {
    EventEmitter.init.call(this);
  }
  var events = EventEmitter;
  var once_1 = once;

  // Backwards-compat with node 0.10.x
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._eventsCount = 0;
  EventEmitter.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  var defaultMaxListeners = 10;

  function checkListener(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
    }
  }

  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
        throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
      }
      defaultMaxListeners = arg;
    }
  });

  EventEmitter.init = function() {

    if (this._events === undefined ||
        this._events === Object.getPrototypeOf(this)._events) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
    }
    this._maxListeners = n;
    return this;
  };

  function _getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return _getMaxListeners(this);
  };

  EventEmitter.prototype.emit = function emit(type) {
    var args = [];
    for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
    var doError = (type === 'error');

    var events = this._events;
    if (events !== undefined)
      doError = (doError && events.error === undefined);
    else if (!doError)
      return false;

    // If there is no 'error' event listener then throw.
    if (doError) {
      var er;
      if (args.length > 0)
        er = args[0];
      if (er instanceof Error) {
        // Note: The comments on the `throw` lines are intentional, they show
        // up in Node's output if this results in an unhandled exception.
        throw er; // Unhandled 'error' event
      }
      // At least give some kind of context to the user
      var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
      err.context = er;
      throw err; // Unhandled 'error' event
    }

    var handler = events[type];

    if (handler === undefined)
      return false;

    if (typeof handler === 'function') {
      ReflectApply(handler, this, args);
    } else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        ReflectApply(listeners[i], this, args);
    }

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    checkListener(listener);

    events = target._events;
    if (events === undefined) {
      events = target._events = Object.create(null);
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener !== undefined) {
        target.emit('newListener', type,
                    listener.listener ? listener.listener : listener);

        // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object
        events = target._events;
      }
      existing = events[type];
    }

    if (existing === undefined) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
        // If we've already got an array, just append.
      } else if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }

      // Check for listener leak
      m = _getMaxListeners(target);
      if (m > 0 && existing.length > m && !existing.warned) {
        existing.warned = true;
        // No error code for this since it is a Warning
        // eslint-disable-next-line no-restricted-syntax
        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' ' + String(type) + ' listeners ' +
                            'added. Use emitter.setMaxListeners() to ' +
                            'increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        ProcessEmitWarning(w);
      }
    }

    return target;
  }

  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener =
      function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

  function onceWrapper() {
    if (!this.fired) {
      this.target.removeListener(this.type, this.wrapFn);
      this.fired = true;
      if (arguments.length === 0)
        return this.listener.call(this.target);
      return this.listener.apply(this.target, arguments);
    }
  }

  function _onceWrap(target, type, listener) {
    var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
    var wrapped = onceWrapper.bind(state);
    wrapped.listener = listener;
    state.wrapFn = wrapped;
    return wrapped;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    checkListener(listener);
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        checkListener(listener);
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // Emits a 'removeListener' event if and only if the listener was removed.
  EventEmitter.prototype.removeListener =
      function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        checkListener(listener);

        events = this._events;
        if (events === undefined)
          return this;

        list = events[type];
        if (list === undefined)
          return this;

        if (list === listener || list.listener === listener) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else {
            delete events[type];
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener || list[i].listener === listener) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0)
            return this;

          if (position === 0)
            list.shift();
          else {
            spliceOne(list, position);
          }

          if (list.length === 1)
            events[type] = list[0];

          if (events.removeListener !== undefined)
            this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };

  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

  EventEmitter.prototype.removeAllListeners =
      function removeAllListeners(type) {
        var listeners, events, i;

        events = this._events;
        if (events === undefined)
          return this;

        // not listening for removeListener, no need to emit
        if (events.removeListener === undefined) {
          if (arguments.length === 0) {
            this._events = Object.create(null);
            this._eventsCount = 0;
          } else if (events[type] !== undefined) {
            if (--this._eventsCount === 0)
              this._events = Object.create(null);
            else
              delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          var key;
          for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = Object.create(null);
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners !== undefined) {
          // LIFO order
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i]);
          }
        }

        return this;
      };

  function _listeners(target, type, unwrap) {
    var events = target._events;

    if (events === undefined)
      return [];

    var evlistener = events[type];
    if (evlistener === undefined)
      return [];

    if (typeof evlistener === 'function')
      return unwrap ? [evlistener.listener || evlistener] : [evlistener];

    return unwrap ?
      unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
  }

  EventEmitter.prototype.listeners = function listeners(type) {
    return _listeners(this, type, true);
  };

  EventEmitter.prototype.rawListeners = function rawListeners(type) {
    return _listeners(this, type, false);
  };

  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events = this._events;

    if (events !== undefined) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener !== undefined) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
  };

  function arrayClone(arr, n) {
    var copy = new Array(n);
    for (var i = 0; i < n; ++i)
      copy[i] = arr[i];
    return copy;
  }

  function spliceOne(list, index) {
    for (; index + 1 < list.length; index++)
      list[index] = list[index + 1];
    list.pop();
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }

  function once(emitter, name) {
    return new Promise(function (resolve, reject) {
      function eventListener() {
        if (errorListener !== undefined) {
          emitter.removeListener('error', errorListener);
        }
        resolve([].slice.call(arguments));
      }    var errorListener;

      // Adding an error listener is not optional because
      // if an error is thrown on an event emitter we cannot
      // guarantee that the actual event we are waiting will
      // be fired. The result could be a silent way to create
      // memory or file descriptor leaks, which is something
      // we should avoid.
      if (name !== 'error') {
        errorListener = function errorListener(err) {
          emitter.removeListener(name, eventListener);
          reject(err);
        };

        emitter.once('error', errorListener);
      }

      emitter.once(name, eventListener);
    });
  }
  events.once = once_1;

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
          // internal state
          this.undoList = [];
          this.redoList = [];
          this.longPressTimer = null;
          this.isDrawing = false;
          //optional options
          this.scaleFactor = 1;
          this.useEraser = false;
          this.thicknessEraser = 40;
          this.thickness = 10;
          this.color = '#000000';
          this.smooth = false;
          this.bounding = this.canvas.getBoundingClientRect();
          this.context = this.canvas.getContext('2d');
          this.width = initialOptions.width;
          this.canvas.width = this.width;
          this.height = initialOptions.height;
          this.canvas.height = this.height;
          this.active = initialOptions.active;
          if (initialOptions.scaleFactor) {
              this.scaleFactor = initialOptions.scaleFactor;
          }
          if (initialOptions.useEraser) {
              this.setUseEraser(initialOptions.useEraser);
          }
          if (initialOptions.thicknessEraser) {
              this.setThicknessEraser(initialOptions.thicknessEraser);
          }
          if (initialOptions.thickness) {
              this.setThickness(initialOptions.thickness);
          }
          if (initialOptions.color) {
              this.setColor(initialOptions.color);
          }
          if (initialOptions.smooth) {
              this.setSmooth(initialOptions.smooth);
          }
          if (initialOptions.image) {
              this.setImage(initialOptions.image);
          }
          this.setStyle();
          this.registerEvents();
          this.events = new events();
      }
      Paintable.prototype.setColor = function (color) {
          if (color === undefined) {
              return;
          }
          if (this.isHexColor(color)) {
              this.color = color;
          }
          else {
              console.warn("Invalid color: color must be a hex string. Received: " + color);
          }
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
          if (scaleFactor === undefined) {
              return;
          }
          this.scaleFactor = scaleFactor;
      };
      Paintable.prototype.setUseEraser = function (useEraser) {
          if (useEraser === undefined) {
              return;
          }
          this.useEraser = useEraser;
      };
      Paintable.prototype.setThickness = function (thickness) {
          if (thickness === undefined) {
              return;
          }
          if (thickness > 1) {
              this.thickness = thickness;
          }
          else {
              console.warn("Invalid thickness: thickness must be greater than 1. Received: " + thickness);
          }
      };
      Paintable.prototype.setThicknessEraser = function (thicknessEraser) {
          if (thicknessEraser === undefined) {
              return;
          }
          if (thicknessEraser > 1) {
              this.thicknessEraser = thicknessEraser;
          }
          else {
              console.warn("Invalid thicknessEraser: thicknessEraser must be greater than 1. Received: " + thicknessEraser);
          }
      };
      Paintable.prototype.setSmooth = function (smooth) {
          if (smooth === undefined) {
              return;
          }
          this.smooth = smooth;
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
      Paintable.prototype.isHexColor = function (color) {
          return /^#([0-9A-F]{3}){1,2}$/i.test(color);
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
      Paintable.prototype.setImage = function (image) {
          if (image === undefined || image === null) {
              return;
          }
          this.restoreCanvas(image);
      };
      Paintable.prototype.setDrawOptions = function () {
          this.context.globalCompositeOperation = this.useEraser
              ? 'destination-out'
              : 'source-over';
          this.context.lineWidth = this.useEraser
              ? this.thicknessEraser
              : this.smooth
                  ? this.thickness - 2
                  : this.thickness;
          // 9 because of #FFFFFF80 is already with alpha channel
          this.context.shadowColor =
              this.smooth && this.color.length !== 9 ? this.color + "80" : this.color;
          this.context.shadowBlur = this.smooth ? 2 : 0;
          this.context.strokeStyle = this.color;
          this.context.lineCap = 'round';
          this.context.lineJoin = 'round';
      };
      Paintable.prototype.onDrawStart = function (e) {
          this.startLongPressTimer();
          if (this.active) {
              this.setDrawOptions();
              var mousePosition = this.getMousePosition(e);
              this.undoList = __spreadArrays(this.undoList, [this.canvas.toDataURL()]);
              this.redoList = [];
              this.context.beginPath();
              this.context.moveTo(mousePosition.x, mousePosition.y);
              this.isDrawing = true;
          }
      };
      Paintable.prototype.onDrawMove = function (e) {
          if (this.isDrawing && this.active) {
              this.stopLongPressTimer();
              var mousePosition = this.getMousePosition(e);
              this.context.lineTo(mousePosition.x, mousePosition.y);
              this.context.stroke();
          }
      };
      Paintable.prototype.onDrawEnd = function () {
          if (this.active) {
              this.isDrawing = false;
          }
      };
      Paintable.prototype.startLongPressTimer = function () {
          var _this = this;
          var timerId = setTimeout(function () {
              _this.undoList = _this.undoList.slice(0, -1);
              _this.events.emit('longPress');
          }, 500);
          this.longPressTimer = timerId;
      };
      Paintable.prototype.stopLongPressTimer = function () {
          if (this.longPressTimer !== null) {
              clearTimeout(this.longPressTimer);
              this.longPressTimer = null;
          }
      };
      Paintable.prototype.saveImage = function () {
          this.undoList = [];
          this.redoList = [];
          var image = this.canvas.toDataURL();
          this.events.emit('save', image);
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
                  _this.context.shadowColor = _this.color;
                  _this.context.shadowBlur = 0;
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
    let smooth = false;
    let color = '#FF0000';
    let thickness = 5;

    const clearButton = document.getElementById('clearButton');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');
    const editButton = document.getElementById('editButton');
    const useEraserButton = document.getElementById('useEraserButton');
    const smoothCheckbox = document.getElementById('smoothCheckbox');
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
      smooth,
      color,
      image: localStorage.getItem('/'),
    });

    paintable.events.on('save', function(image) {
      localStorage.setItem('/', image);
    });

    paintable.events.on('longPress', function() {
      console.log('longpress');
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

    smoothCheckbox.addEventListener('change', function(e) {
      smooth = e.target.checked;
      paintable.setSmooth(smooth);
      smoothCheckbox.checked = smooth;
    });

    colorInput.addEventListener('change', function(e) {
      color = e.target.value;
      paintable.setColor(color);
      colorInput.value = color;
    });

    rangeInput.addEventListener('change', function(e) {
      thickness = Number(e.target.value);
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
