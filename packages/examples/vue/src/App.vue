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
import { Component, Vue, Watch } from 'vue-property-decorator';

import { Paintable } from '@paintablejs/vue';

@Component({
  components: {
    Paintable,
  },
})
export default class App extends Vue {
  useEraser = false;
  color = '#FF0000';
  thickness = 5;
  active = false;

  paintable: null | Paintable = null;

  mounted() {
    this.paintable = (this.$refs.paintable as unknown) as Paintable;
  }

  clear() {
    this.paintable?.clear();
  }

  undo() {
    this.paintable?.undo();
  }

  redo() {
    this.paintable?.redo();
  }

  get image() {
    return localStorage.getItem('/') || undefined;
  }

  onSave(image: string) {
    localStorage.setItem('/', image);
  }

  onLongPress() {
    console.log('longPress');
  }

  toggleEraser() {
    this.useEraser = !this.useEraser;
  }

  toggleEdit() {
    this.useEraser = false;
    this.active = !this.active;
  }
}
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
