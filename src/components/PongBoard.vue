<template>
  <div class="game-board" :class="{ 'paused': isPaused || game.isOver }" ref="board">
    <div class="scores">
      <CTable hover small border-color="light" class="text-light small">
        <CTableRow>
          <CTableHeaderCell scope="row" v-text="'High'" class="fw-normal"/>
          <CTableDataCell>
            <div v-text="game.highScore" class="flex text-end" />
          </CTableDataCell>
        </CTableRow>
        <CTableRow>
          <CTableHeaderCell scope="row" v-text="'Score'" class="fw-normal"/>
          <CTableDataCell>
            <div v-text="game.score" class="flex text-end" />
          </CTableDataCell>
        </CTableRow>
      </CTable>
    </div>
    <div class="paddle" :style="paddleStyle" />
    <div class="ball" :style="ballStyle" />
    <div class="cursor" :style="cursorStyle" />
    <div class="overlay" v-if="isPaused || game.isOver">
      <h1 class="info-msg" v-text="isPaused ? 'paused' : '¯\\_(ツ)_/¯'" />
      <CButton href color="light" variant="outline" @click.stop.capture="restart">Restart</CButton>
    </div>
    <!--    <pre v-text="{ ...game }" class="logger" />-->
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, reactive, toRefs, watch } from 'vue';
import { usePaddle } from "../store/paddle";
import { useGame } from "../store/game";
import { useBall } from "../store/ball";

const randomBetween = (min: number, max: number) => (max - min) * Math.random() + min

interface PongBoardState {
  board: null | HTMLDivElement;
  ballStyle: Record<string, unknown>;
  paddleStyle: Record<string, unknown>;
  cursorStyle: Record<string, unknown>;
  isPaused: boolean,
  timer: null | number;
}
export default defineComponent({
  name: "PongBoard",
  setup() {
    const paddle = usePaddle();
    const game = useGame();
    const ball = useBall();
    const local: PongBoardState = reactive({
      timer: null,
      board: null,
      ballStyle: computed(() => ({
        left: `${ball.x}px`,
        top: `${ball.y}px`,
        border: `${ball.radius}px solid white`
      })),
      paddleStyle: computed(() => ({
        left: `${paddle.x}px`,
        bottom: `${ball.radius / 2}px`,
        border: `${ball.radius / 2}px solid white`,
        backgroundColor: 'white',
        width: `${paddle.width}px`,
        borderRadius: `${ball.radius}px`
      })),
      cursorStyle: computed(() => ({
        '--pageX': `${paddle.pageX}px`,
        '--pageY': `${paddle.pageY}px`
      })),
      isPaused: computed(() => game.isPaused && !game.isOver)
    });
    onMounted(() => {
      watch(() => game.isOver || game.isPaused, (val) => {
        if (!val) {
          nextTick(move);
        }
      }, { immediate: true });
      restart();
      document.addEventListener('mousemove', paddle.move);
      window.addEventListener('resize', () => {
        game.width = +(local.board?.clientWidth || 0);
        game.height = +(local.board?.clientHeight || 0);
        game.isPaused = true;
      });
      document.addEventListener('keyup', (e) => {
        if (['Escape', 'Space'].includes(e.code)) {
          game.toggle()
        }
      })
      document.addEventListener('click', game.toggle);
    });
    const move = () => {
      // if (local.timer) {
      //   console.log(local.timer - performance.now());
      // }
      // local.timer = performance.now();
      if (ball.dx * ball.dy && (!game.isPaused)) {
        ball.move();
        nextTick(() => {
          requestAnimationFrame(move);
        });
      }
    };
    const restart = () => {
      game.init({
        width: +(local.board?.clientWidth || 0),
        height: +(local.board?.clientHeight || 0)
      }, {
        speed: 7,
        radius: 7,
        xS: 1,
        yS: 1,
        y: +(local.board?.clientHeight || 0) / 5,
        angle: randomBetween(-40, -140)
      }, {
        width: 105,
        x: +(local.board?.clientWidth || 0) / 2
      });
    }

    return {
      ...toRefs(local),
      restart,
      game
    }
  }
})
</script>
