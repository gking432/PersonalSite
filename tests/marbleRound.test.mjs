import test from "node:test";
import assert from "node:assert/strict";
import {
  MarbleRound,
  chooseRoute,
  MAX_FEED_INTERVAL,
  START_FEED_INTERVAL,
  RAMP_SECONDS,
} from "../src/features/marbles/marbleRound.js";

test("one opening marble waits for a successful catch; missed cleanup retries one", () => {
  const round = new MarbleRound();
  assert.equal(round.tick(0, 0), 1);
  for (let i = 0; i < 600; i++) assert.equal(round.tick(0.1, 1), 0);
  assert.equal(round.emitted, 1);
  assert.equal(round.elapsed, 0);
  round.miss();
  assert.equal(round.score, -1);
  assert.equal(round.catch(true).emit, 0);
  assert.equal(round.opening, true);
  assert.equal(round.score, -1);
  assert.equal(round.tick(0.01, 0), 1);
  assert.equal(round.emitted, 2);
  assert.equal(round.catch(false).emit, 1);
  assert.equal(round.opening, false);
  assert.equal(round.score, 0);
});
test("first catch releases the next marble; another follows before that trip ends", () => {
  const round = new MarbleRound();
  round.tick(0, 0);
  assert.equal(round.catch(false).emit, 1);
  assert.equal(round.emitted, 2);
  let spawnAt = null;
  for (let t = 0.05; t < 6; t += 0.05) {
    if (round.tick(0.05, 1)) {
      spawnAt = t;
      break;
    }
  }
  assert.ok(
    spawnAt >= START_FEED_INTERVAL - 0.05 &&
      spawnAt <= START_FEED_INTERVAL + 0.1,
  );
  assert.ok(spawnAt < 5.8);
});
test("release frequency increases gradually and never exceeds the previous maximum", () => {
  const round = new MarbleRound();
  round.tick(0, 0);
  round.catch(false);
  let previousInterval = round.interval;
  for (let i = 0; i < 10000; i++) {
    round.tick(0.02, 8);
    assert.ok(
      round.interval <= previousInterval &&
        round.interval >= MAX_FEED_INTERVAL - 1e-10,
    );
    previousInterval = round.interval;
  }
  assert.equal(round.elapsed, RAMP_SECONDS);
  assert.ok(Math.abs(round.interval - MAX_FEED_INTERVAL) < 1e-10);
});
test("late cleanup cannot recover a missed point and reset clears the round", () => {
  const round = new MarbleRound();
  round.miss();
  round.catch(true);
  assert.deepEqual(
    [round.score, round.caught, round.missed, round.cleaned],
    [-1, 0, 1, 1],
  );
  round.catch(false);
  assert.equal(round.score, 0);
  assert.equal(round.caught, 1);
  round.reset();
  assert.equal(round.score, 0);
  assert.equal(round.opening, true);
  assert.equal(round.emitted, 0);
});
test("all three unpredictable branches can be selected", () => {
  assert.deepEqual(
    [0, 0.4, 0.999].map((n) => chooseRoute(() => n)),
    [0, 1, 2],
  );
});
