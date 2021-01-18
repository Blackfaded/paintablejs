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
  image?: string | null;
}

export class PaintableClass {
  bounding: DOMRect;
  context: CanvasRenderingContext2D;
  undoList: string[] = [];
  redoList: string[] = [];
  longPressTimer: NodeJS.Timeout | null = null;
  isDrawing = false;

  // options
  active: boolean;

  //optional options
  scaleFactor = 1;
  useEraser = false;
  thicknessEraser = 40;
  thickness: number = 10;
  color: string = 'black';

  // events
  events: EventEmitter;
  moveEvent: (e: any) => void;
  startEvent: (e: any) => void;
  endEvent: (e: any) => void;

  constructor(private canvas: HTMLCanvasElement, initialOptions: Options) {
    this.bounding = this.canvas.getBoundingClientRect();
    this.context = this.canvas.getContext('2d')!;

    this.startEvent = this.onDrawStart.bind(this);
    this.moveEvent = this.onDrawMove.bind(this);
    this.endEvent = this.onDrawEnd.bind(this);

    this.setWidth(initialOptions.width);
    this.setHeight(initialOptions.height);
    this.active = initialOptions.active;

    if (initialOptions.scaleFactor) {
      this.scaleFactor = initialOptions.scaleFactor;
    }

    if (initialOptions.useEraser) {
      this.useEraser = initialOptions.useEraser;
    }

    if (initialOptions.thicknessEraser) {
      this.thicknessEraser = initialOptions.thicknessEraser;
    }

    if (initialOptions.thickness) {
      this.thickness = initialOptions.thickness;
    }

    if (initialOptions.color) {
      this.color = initialOptions.color;
    }

    if (initialOptions.image) {
      this.setImage(initialOptions.image);
    }

    this.setStyle();
    this.registerEvents();
    this.events = new EventEmitter();
  }

  private setStyle() {
    this.canvas.style.position = 'absolute';
    this.canvas.style.zIndex = this.active ? '9999' : '-10';
    this.canvas.style.backgroundColor = 'transparent';
  }

  private registerEvents() {
    this.canvas.removeEventListener('mousedown', this.startEvent);
    this.canvas.removeEventListener('mousemove', this.moveEvent);
    this.canvas.removeEventListener('mouseup', this.endEvent);
    this.canvas.removeEventListener('mouseout', this.endEvent);

    this.canvas.removeEventListener('touchstart', this.startEvent);
    this.canvas.removeEventListener('touchmove', this.moveEvent);
    this.canvas.removeEventListener('touchend', this.endEvent);

    this.canvas.addEventListener('mousedown', this.startEvent);
    this.canvas.addEventListener('mousemove', this.moveEvent);
    this.canvas.addEventListener('mouseup', this.endEvent);
    this.canvas.addEventListener('mouseout', this.endEvent);

    this.canvas.addEventListener('touchstart', this.startEvent);
    this.canvas.addEventListener('touchmove', this.moveEvent);
    this.canvas.addEventListener('touchend', this.endEvent);
  }

  private setWidth(width: number) {
    this.canvas.width = width;
  }

  private setHeight(height: number) {
    this.canvas.height = height;
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

  setUseEraser(useEraser: boolean) {
    this.useEraser = useEraser;
  }

  setThickness(thickness: number) {
    this.thickness = thickness;
  }

  setThicknessEraser(thicknessEraser: number) {
    this.thicknessEraser = thicknessEraser;
  }

  setImage(image: string) {
    this.restoreCanvas(image);
  }

  setDrawOptions() {
    this.context.globalCompositeOperation = this.useEraser
      ? 'destination-out'
      : 'source-over';

    this.context.lineWidth = this.useEraser
      ? this.thicknessEraser
      : this.thickness;

    this.context.strokeStyle = this.color;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
  }

  onDrawStart(e: any) {
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

  onDrawMove(e: any) {
    if (this.isDrawing && this.active) {
      this.stopLongPressTimer();

      const mousePosition = this.getMousePosition(e);

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
    console.log('save');
    this.events.emit('save', image);
  }

  getMousePosition(e: any): MousePosition {
    const rect = this.canvas.getBoundingClientRect();

    // use cursor pos as default
    let clientX = e.clientX;
    let clientY = e.clientY;

    // use first touch if available
    if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    // return mouse/touch position inside canvas
    return {
      x: (clientX - rect.left) / this.scaleFactor,
      y: (clientY - rect.top) / this.scaleFactor,
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
    if (base64Image) {
      let image = new Image();
      image.onload = () => {
        this.context.clearRect(0, 0, 500, 400);
        this.context.drawImage(image, 0, 0);
      };
      image.src = base64Image; // eslint-disable-line
    }
  }
}
