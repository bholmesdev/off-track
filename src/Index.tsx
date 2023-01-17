import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { For } from "solid-js";
import { createStore } from "solid-js/store";
import "./styles.css";
import { DETUNE, FREQUENCIES, STAGE_MAX_TIME } from "./~consts";

const actx = new AudioContext();
if (!actx) throw new Error("Trash");

function createOscillator(frequency: number): Osc {
  const [adsr] = adsrStore;
  const gainNode = actx.createGain();
  gainNode.connect(actx.destination);

  const osc = actx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = frequency;
  osc.connect(gainNode);
  osc.start();

  const now = actx.currentTime;
  const atkDuration = adsr.attack * STAGE_MAX_TIME;
  const atkEnd = now + atkDuration;
  const decDuration = adsr.decay * STAGE_MAX_TIME;

  gainNode.gain.cancelScheduledValues(actx.currentTime);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.5, atkEnd);
  gainNode.gain.setTargetAtTime(adsr.sustain, atkEnd, decDuration);
  return {
    osc,
    off() {
      const now = actx.currentTime;
      const relDuration = adsr.release * STAGE_MAX_TIME;
      const relEnd = now + relDuration;

      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.linearRampToValueAtTime(0, relEnd);
      // gainNode.disconnect();
    },
  };
}

type Osc = {
  osc: OscillatorNode;
  off: () => void;
};

const adsrStore = createStore({
  attack: 0.01,
  decay: 0.1,
  sustain: 0.2,
  release: 0.1,
});

function Key(props: { label: string; frequency: number; keyboardKey: string }) {
  const [oscsPlaying, setOscsPlaying] = createStore<Osc[]>([]);

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
      oscs.forEach((osc) => osc.off());
      // TODO: await oscs to stop
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
    <>
      <For each={Object.entries(FREQUENCIES)}>
        {([label, { frequency, keyboardKey }]) => (
          <Key label={label} frequency={frequency} keyboardKey={keyboardKey} />
        )}
      </For>
      <Controls />
    </>
  );
}

function Controls() {
  const [adsr, setAdsr] = adsrStore;
  return (
    <div>
      <Range
        label="ATK"
        input={{
          value: adsr.attack,
          onInput: (e) => setAdsr({ attack: e.currentTarget.valueAsNumber }),
        }}
      />
      <Range
        label="DEC"
        input={{
          value: adsr.decay,
          onInput: (e) => setAdsr({ decay: e.currentTarget.valueAsNumber }),
        }}
      />
      <Range
        label="SUS"
        input={{
          value: adsr.sustain,
          onInput: (e) => setAdsr({ sustain: e.currentTarget.valueAsNumber }),
        }}
      />
      <Range
        label="REL"
        input={{
          value: adsr.release,
          onInput: (e) => setAdsr({ release: e.currentTarget.valueAsNumber }),
        }}
      />
    </div>
  );
}

function Range(props: {
  label: string;
  input: JSX.HTMLAttributes<HTMLInputElement> & { value: number };
}) {
  return (
    <label>
      {props.label}
      <input type="range" min="0" max="1" step="0.01" {...props.input} />
    </label>
  );
}

render(Index, document.getElementById("main")!);
