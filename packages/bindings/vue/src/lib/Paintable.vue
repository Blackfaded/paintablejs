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
  @Prop(Boolean) private readonly smooth: boolean | undefined;
  @Prop(String) private readonly image: string | undefined;

  paintable: null | PaintableCore = null;

  @Watch("active")
  private activeChanged(active: boolean) {
    this.paintable?.setActive(active);
  }

  @Watch("useEraser")
  private useEraserChanged(useEraser: boolean | undefined) {
    this.paintable?.setUseEraser(useEraser);
  }

  @Watch("thicknessEraser")
  private thicknessEraserChanged(thicknessEraser: number | undefined) {
    this.paintable?.setThicknessEraser(thicknessEraser);
  }

  @Watch("thickness")
  private thicknessChanged(thickness: number | undefined) {
    this.paintable?.setThickness(thickness);
  }
  @Watch("color")
  private colorChanged(color: string | undefined) {
    this.paintable?.setColor(color);
  }

  @Watch("smooth")
  private smoothChanged(smooth: boolean | undefined) {
    this.paintable?.setSmooth(smooth);
  }

  @Watch("scaleFactor")
  private scaleFactorChanged(scaleFactor: number | undefined) {
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
      smooth: this.smooth,
      color: this.color,
      image: this.image,
    });

    this.paintable.events.on("save", (image: string) => {
      this.$emit("save", image);
    });
    this.paintable.events.on("longPress", () => {
      this.$emit("longPress");
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



