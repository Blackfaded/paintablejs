---
id: usage-standalone
title: Standalone Usage
sidebar_label: Standalone
---

## index.html

```html
<!DOCTYPE html>
<html>
  <head lang="en">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Core Example</title>
  </head>

  <style>
    #canvasOverlay {
      background-color: green;
      width: 1024px;
      height: 768px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
  <body>
    <div>
      <button id="clearButton">Clear</button>
      <button id="undoButton">Undo</button>
      <button id="redoButton">Redo</button>
      <button id="editButton">Edit</button>
      <button id="useEraserButton">
        use eraser
      </button>
      <input id="colorInput" type="color" />
      <input id="rangeInput" type="range" min="1" max="30" step="1" />
    </div>
    <canvas id="canvas"></canvas>
    <div id="canvasOverlay"></div>

    <script type="module" src="bundle.js"></script>
  </body>
</html>
```

## main.js

```ts
import { Paintable } from 'paintablejs';

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
```
