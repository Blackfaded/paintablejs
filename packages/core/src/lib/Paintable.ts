interface MousePosition {
  x: number;
  y: number;
}

export interface PaintableOptions {
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
  image?: string;
  onLongPress?: () => void;
  onSave?: (image: string) => void;
}

export class Paintable {
  bounding: DOMRect;
  context: CanvasRenderingContext2D;

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
  private onLongPress: () => void = () => {};
  private onSave: (image: string) => void = () => {};

  // internal state
  private undoList: string[] = [];
  private redoList: string[] = [];
  private longPressTimer: any = null;
  private lastPoint: MousePosition | null = null;
  private usedLineWidth;
  private canvasSaved = false;

  constructor(
    private canvas: HTMLCanvasElement,
    initialOptions: PaintableOptions
  ) {
    this.bounding = this.canvas.getBoundingClientRect();
    this.context = this.canvas.getContext('2d')!;
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

  setColor(color: string) {
    this.color = color;
  }

  setActive(active: boolean) {
    const wasActive = this.active;
    this.active = active;
    this.canvas.style.zIndex = this.active ? '9999' : '-10';

    if (wasActive && !this.active) {
      this.saveImage();
    }
  }

  setScaleFactor(scaleFactor: number) {
    this.scaleFactor = scaleFactor;
  }

  setUseEraser(useEraser: boolean) {
    this.useEraser = useEraser;
  }

  setThickness(thickness: number) {
    if (thickness > 1) {
      this.thickness = thickness;
    } else {
      console.warn(
        `Invalid thickness: thickness must be greater than 1. Received: ${thickness}`
      );
    }
  }

  setThicknessEraser(thicknessEraser: number) {
    if (thicknessEraser > 1) {
      this.thicknessEraser = thicknessEraser;
    } else {
      console.warn(
        `Invalid thicknessEraser: thicknessEraser must be greater than 1. Received: ${thicknessEraser}`
      );
    }
  }

  private setImage(image: string) {
    this.restoreCanvas(image);
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

  private setDrawOptions() {
    this.context.globalCompositeOperation = this.useEraser
      ? 'destination-out'
      : 'source-over';

    this.usedLineWidth = this.useEraser ? this.thicknessEraser : this.thickness;

    this.context.fillStyle = this.color;
  }

  private onDrawStart(e: MouseEvent | TouchEvent) {
    this.startLongPressTimer();

    if (this.active) {
      this.setDrawOptions();
      const mousePosition = this.getMousePosition(e);

      this.lastPoint = mousePosition;
    }
  }

  private onDrawMove(e: MouseEvent | TouchEvent) {
    if (this.lastPoint && this.active) {
      if (!this.canvasSaved) {
        this.undoList = [...this.undoList, this.canvas.toDataURL()];
        this.redoList = [];
        this.canvasSaved = true;
      }
      this.stopLongPressTimer();
      const mousePosition = this.getMousePosition(e);

      const dist = this.distanceBetween(this.lastPoint, mousePosition);
      const angle = this.angleBetween(this.lastPoint, mousePosition);

      for (let i = 0; i < dist; i += 1) {
        const x = this.lastPoint.x + Math.sin(angle) * i;
        const y = this.lastPoint.y + Math.cos(angle) * i;
        this.context.beginPath();
        this.context.arc(x, y, this.usedLineWidth / 2, 0, Math.PI * 2, false);
        this.context.closePath();
        this.context.fill();
      }

      this.lastPoint = mousePosition;
    }
  }

  private onDrawEnd() {
    if (this.active) {
      this.stopLongPressTimer();
      this.lastPoint = null;
      this.canvasSaved = false;
    }
  }

  private startLongPressTimer() {
    const timerId = setTimeout(() => {
      this.longPressTimer = null;
      this.onLongPress();
    }, 500);
    this.longPressTimer = timerId;
  }

  private stopLongPressTimer() {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private distanceBetween(point1: MousePosition, point2: MousePosition) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }
  private angleBetween(point1: MousePosition, point2: MousePosition) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }

  private saveImage() {
    this.undoList = [];
    this.redoList = [];
    const image = this.canvas.toDataURL();
    this.onSave(image);
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
