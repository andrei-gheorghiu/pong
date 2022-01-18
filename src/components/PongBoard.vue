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
  timer: number;
}
export default defineComponent({
  name: "PongBoard",
  setup() {
    const paddle = usePaddle();
    const game = useGame();
    const ball = useBall();
    onMounted(() => {
      watch(() => game.isOver || game.isPaused, (val) => {
        if (!val) {
          nextTick(move);
        }
      }, { immediate: true });
      restart();
      document.addEventListener('mousemove', paddle.move);
      window.addEventListener('resize', () => {
        game.width = +local.board?.clientWidth;
        game.height = +local.board?.clientHeight;
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
        width: +local.board?.clientWidth,
        height: +local.board?.clientHeight
      }, {
        speed: 7,
        radius: 7,
        xS: 1,
        yS: 1,
        y: (+local.board?.clientHeight) / 5,
        angle: randomBetween(-40, -140)
      }, {
        width: 105,
        x: (+local.board?.clientWidth) / 2
      });
    }
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

    return {
      ...toRefs(local),
      restart,
      game
    }
  }
})
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;400&display=swap');
body {
  overflow: hidden;
  margin: 0;
  * {
    box-sizing: border-box;
  }
}
#app {
  font-family: 'Roboto', sans-serif;
  .scores {
    position: absolute;
    right: 1rem;
    top: 1rem;
    width: 200px;
    tr {
      background-color: rgba(255,255,255,.1);
      th, td {
        &:first-child {
          padding-left: .375rem;
        }
      }
    }
    .table > :not(:first-child) {
      border-top: 1px solid rgba(255,255,255,.42);
    }
  }
  .btn, .table {
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: small;
  }
  .game-board {
    cursor: none;
    height: 100vh;
    width: 100vw;
    background:
        linear-gradient(336deg, rgba(89, 8, 243, .9), rgba(255,0,0,0) 65%),
        linear-gradient(127deg, rgba(0, 255, 0, .7), rgba(0,255,0,0) 65%),
        linear-gradient(217deg, rgb(33, 211, 227), rgba(0,0,255,0) 65%),
        url('../assets/823715.jpg') 50% /cover;
    position: relative;
    &.paused {
      cursor: default;
    }
    .overlay {
      pointer-events: none;
      > * {
        pointer-events: auto;
      }
      .info-msg {
        font-size: 4.2rem;
        color: white;
        font-weight: 100;
        text-shadow: 1px 1px 9px navy;
      }
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    &:before {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      content: '';
      backdrop-filter: blur(0px);
      background-color: #0379;
      transition: backdrop-filter .42s linear .21s, background-color .35s ease-out;
    }
    &.paused:before {
      backdrop-filter: blur(7px);
      background-color: #f504;
    }
  }
  .ball {
    position: absolute;
    width: 0;
    height: 0;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 3px 5px -1px rgb(0 0 0 / 30%), 0 5px 8px 0 rgb(0 0 0 / 21%), 0 1px 14px 0 rgb(0 0 0 / 18%);
  }
  .paddle {
    position: absolute;
    height: 0;
    transform: translate(-50%, -50%);
  }
  .cursor {
    width: 0;
    height: 0;
    &:before, &:after {
      content: '';
      position: fixed;
      --dots: rgba(194, 255, 0, .42);
    }
    &:before {
      width: 60px;
      left: calc(var(--pageX) - 30px);
      top: var(--pageY);
      border-bottom: 1px dotted var(--dots);
    }
    &:after {
      height: 60px;
      top: calc(var(--pageY) - 30px);
      left: var(--pageX);
      border-right: 1px dotted var(--dots);
    }
  }
  .paused .cursor {
    &:before, &:after {
      content: none;
    }
  }
  .logger {
    min-width: 300px;
    position: absolute;
    right: 1rem;
    background-color: rgba(0, 0,0,.42);
    color: white;
    padding: 1rem;
  }
}
</style>
