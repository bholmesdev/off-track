import { render } from "solid-js/web";
import { createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";

const actx = new AudioContext();
if (!actx) throw new Error("Trash");

function createOscillator(frequency: number) {
  const osc = actx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = frequency;
  osc.connect(actx.destination /* speakers */);
  osc.start();
  return osc;
}

const FREQUENCIES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
};

const DETUNE = 10;

function Key(props: { label: string; frequency: number }) {
  const [oscsPlaying, setOscsPlaying] = createStore<OscillatorNode[]>([]);

  function play() {
    if (oscsPlaying.length) return;

    setOscsPlaying((oscs) => [
      ...oscs,
      createOscillator(props.frequency),
      createOscillator(props.frequency + DETUNE),
      createOscillator(props.frequency - DETUNE),
    ]);
  }
  function pause() {
    setOscsPlaying((oscs) => {
      oscs.forEach((osc) => osc.stop());
      return [];
    });
  }

  return (
    <button onMouseDown={play} onMouseUp={pause} onMouseOut={pause}>
      {props.label}
    </button>
  );
}

function Index() {
  return (
    <For each={Object.entries(FREQUENCIES)}>
      {([label, frequency]) => <Key label={label} frequency={frequency} />}
    </For>
  );
}

render(Index, document.getElementById("main")!);
