import test from "node:test";
import assert from "node:assert/strict";
import {
  MarbleRound,
  chooseRoute,
  MAX_FEED_INTERVAL,
  START_FEED_INTERVAL,
  RAMP_SECONDS,
} from "../src/features/marbles/marbleRound.js";

test("one immediate marble grows into a stream even without catches", () => {
  const round = new MarbleRound();
  assert.equal(round.tick(0), 1);
  assert.equal(round.emitted, 1);
  for (let i = 0; i < 23; i++) assert.equal(round.tick(0.1), 0);
  assert.equal(round.tick(0.1), 1);
  round.miss();
  for (let i = 0; i < 300; i++) round.tick(0.1);
  assert.equal(round.caught, 0);
  assert.ok(round.emitted > 15, "Misses do not stall the stream");
  assert.equal(round.elapsed, RAMP_SECONDS);
  assert.equal(round.score, -1);
});
test("catching and cleaning do not interrupt or restart the release ramp", () => {
  const round = new MarbleRound();
  round.tick(0);
  round.tick(1);
  const { elapsed, nextIn, emitted } = round;
  assert.equal(round.catch(false).label, "+1");
  round.miss();
  assert.equal(round.catch(true).label, "Cleaned");
  assert.deepEqual(
    [round.elapsed, round.nextIn, round.emitted],
    [elapsed, nextIn, emitted],
  );
  assert.equal(round.score, 0);
});
test("release frequency increases gradually and never exceeds the previous maximum", () => {
  const round = new MarbleRound();
  round.tick(0);
  round.catch(false);
  let previousInterval = round.interval;
  for (let i = 0; i < 10000; i++) {
    round.tick(0.02);
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
  assert.equal(round.emitted, 0);
});
test("all three unpredictable branches can be selected", () => {
  assert.deepEqual(
    [0, 0.4, 0.999].map((n) => chooseRoute(() => n)),
    [0, 1, 2],
  );
});
