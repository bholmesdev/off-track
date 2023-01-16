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
  C4: {
    frequency: 261.63,
    keyboardKey: "a",
  },
  D4: {
    frequency: 293.66,
    keyboardKey: "s",
  },
  E4: {
    frequency: 329.63,
    keyboardKey: "d",
  },
  F4: {
    frequency: 349.23,
    keyboardKey: "f",
  },
  G4: {
    frequency: 392.0,
    keyboardKey: "g",
  },
  A4: {
    frequency: 440.0,
    keyboardKey: "h",
  },
  B4: {
    frequency: 493.88,
    keyboardKey: "j",
  },
};

const DETUNE = 0;

function Key(props: { label: string; frequency: number; keyboardKey: string }) {
  const [oscsPlaying, setOscsPlaying] = createStore<OscillatorNode[]>([]);

  function play() {
    if (oscsPlaying.length) return;

    setOscsPlaying((oscs) => [
      ...oscs,
      createOscillator(props.frequency),
      // createOscillator(props.frequency + DETUNE),
      // createOscillator(props.frequency - DETUNE),
    ]);
  }
  function pause() {
    setOscsPlaying((oscs) => {
      oscs.forEach((osc) => osc.stop());
      return [];
    });
  }

  function isKeyDown(key: KeyboardEvent) {
    return key.key === props.keyboardKey;
  }

  document.addEventListener("keydown", (key) => isKeyDown(key) && play());
  document.addEventListener("keyup", (key) => isKeyDown(key) && pause());

  return (
    <button onMouseDown={play} onMouseUp={pause} onMouseOut={pause}>
      {props.label}
    </button>
  );
}

function Index() {
  return (
    <For each={Object.entries(FREQUENCIES)}>
      {([label, { frequency, keyboardKey }]) => (
        <Key label={label} frequency={frequency} keyboardKey={keyboardKey} />
      )}
    </For>
  );
}

render(Index, document.getElementById("main")!);
