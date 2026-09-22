// A brief original brass phrase, created only from a direct musician click.
export function createTrumpetPlayer() {
  let context = null,
    voices = [],
    generation = 0,
    plays = 0;
  function stop() {
    generation++;
    for (const voice of voices) {
      try {
        voice.stop();
      } catch {}
    }
    voices = [];
  }
  async function play() {
    stop();
    const token = generation;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    context ||= new Audio();
    try {
      await context.resume();
    } catch {
      return;
    }
    if (token !== generation || context.state !== "running") return;
    plays++;
    const output = context.createGain();
    output.gain.value = 0.075;
    output.connect(context.destination);
    const wave = context.createPeriodicWave(
      new Float32Array(9),
      new Float32Array([0, 1, 0.65, 0.48, 0.34, 0.22, 0.14, 0.08, 0.04]),
    );
    const phrase = [
      [311.13, 0.3],
      [392, 0.3],
      [466.16, 0.38],
      [523.25, 0.38],
      [466.16, 0.34],
      [622.25, 1.15],
    ];
    let when = context.currentTime + 0.02;
    let remaining = phrase.length;
    for (const [frequency, length] of phrase) {
      const oscillator = context.createOscillator(),
        filter = context.createBiquadFilter(),
        envelope = context.createGain();
      oscillator.setPeriodicWave(wave);
      oscillator.frequency.value = frequency;
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, when);
      filter.frequency.linearRampToValueAtTime(2600, when + 0.04);
      filter.frequency.exponentialRampToValueAtTime(1200, when + length);
      envelope.gain.setValueAtTime(0, when);
      envelope.gain.linearRampToValueAtTime(0.75, when + 0.025);
      envelope.gain.linearRampToValueAtTime(0.48, when + 0.09);
      envelope.gain.setValueAtTime(0.4, when + length - 0.06);
      envelope.gain.linearRampToValueAtTime(0, when + length);
      oscillator.connect(filter).connect(envelope).connect(output);
      oscillator.onended = () => {
        oscillator.disconnect();
        filter.disconnect();
        envelope.disconnect();
        voices = voices.filter((voice) => voice !== oscillator);
        if (--remaining === 0) output.disconnect();
      };
      voices.push(oscillator);
      oscillator.start(when);
      oscillator.stop(when + length);
      when += length + 0.02;
    }
  }
  return {
    play,
    stop,
    snapshot: () => ({ plays, voices: voices.length }),
    dispose() {
      stop();
      context?.close();
      context = null;
    },
  };
}
