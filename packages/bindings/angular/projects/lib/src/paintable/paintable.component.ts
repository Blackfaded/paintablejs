import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Paintable as PaintableCore } from 'paintablejs';

@Component({
  selector: 'paintable',
  templateUrl: './paintable.component.html',
  styles: []
})
export class PaintableComponent implements OnInit {
  paintable: null | PaintableCore = null;

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  @Output() onSave = new EventEmitter<string>();
  @Output() onLongPress = new EventEmitter();

  @Input() image: string;

  @Input() width: number;
  @Input() height: number;

  private _active = false;
  @Input()
  set active(active: boolean) {
    this._active = active;
    this.paintable?.setActive(this._active);
  }
  get active(): boolean {
    return this._active;
  }

  private _useEraser: boolean | undefined;
  @Input()
  set useEraser(useEraser: boolean) {
    this._useEraser = useEraser;
    this.paintable?.setUseEraser(this._useEraser);
  }
  get useEraser(): boolean {
    return this._useEraser;
  }

  private _thicknessEraser: number | undefined;
  @Input()
  set thicknessEraser(thicknessEraser: number) {
    this._thicknessEraser = thicknessEraser;
    this.paintable?.setThicknessEraser(this._thicknessEraser);
  }
  get thicknessEraser(): number {
    return this._thicknessEraser;
  }

  private _thickness: number | undefined;
  @Input()
  set thickness(thickness: number) {
    this._thickness = thickness;
    this.paintable?.setThickness(this._thickness);
  }
  get thickness(): number {
    return this._thickness;
  }

  private _color: string | undefined;
  @Input()
  set color(color: string) {
    this._color = color;
    this.paintable?.setColor(this._color);
  }
  get color(): string {
    return this._color;
  }

  private _smooth: boolean | undefined;
  @Input()
  set smooth(smooth: boolean) {
    this._smooth = smooth;
    this.paintable?.setSmooth(this._smooth);
  }
  get smooth(): boolean {
    return this._smooth;
  }

  private _scaleFactor: number | undefined;
  @Input()
  set scaleFactor(scaleFactor: number) {
    this._scaleFactor = scaleFactor;
    this.paintable?.setScaleFactor(this._scaleFactor);
  }
  get scaleFactor(): number {
    return this._scaleFactor;
  }

  clear() {
    this.paintable?.clearCanvas();
  }

  undo() {
    this.paintable?.undo();
  }

  redo() {
    this.paintable?.redo();
  }

  constructor() {}

  ngAfterViewInit() {
    this.paintable = new PaintableCore(
      this.canvas.nativeElement as HTMLCanvasElement,
      {
        width: this.width,
        height: this.height,
        active: this.active,

        scaleFactor: this.scaleFactor,
        useEraser: this.useEraser,
        thicknessEraser: this.thicknessEraser,
        thickness: this.thickness,
        smooth: this.smooth,
        color: this.color,
        image: this.image
      }
    );
    this.paintable.events.on('save', (image: string) =>
      this.onSave.emit(image)
    );
    this.paintable.events.on('longPress', () => this.onLongPress.emit());
  }

  ngOnInit() {}
}
