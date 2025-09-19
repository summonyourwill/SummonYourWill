import { getPixi } from '../src/wrappers/pixi.js';
import { getGsap } from '../src/wrappers/gsap.js';
import { getBitecs } from '../src/wrappers/bitecs.js';

export function createPixiSurvivalGame(points = 10) {
  let app = null;
  let finishCallback = null;
  let world = null;
  const sprites = [];
  let Application, Graphics,
      addComponent, addEntity, createWorld,
      defineComponent, defineQuery, defineSystem,
      pipe, removeEntity, Types, gsap;

  async function loadLibs() {
    const pixi = await getPixi();
    ({ Application, Graphics } = pixi);
    const { settings, GC_MODES } = pixi;
    if (settings && GC_MODES) {
      settings.GC_MODE = GC_MODES.AUTO;
      settings.GC_MAX_IDLE = 60;
      settings.GC_MAX_CHECK_COUNT = 600;
    }
    gsap = await getGsap();
    gsap.ticker.lagSmoothing(500, 33);
    gsap.ticker.fps(50);
    const bitecs = await getBitecs();
    ({ addComponent, addEntity, createWorld, defineComponent, defineQuery, defineSystem, pipe, removeEntity, Types } = bitecs);

    Position = defineComponent({ x: Types.f32, y: Types.f32 });
    Velocity = defineComponent({ x: Types.f32, y: Types.f32 });
    PlayerTag = defineComponent();
    moverQuery = defineQuery([Position, Velocity]);
    moveSystem = defineSystem((world) => {
      const ents = moverQuery(world);
      for (let i = 0; i < ents.length; i++) {
        const id = ents[i];
        Position.x[id] += Velocity.x[id];
        Position.y[id] += Velocity.y[id];
        const spr = sprites[id];
        if (spr) {
          spr.x = Position.x[id];
          spr.y = Position.y[id];
        }
        if (spr && (spr.x < 0 || spr.x > 800 || spr.y < 0 || spr.y > 600)) {
          app.stage.removeChild(spr);
          spr.destroy();
          sprites[id] = null;
          removeEntity(world, id);
        }
      }
      return world;
    });
    pipeline = pipe(moveSystem);
  }

  let Position;
  let Velocity;
  let PlayerTag;
  let pipeline;

  function loop() {
    pipeline(world);
  }

  return {
    async init(container, finish) {
      await loadLibs();
      finishCallback = finish;
      app = new Application({ width: 800, height: 600, backgroundColor: 0x222222 });
      container.appendChild(app.view);
      world = createWorld();

      const player = addEntity(world);
      addComponent(world, Position, player);
      addComponent(world, Velocity, player);
      addComponent(world, PlayerTag, player);
      Position.x[player] = 400;
      Position.y[player] = 300;
      const rect = new Graphics();
      rect.beginFill(0x00ff00);
      rect.drawRect(-16, -24, 32, 48);
      rect.endFill();
      rect.x = 400;
      rect.y = 300;
      rect.eventMode = 'static';
      app.stage.addChild(rect);
      sprites[player] = rect;

      app.view.addEventListener('pointerdown', (e) => {
        const bounds = app.view.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const bullet = addEntity(world);
        addComponent(world, Position, bullet);
        addComponent(world, Velocity, bullet);
        Position.x[bullet] = rect.x;
        Position.y[bullet] = rect.y;
        const angle = Math.atan2(y - rect.y, x - rect.x);
        Velocity.x[bullet] = Math.cos(angle) * 6;
        Velocity.y[bullet] = Math.sin(angle) * 6;
        const b = new Graphics();
        b.beginFill(0xffffff);
        b.drawRect(-3, -3, 6, 6);
        b.endFill();
        b.x = rect.x;
        b.y = rect.y;
        app.stage.addChild(b);
        sprites[bullet] = b;
      });

      gsap.ticker.add(loop);
      app.ticker.stop();
      this.paused = false;
    },
    pause() {
      if (!this.paused) {
        this.paused = true;
        gsap.ticker.remove(loop);
      }
    },
    resume() {
      if (this.paused) {
        this.paused = false;
        gsap.ticker.add(loop);
      }
    },
    cleanup() {
      if (app) {
        gsap.ticker.remove(loop);
        app.stage.removeChildren();
        if (app.renderer && app.renderer.textureGC) {
          app.renderer.textureGC.run();
        }
        app.destroy(true, { children: true, texture: true, baseTexture: true });
        app = null;
      }
    },
  };
}
