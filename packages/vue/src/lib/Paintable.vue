<template>
  <div>
    <canvas ref="{canvas}" :width="width" :height="height"></canvas>

    <div
      :style="{
        width: `${width}px`,
        height: `${height}px`,
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Paintable as PaintableCore } from "paintablejs";

import { Component, Prop, Vue } from "vue-property-decorator";

@Component({})
export default class Paintable extends Vue {
  // required
  @Prop({ required: true }) private width!: number;
  @Prop({ required: true }) private height!: number;
  @Prop({ required: true }) private active!: boolean;

  //optional
  @Prop(Number) private scaleFactor: number | undefined;
  @Prop(Boolean) private useEraser: boolean | undefined;
  @Prop(Number) private thicknessEraser: number | undefined;
  @Prop(Number) private thickness: number | undefined;
  @Prop(String) private color: string | undefined;
  @Prop(String) private image: string | undefined;

  mounted() {
    console.log(this.$refs);
  }
}
</script>

<style>
</style>
