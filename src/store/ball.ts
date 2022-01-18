import { defineStore } from "pinia";
import { useGame } from "./game";

export interface BallState {
  x: number;
  y: number;
  radius: number;
  speed: number;
  angle: number;
  xS: number;
  yS: number;
}
export const useBall = defineStore('ball', {
  state: () => ({
    x: 0,
    y: 0,
    radius: 12,
    speed: 1,
    angle: 45,
    xS: 1,
    yS: 1
  } as BallState),
  actions: {
    set(data: Partial<BallState>) {
      Object.assign(this, data);
    },
    move() {
      const game = useGame();
      if (!game.isPaused) {
        this.x += this.dx;
        this.y += this.dy;
        this.update();
      }
    },
    update() {
      const game = useGame();
      if (this.x + this.radius > game.width || this.x - this.radius < 0) {
        this.clamp(true);
        this.speed = (2 + this.speed * 10) / 10;
        game.score += 10;
        this.xS *= -1;
      }
      if ((this.y > game.height - this.radius * 3) && !game.isOver) {
        const check = game.paddle.check(this.x);
        if (check === null && this.y - this.dy > game.height) {
          game.end();
        } else if (typeof check === 'number') {
          this.angle = 175 + 190 * check;
          this.speed = (1 + this.speed * 10) / 10;
          game.score += 20;
          this.xS = 1;
          this.yS = 1;
        }
      }
      if (this.y > game.height) {
        this.freeze();
      }
      if (this.y - this.radius < 0) {
        this.clamp(false);
        game.score += 100;
        this.yS *= -1;
      }
    },
    clamp(horizontal = true) {
      const game = useGame();
      this[horizontal ? 'x' : 'y'] = Math.max(
        this.radius,
        Math.min(
          game[horizontal ? 'width' : 'height'] - this.radius,
          this[horizontal? 'x' : 'y']
        )
      )
    },
    freeze() {
      const game = useGame();
      this.xS = 0;
      this.yS = 0;
      game.end();
    }
  },
  getters: {
    dx: state => state.speed * state.xS * Math.cos(state.angle * Math.PI / 180),
    dy: state => state.speed * state.yS * Math.sin(state.angle * Math.PI / 180)
  }
})
