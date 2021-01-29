import { Component, ViewChild } from '@angular/core';
import { PaintableComponent } from 'paintablejs/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(PaintableComponent)
  paintable: PaintableComponent;

  active = false;
  useEraser = false;
  thickness = 5;
  color = '#FF0000';

  clear() {
    this.paintable?.clear();
  }

  undo() {
    this.paintable?.undo();
  }

  redo() {
    this.paintable?.redo();
  }

  toggleEdit() {
    this.useEraser = false;
    this.active = !this.active;
  }

  toggleUseEraser() {
    this.useEraser = !this.useEraser;
  }

  get image() {
    return localStorage.getItem('/') || undefined;
  }

  onSave(image: string) {
    localStorage.setItem('/', image);
  }

  onLongPress() {
    console.log('longpress');
  }
}
