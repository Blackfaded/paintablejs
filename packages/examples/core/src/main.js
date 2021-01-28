import { Paintable } from 'paintablejs';

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
