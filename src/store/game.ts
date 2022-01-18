import { defineStore } from "pinia";
import { BallState, useBall } from "./ball";
import { PaddleState, usePaddle } from "./paddle";

interface GameState {
  width: number;
  height: number;
  isOver: boolean;
  isPaused: boolean;
  highScore: number;
  score: number;
}
export const useGame = defineStore('game', {
  state: () => ({
    width: 0,
    height: 0,
    isOver: false,
    isPaused: false,
    highScore: 0,
    score: 0
  } as GameState),
  actions: {
    init(data: Partial<GameState>, ball: Partial<BallState> = {}, paddle: Partial<PaddleState> = {}) {
      this.setHighScore();
      Object.assign(this, data);
      this.isPaused = false;
      this.isOver = false;
      this.paddle.set(paddle);
      this.ball.set({
        x: this.width / 2,
        y: 0,
        ...ball
      });
    },
    toggle() {
      this.isPaused = !this.isPaused;
    },
    setHighScore() {
      this.highScore = Math.max(this.highScore, this.score);
      this.score = 0;
    },
    end() {
      this.isOver = true;
      this.setHighScore();
    }
  },
  getters: {
    ball: () => useBall(),
    paddle: () => usePaddle()
  }
})
