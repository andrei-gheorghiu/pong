<script lang="ts">
import { defineComponent } from 'vue';
import PongBoard from "./components/PongBoard.vue";
import './components/pong-board.scss';

export default defineComponent({
  components: { PongBoard }
})
</script>

<template>
  <pong-board />
</template>
