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
  private undoList: string[] = [];
  private redoList: string[] = [];
  private longPressTimer: any = null;

  // required options
  private active: boolean;
  private width: number;
  private height: number;

  //optional options
  private scaleFactor = 1;
  private useEraser = false;
  private thicknessEraser = 40;
  private thickness: number = 10;
  private color: string = '#000000';
  private smooth = false;

  private points: MousePosition[] = [];

  // events
  events: EventEmitter;

  constructor(private canvas: HTMLCanvasElement, initialOptions: Options) {
    this.bounding = this.canvas.getBoundingClientRect();
    this.context = this.canvas.getContext('2d')!;
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

  clearCanvas() {
    if (!this.isCanvasBlank()) {
      this.undoList = [...this.undoList, this.canvas.toDataURL()];
      this.redoList = [];
      this.context.clearRect(0, 0, this.width, this.height);
    }
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
    this.canvas.addEventListener('mousedown', this.onDrawStart.bind(this));
    this.canvas.addEventListener('mousemove', this.onDrawMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onDrawEnd.bind(this));
    this.canvas.addEventListener('mouseout', this.onDrawEnd.bind(this));

    this.canvas.addEventListener('touchstart', this.onDrawStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onDrawMove.bind(this));
    this.canvas.addEventListener('touchend', this.onDrawEnd.bind(this));
  }

  private setImage(image: string | undefined | null) {
    if (image === undefined || image === null) {
      return;
    }
    this.restoreCanvas(image);
  }
  usedLineWidth = this.thickness;

  private setDrawOptions() {
    this.context.globalCompositeOperation = this.useEraser
      ? 'destination-out'
      : 'source-over';

    this.usedLineWidth = this.useEraser
      ? this.thicknessEraser
      : this.smooth
      ? this.thickness - 2
      : this.thickness;

    // 9 because of #FFFFFF80 is already with alpha channel
    this.context.shadowColor =
      this.smooth && this.color.length !== 9 ? `${this.color}80` : this.color;
    this.context.shadowBlur = this.smooth ? 2 : 0;

    this.context.fillStyle = this.color;
  }
  lastPoint: MousePosition | null = null;

  private onDrawStart(e: MouseEvent | TouchEvent) {
    this.startLongPressTimer();

    if (this.active) {
      this.setDrawOptions();
      const mousePosition = this.getMousePosition(e);

      this.undoList = [...this.undoList, this.canvas.toDataURL()];
      this.redoList = [];
      this.lastPoint = mousePosition;
    }
  }

  distanceBetween(point1: MousePosition, point2: MousePosition) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }
  angleBetween(point1: MousePosition, point2: MousePosition) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }

  private onDrawMove(e: MouseEvent | TouchEvent) {
    if (this.lastPoint && this.active) {
      this.stopLongPressTimer();
      const mousePosition = this.getMousePosition(e);

      const dist = this.distanceBetween(this.lastPoint, mousePosition);
      const angle = this.angleBetween(this.lastPoint, mousePosition);

      for (let i = 0; i < dist; i += 1) {
        const x = this.lastPoint.x + Math.sin(angle) * i;
        const y = this.lastPoint.y + Math.cos(angle) * i;
        this.context.shadowBlur = 1;
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.beginPath();
        this.context.fillStyle = 'red';
        this.context.arc(x, y, this.usedLineWidth / 2, 0, Math.PI * 2, false);
        this.context.closePath();
        this.context.fill();
      }

      this.lastPoint = mousePosition;
    }
  }

  private onDrawEnd() {
    if (this.active) {
      this.lastPoint = null;
    }
  }

  private startLongPressTimer() {
    const timerId = setTimeout(() => {
      this.undoList = this.undoList.slice(0, -1);
      this.longPressTimer = null;
      this.events.emit('longPress');
    }, 500);
    this.longPressTimer = timerId;
  }

  private stopLongPressTimer() {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private saveImage() {
    this.undoList = [];
    this.redoList = [];
    const image = this.canvas.toDataURL();
    this.events.emit('save', image);
  }

  private getMousePosition(e: MouseEvent | TouchEvent): MousePosition {
    const rect = this.canvas.getBoundingClientRect();

    // use mouse as default
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

  private restoreCanvas(base64Image: string) {
    if (base64Image) {
      let image = new Image();
      image.onload = () => {
        this.context.globalCompositeOperation = 'source-over';
        this.context.shadowColor = this.color;
        this.context.shadowBlur = 0;
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.drawImage(image, 0, 0);
      };
      image.src = base64Image;
    }
  }

  private isCanvasBlank() {
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
