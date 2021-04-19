<template>
  <div
    id="vue-paintable-container"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
    }"
  >
    <canvas ref="canvas" :width="width" :height="height"></canvas>

    <div id="vue-paintable-inner">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Paintable as PaintableCore } from '@paintablejs/core';

interface Data {
  paintable: null | PaintableCore;
}

export default Vue.extend({
  props: {
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    scaleFactor: {
      type: Number,
      required: false,
    },
    useEraser: {
      type: Boolean,
      required: false,
    },
    thicknessEraser: {
      type: Number,
      required: false,
    },
    thickness: {
      type: Number,
      required: false,
    },
    color: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
  },
  data(): Data {
    return {
      paintable: null,
    };
  },
  watch: {
    active: function(active: boolean) {
      this.paintable?.setActive(active);
    },
    useEraser: function(useEraser: boolean) {
      this.paintable?.setUseEraser(useEraser);
    },
    thicknessEraser: function(thicknessEraser: number) {
      this.paintable?.setThicknessEraser(thicknessEraser);
    },
    thickness: function(thickness: number) {
      this.paintable?.setThickness(thickness);
    },
    color: function(color: string) {
      this.paintable?.setColor(color);
    },
    scaleFactor: function(scaleFactor: number) {
      this.paintable?.setScaleFactor(scaleFactor);
    },
  },
  methods: {
    undo() {
      this.paintable?.undo();
    },

    redo() {
      this.paintable?.redo();
    },

    clear() {
      this.paintable?.clearCanvas();
    },
  },

  mounted() {
    this.paintable = new PaintableCore(this.$refs.canvas as HTMLCanvasElement, {
      width: this.width,
      height: this.height,
      active: this.active,

      scaleFactor: this.scaleFactor,
      useEraser: this.useEraser,
      thicknessEraser: this.thicknessEraser,
      thickness: this.thickness,
      color: this.color,
      image: this.image,
      onLongPress: () => this.$emit('longPress'),
      onSave: (image) => this.$emit('save', image),
    });
  },
});
</script>

<style lang="scss" scoped>
#vue-paintable-container {
  #vue-paintable-inner {
    width: 100%;
    height: 100%;
  }
}
</style>
