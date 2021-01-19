<template>
  <div id="app">
    <Paintable :width="1024" :height="768" :active="true" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { Paintable } from "paintablejs/vue";
console.log(Paintable);
@Component({
  components: {
    Paintable,
  },
})
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
