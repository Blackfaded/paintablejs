# Angular Usage

For prop types see [Paintable](README.md)

`app.component.html`

```html
<paintable
  #paintable
  [width]="1024"
  [height]="768"
  [active]="active"
  [useEraser]="useEraser"
  [thickness]="thickness"
  [smooth]="smooth"
  [color]="color"
  [image]="image"
  (onSave)="onSave($event)"
  (onLongPress)="onLongPress()"
>
  <div class="canvas-inner">test</div>
</paintable>
```

`app.component.ts`

```js
import { Component, ViewChild } from '@angular/core';
import { PaintableComponent } from 'paintablejs/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild(PaintableComponent)
  paintable: PaintableComponent;

  active = false;
  useEraser = false;
  thickness = 5;
  smooth = false;
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
    return localStorage.getItem('/');
  }

  onSave(image: string) {
    localStorage.setItem('/', image);
  }

  onLongPress() {
    console.log('longpress');
  }
}
```

`app.module.ts`

```js
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PaintableModule } from 'paintablejs/angular';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, PaintableModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```
