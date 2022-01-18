import { defineStore } from "pinia";
import { useGame } from "./game";
import { useBall } from "./ball";

export interface PaddleState {
  width: number;
  height: number;
  x: number;
  pageX: number;
  pageY: number;
}
interface Cursor {
  pageX: number;
  pageY: number;
}
export const usePaddle = defineStore('paddle', {
  state: () => ({
    width: 100,
    x: 0,
    pageX: 0,
    pageY: 0
  } as PaddleState),
  actions: {
    set(data: Partial<PaddleState>) {
      Object.assign(this, data);
    },
    check(x: number): number | null {
      return this.left <= x && this.right >= x
        ? (x - this.left) / (this.width + this.ball.radius * 2)
        : null;
    },
    move(e: MouseEvent) {
      const game = useGame();
      this.pageX = e.pageX;
      this.pageY = e.pageY;
      if (!game.isOver && !game.isPaused) {
        this.x = Math.max(
          0,
          Math.min(e.pageX, game.width))
      }
    }
  },
  getters: {
    left(state): number {
      return state.x - state.width / 2 - this.ball.radius
    },
    right(state): number {
      return state.x + state.width / 2 + this.ball.radius
    },
    ball: () => useBall()
  }
})
