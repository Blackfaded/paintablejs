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
  @Prop({ required: true }) private width!: number;
  @Prop({ required: true }) private height!: number;
  @Prop({ required: true }) private active!: boolean;

  mounted() {
    console.log(this.$refs.canvas);
  }
}
</script>

<style>
</style>
