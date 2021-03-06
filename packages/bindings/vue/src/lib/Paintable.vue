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
import { Paintable as PaintableCore } from "paintablejs";

import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component({})
export default class Paintable extends Vue {
  // required
  @Prop({ required: true }) private readonly width!: number;
  @Prop({ required: true }) private readonly height!: number;
  @Prop({ required: true }) private readonly active!: boolean;

  //optional
  @Prop(Number) private readonly scaleFactor: number | undefined;
  @Prop(Boolean) private readonly useEraser: boolean | undefined;
  @Prop(Number) private readonly thicknessEraser: number | undefined;
  @Prop(Number) private readonly thickness: number | undefined;
  @Prop(String) private readonly color: string | undefined;
  @Prop(String) private readonly image: string | undefined;

  paintable: null | PaintableCore = null;

  @Watch("active")
  private activeChanged(active: boolean) {
    this.paintable?.setActive(active);
  }

  @Watch("useEraser")
  private useEraserChanged(useEraser: boolean) {
    this.paintable?.setUseEraser(useEraser);
  }

  @Watch("thicknessEraser")
  private thicknessEraserChanged(thicknessEraser: number) {
    this.paintable?.setThicknessEraser(thicknessEraser);
  }

  @Watch("thickness")
  private thicknessChanged(thickness: number) {
    this.paintable?.setThickness(thickness);
  }
  @Watch("color")
  private colorChanged(color: string) {
    this.paintable?.setColor(color);
  }

  @Watch("scaleFactor")
  private scaleFactorChanged(scaleFactor: number) {
    this.paintable?.setScaleFactor(scaleFactor);
  }

  undo() {
    this.paintable?.undo();
  }

  redo() {
    this.paintable?.redo();
  }

  clear() {
    this.paintable?.clearCanvas();
  }

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
      onLongPress: () => this.$emit("longPress"),
      onSave: (image) => this.$emit("save", image),
    });
  }
}
</script>

<style lang="scss" scoped>
#vue-paintable-container {
  #vue-paintable-inner {
    width: 100%;
    height: 100%;
  }
}
</style>>



