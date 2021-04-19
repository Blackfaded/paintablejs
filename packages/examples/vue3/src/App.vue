<template>
  <div id="main">
    <div>
      <button @click="clear">Clear</button>
      <button @click="undo">Undo</button>
      <button @click="redo">Redo</button>
      <button @click="toggleEdit">
        {{ active ? 'save' : 'edit' }}
      </button>
      <button @click="toggleEraser">
        {{ useEraser ? 'use pencil' : 'use eraser' }}
      </button>
      <input type="color" v-model="color" />
      <input
        type="range"
        v-model.number="thickness"
        :min="1"
        :max="30"
        :step="1"
      />
    </div>
    <div ref="paintableRef"></div>
    <Paintable
      ref="paintableRef"
      :width="1024"
      :height="768"
      :active="active"
      :color="color"
      :thickness="thickness"
      :useEraser="useEraser"
      :image="image"
      @longPress="onLongPress"
      @save="onSave"
    >
      <div id="paintable-children">Test</div>
    </Paintable>
  </div>
</template>

<script lang="ts">
import { Paintable } from '@paintablejs/vue3';

import { computed, defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  components: {
    Paintable,
  },
  setup() {
    const useEraser = ref(false);
    const color = ref('#FF0000');
    const thickness = ref(5);
    const active = ref(false);
    const paintableRef = ref<any | null>(null);

    onMounted(() => {
      console.log(paintableRef.value);
    });
    const clear = () => {
      paintableRef.value?.clear();
    };

    const undo = () => {
      paintableRef.value?.undo();
    };

    const redo = () => {
      paintableRef.value?.redo();
    };

    const image = computed(() => {
      return localStorage.getItem('/') || undefined;
    });

    const onSave = (image: string) => {
      localStorage.setItem('/', image);
    };

    const onLongPress = () => {
      console.log('longPress');
    };

    const toggleEraser = () => {
      useEraser.value = !useEraser.value;
    };

    const toggleEdit = () => {
      useEraser.value = false;
      active.value = !active.value;
    };

    return {
      clear,
      undo,
      redo,
      image,
      onSave,
      onLongPress,
      toggleEraser,
      toggleEdit,
      useEraser,
      color,
      thickness,
      active,
      paintableRef,
    };
  },
});
</script>

<style lang="scss" scoped>
#paintable-children {
  background-color: green;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
