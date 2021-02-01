---
id: props
title: Props
sidebar_label: Props
---

These are the props you can set set on the paintable:

## Props

| name            |  type                   | default | required | description                                                                                                                                                                 |
| --------------- | ----------------------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| width           | number                  |         | x        | the canvas width, can only be initialized and not be changed later                                                                                                          |
| height          | number                  |         | x        | the canvas height, can only be initialized and not be changed later                                                                                                         |
| active          | boolean                 |         | x        | flag if the canvas is active (foreground/background)                                                                                                                        |
| scaleFactor     | number                  | 1       |          | if you use the paintable in a scaled envirionment set the scalefactor to get the correct x/y values                                                                         |
| useEraser       | boolean                 | false   |          | flag if the eraser is enabled                                                                                                                                               |
| thicknessEraser | number                  | 40      |          | width of the eraser when it is active                                                                                                                                       |
| thickness       | number                  | 10      |          | width of the pencil while drawing                                                                                                                                           |
| color           | string                  | #000000 |          | the pencilcolor MUST be a hex value. Other strings wont work right now                                                                                                      |
| image           | string                  | null    |          | initial image (base64) drawn from the canvas                                                                                                                                |
| onSave          | (image: string) => void |         |          | The event is emitted when the paintable state toggles from `active: true` -> `active: false`. When the event is emitted you get the current canvas image as a base64 string |
| onLongPress     | () => void              |         |          | The event is emitted when you longpress the canvas while it is active. Very useful to tigger a custom navigation.                                                           |

## Methods

The Paintable hast some Methods you can execute.

| name  | description                |
| ----- | -------------------------- |
| undo  | Undo the last drawing step |
| redo  | Redo the last drawing step |
| clear | Clear the canvas screen    |
