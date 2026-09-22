// A short, quiet double ring. It only starts after a direct payphone click.
export function createPhoneRing() {
  let context,
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
    const token = generation,
      Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    context ||= new Audio();
    try {
      await context.resume();
    } catch {
      return;
    }
    if (token !== generation || context.state !== "running") return;
    plays++;
    for (const delay of [0, 0.38])
      for (const frequency of [880, 1175]) {
        const oscillator = context.createOscillator(),
          gain = context.createGain();
        const at = context.currentTime + delay + 0.01;
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.025, at + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
        oscillator.connect(gain).connect(context.destination);
        voices.push(oscillator);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
          voices = voices.filter((v) => v !== oscillator);
        };
        oscillator.start(at);
        oscillator.stop(at + 0.27);
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
