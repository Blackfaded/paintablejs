<template>
  <div
    id="vue-paintable-container"
    :style="{
      width: `${width}px`,
      height: `${height}px`
    }"
  >
    <canvas ref="canvas" :width="width" :height="height"></canvas>

    <div id="vue-paintable-inner" :style="{ height: '100%', width: '100%' }">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Paintable as PaintableCore } from "paintablejs";
import { defineComponent, onMounted, ref, watch } from "vue";

export default defineComponent({
  props: {
    // required
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    },
    //optional
    scaleFactor: {
      type: Number,
      required: false
    },
    useEraser: {
      type: Boolean,
      required: false
    },
    thicknessEraser: {
      type: Number,
      required: false
    },
    thickness: {
      type: Number,
      required: false
    },
    color: {
      type: String,
      required: false
    },
    image: {
      type: String,
      required: false
    }
  },
  emits: ["longPress", "save"],
  setup(props, { emit }) {
    const paintable = ref<null | PaintableCore>(null);
    const canvas = ref<HTMLCanvasElement | null>(null);

    watch(
      () => props.active,
      active => {
        paintable.value?.setActive(active!);
      }
    );

    watch(
      () => props.useEraser,
      useEraser => {
        paintable.value?.setUseEraser(useEraser!);
      }
    );

    watch(
      () => props.thicknessEraser,
      thicknessEraser => {
        paintable.value?.setThicknessEraser(thicknessEraser!);
      }
    );

    watch(
      () => props.thickness,
      thickness => {
        paintable.value?.setThickness(thickness!);
      }
    );

    watch(
      () => props.color,
      color => {
        paintable.value?.setColor(color!);
      }
    );

    watch(
      () => props.scaleFactor,
      scaleFactor => {
        paintable.value?.setScaleFactor(scaleFactor!);
      }
    );

    const undo = () => {
      paintable.value?.undo();
    };

    const redo = () => {
      paintable.value?.redo();
    };

    const clear = () => {
      paintable.value?.clearCanvas();
    };

    onMounted(() => {
      console.log(",sf", canvas.value);
      paintable.value = new PaintableCore(canvas.value as HTMLCanvasElement, {
        width: props.width,
        height: props.height,
        active: props.active,
        scaleFactor: props.scaleFactor,
        useEraser: props.useEraser,
        thicknessEraser: props.thicknessEraser,
        thickness: props.thickness,
        color: props.color,
        image: props.image,
        onLongPress: () => emit("longPress"),
        onSave: image => emit("save", image)
      });
      console.log(paintable.value);
    });

    return {
      canvas,
      undo,
      redo,
      clear
    };
  }
});
</script>





