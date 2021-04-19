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
    <Paintable
      ref="paintable"
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
import Vue from 'vue';

import { Paintable } from '@paintablejs/vue';

interface Data {
  useEraser: boolean;
  color: string;
  thickness: number;
  active: boolean;
  paintable: null | typeof Paintable;
}

export default Vue.extend({
  components: { Paintable },
  data(): Data {
    return {
      useEraser: false,
      color: '#FF0000',
      thickness: 5,
      active: false,

      paintable: null,
    };
  },

  mounted() {
    this.paintable = (this.$refs.paintable as unknown) as typeof Paintable;
  },
  computed: {
    image() {
      return localStorage.getItem('/') || undefined;
    },
  },
  methods: {
    clear() {
      this.paintable?.clear();
    },

    undo() {
      this.paintable?.undo();
    },

    redo() {
      this.paintable?.redo();
    },
    onSave(image: string) {
      localStorage.setItem('/', image);
    },

    onLongPress() {
      console.log('longPress');
    },

    toggleEraser() {
      this.useEraser = !this.useEraser;
    },

    toggleEdit() {
      this.useEraser = false;
      this.active = !this.active;
    },
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
