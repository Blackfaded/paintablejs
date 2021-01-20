import EventEmitter from 'events';

interface MousePosition {
  x: number;
  y: number;
}

interface Options {
  // required
  width: number;
  height: number;
  active: boolean;

  //optional
  scaleFactor?: number;
  useEraser?: boolean;
  thicknessEraser?: number;
  thickness?: number;
  color?: string;
  smooth?: boolean;
  image?: string | null;
}

export class Paintable {
  bounding: DOMRect;
  context: CanvasRenderingContext2D;

  // internal state
  undoList: string[] = [];
  redoList: string[] = [];
  longPressTimer: any = null;
  isDrawing = false;

  // required options
  active: boolean;
  width: number;
  height: number;

  //optional options
  scaleFactor = 1;
  useEraser = false;
  thicknessEraser = 40;
  thickness: number = 10;
  color: string = '#000000';
  smooth = false;

  // events
  events: EventEmitter;
  drawStart: (e: MouseEvent | TouchEvent) => void;
  drawMove: (e: MouseEvent | TouchEvent) => void;
  drawEnd: () => void;

  constructor(private canvas: HTMLCanvasElement, initialOptions: Options) {
    this.bounding = this.canvas.getBoundingClientRect();
    this.context = this.canvas.getContext('2d')!;

    this.drawStart = this.onDrawStart.bind(this);
    this.drawMove = this.onDrawMove.bind(this);
    this.drawEnd = this.onDrawEnd.bind(this);

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
    this.events = new EventEmitter();
  }

  private isHexColor(color: string) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  }

  private setStyle() {
    this.canvas.style.position = 'absolute';
    this.canvas.style.zIndex = this.active ? '9999' : '-10';
    this.canvas.style.backgroundColor = 'transparent';
  }

  private registerEvents() {
    this.canvas.addEventListener('mousedown', this.drawStart);
    this.canvas.addEventListener('mousemove', this.drawMove);
    this.canvas.addEventListener('mouseup', this.drawEnd);
    this.canvas.addEventListener('mouseout', this.drawEnd);

    this.canvas.addEventListener('touchstart', this.drawStart);
    this.canvas.addEventListener('touchmove', this.drawMove);
    this.canvas.addEventListener('touchend', this.drawEnd);
  }

  setColor(color: string | undefined) {
    if (color === undefined) {
      return;
    }
    if (this.isHexColor(color)) {
      this.color = color;
    } else {
      console.warn(
        `Invalid color: color must be a hex string. Received: ${color}`
      );
    }
  }

  setActive(active: boolean) {
    const wasActive = this.active;
    this.active = active;
    this.canvas.style.zIndex = this.active ? '9999' : '-10';

    if (wasActive && !this.active) {
      this.saveImage();
    }
  }

  setScaleFactor(scaleFactor: number | undefined) {
    if (scaleFactor === undefined) {
      return;
    }
    this.scaleFactor = scaleFactor;
  }

  setUseEraser(useEraser: boolean | undefined) {
    if (useEraser === undefined) {
      return;
    }
    this.useEraser = useEraser;
  }

  setThickness(thickness: number | undefined) {
    if (thickness === undefined) {
      return;
    }
    if (thickness > 1) {
      this.thickness = thickness;
    } else {
      console.warn(
        `Invalid thickness: thickness must be greater than 1. Received: ${thickness}`
      );
    }
  }

  setThicknessEraser(thicknessEraser: number | undefined) {
    if (thicknessEraser === undefined) {
      return;
    }
    if (thicknessEraser > 1) {
      this.thicknessEraser = thicknessEraser;
    } else {
      console.warn(
        `Invalid thicknessEraser: thicknessEraser must be greater than 1. Received: ${thicknessEraser}`
      );
    }
  }

  setSmooth(smooth: boolean | undefined) {
    if (smooth === undefined) {
      return;
    }
    this.smooth = smooth;
  }

  setImage(image: string | undefined | null) {
    if (image === undefined || image === null) {
      return;
    }
    this.restoreCanvas(image);
  }

  setDrawOptions() {
    this.context.globalCompositeOperation = this.useEraser
      ? 'destination-out'
      : 'source-over';

    this.context.lineWidth = this.useEraser
      ? this.thicknessEraser
      : this.smooth
      ? this.thickness - 2
      : this.thickness;

    this.context.shadowColor = this.smooth ? `${this.color}80` : this.color;
    this.context.shadowBlur = this.smooth ? 2 : 0;

    this.context.strokeStyle = this.color;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
  }

  onDrawStart(e: MouseEvent | TouchEvent) {
    this.startLongPressTimer();

    if (this.active) {
      this.setDrawOptions();
      const mousePosition = this.getMousePosition(e);

      this.undoList = [...this.undoList, this.canvas.toDataURL()];
      this.redoList = [];

      this.context.beginPath();
      this.context.moveTo(mousePosition.x, mousePosition.y);
      this.isDrawing = true;
    }
  }

  onDrawMove(e: MouseEvent | TouchEvent) {
    if (this.isDrawing && this.active) {
      this.stopLongPressTimer();
      console.log('start');
      const mousePosition = this.getMousePosition(e);
      console.log({ mousePosition });
      this.context.lineTo(mousePosition.x, mousePosition.y);

      this.context.stroke();
    }
  }

  onDrawEnd() {
    if (this.active) {
      this.isDrawing = false;
    }
  }

  startLongPressTimer() {
    const timerId = setTimeout(() => {
      this.undoList = this.undoList.slice(0, -1);
      this.events.emit('longPress');
    }, 500);
    this.longPressTimer = timerId;
  }

  stopLongPressTimer() {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  saveImage() {
    this.undoList = [];
    this.redoList = [];
    const image = this.canvas.toDataURL();
    this.events.emit('save', image);
  }

  getMousePosition(e: MouseEvent | TouchEvent): MousePosition {
    const rect = this.canvas.getBoundingClientRect();

    // use cursor pos as default
    let clientX = (e as MouseEvent).clientX;
    let clientY = (e as MouseEvent).clientY;

    // use first touch if available
    if (
      (e as TouchEvent).changedTouches &&
      (e as TouchEvent).changedTouches.length > 0
    ) {
      clientX = (e as TouchEvent).changedTouches[0].clientX;
      clientY = (e as TouchEvent).changedTouches[0].clientY;
    }

    // return mouse/touch position inside canvas
    return {
      x: ((clientX || 0) - rect.left) / this.scaleFactor,
      y: ((clientY || 0) - rect.top) / this.scaleFactor,
    };
  }

  undo() {
    const undoCopy = [...this.undoList];
    const lastItem = undoCopy.pop();
    if (lastItem) {
      this.undoList = undoCopy;
      this.redoList = [...this.redoList, this.canvas.toDataURL()];
      this.restoreCanvas(lastItem);
    }
  }

  redo() {
    const redoCopy = [...this.redoList];
    const lastItem = redoCopy.pop();
    if (lastItem) {
      this.undoList = [...this.undoList, this.canvas.toDataURL()];
      this.redoList = redoCopy;
      this.restoreCanvas(lastItem);
    }
  }

  restoreCanvas(base64Image: string) {
    this.context.globalCompositeOperation = 'source-over';
    this.context.shadowColor = this.color;
    this.context.shadowBlur = 0;
    if (base64Image) {
      let image = new Image();
      image.onload = () => {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.drawImage(image, 0, 0);
      };
      image.src = base64Image;
    }
  }

  clearCanvas() {
    if (!this.isCanvasBlank()) {
      this.undoList = [...this.undoList, this.canvas.toDataURL()];
      this.redoList = [];
      this.context.clearRect(0, 0, this.width, this.height);
    }
  }

  isCanvasBlank() {
    const pixelBuffer = new Uint32Array(
      this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      ).data.buffer
    );

    return !pixelBuffer.some((color) => color !== 0);
  }
}
