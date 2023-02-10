import { render } from "solid-js/web";
import { For } from "solid-js";
import { createStore } from "solid-js/store";
import "./styles.css";
import { FREQUENCIES } from "./~consts";
import { gainPlugin } from "./plugins/Gain";
import { lowpassPlugin } from "./plugins/Lowpass";
import { AudioPlugin } from "./~types";

function createOscillator({
  audioCtx,
  frequency,
  plugins,
}: {
  audioCtx: AudioContext;
  frequency: number;
  plugins: AudioPlugin[];
}): Osc {
  const osc = audioCtx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = frequency;

  let currNode: AudioNode = osc;
  let offCallbacks: (() => void)[] = [];
  for (const plugin of plugins) {
    const { audioNode, off } = plugin.setup();
    offCallbacks.push(off);
    currNode.connect(audioNode);
    currNode = audioNode;
  }
  currNode.connect(audioCtx.destination);
  osc.start();

  return {
    osc,
    off() {
      for (const off of offCallbacks) off();
    },
  };
}

type Osc = {
  osc: OscillatorNode;
  off: () => void;
};

function Key(props: {
  label: string;
  frequency: number;
  keyboardKey: string;
  plugins: AudioPlugin[];
  audioCtx: AudioContext;
}) {
  const [oscsPlaying, setOscsPlaying] = createStore<Osc[]>([]);

  function play() {
    if (oscsPlaying.length) return;

    setOscsPlaying(() => [
      createOscillator(props),
      // createOscillator(props.frequency + DETUNE),
      // createOscillator(props.frequency - DETUNE),
    ]);
  }
  function pause() {
    setOscsPlaying((oscs) => {
      oscs.forEach((osc) => osc.off());
      return [];
    });
  }

  function isThisKey(key: KeyboardEvent) {
    return key.key === props.keyboardKey;
  }

  document.addEventListener("keydown", (key) => isThisKey(key) && play());
  document.addEventListener("keyup", (key) => isThisKey(key) && pause());

  return (
    <button onMouseDown={play} onMouseUp={pause} onMouseOut={pause}>
      {props.label}
    </button>
  );
}

function Index() {
  const audioCtx = new AudioContext();
  if (!audioCtx) throw new Error("Trash");

  const Gain = gainPlugin({ audioCtx });
  const Lowpass = lowpassPlugin({ audioCtx });
  const plugins = [Gain, Lowpass];
  return (
    <>
      <For each={Object.entries(FREQUENCIES)}>
        {([label, { frequency, keyboardKey }]) => (
          <Key
            label={label}
            frequency={frequency}
            keyboardKey={keyboardKey}
            plugins={plugins}
            audioCtx={audioCtx}
          />
        )}
      </For>
      <Gain.Controls />
      <Lowpass.Controls />
    </>
  );
}

render(Index, document.getElementById("main")!);
