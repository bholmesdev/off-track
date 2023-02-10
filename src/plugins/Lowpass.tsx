import { createStore } from "solid-js/store";
import { AudioPlugin } from "../~types";
import Range from "../components/Range";

export function lowpassPlugin(props: { audioCtx: AudioContext }): AudioPlugin {
  const [store, setStore] = createStore({
    frequency: 1,
    q: 0,
  });
  return {
    name: "Lowpass",
    setup() {
      const maxFrequency = props.audioCtx.sampleRate / 2;
      const filter = props.audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = store.frequency * maxFrequency;
      filter.Q.value = store.q * 30;
      return {
        audioNode: filter,
        off() {},
      };
    },
    Controls() {
      return (
        <>
          <Range
            label="Frequency"
            input={{
              value: store.frequency,
              onInput: (e) =>
                setStore({ frequency: e.currentTarget.valueAsNumber }),
            }}
          />
          <Range
            label="Q"
            input={{
              value: store.q,
              onInput: (e) => setStore({ q: e.currentTarget.valueAsNumber }),
            }}
          />
        </>
      );
    },
  };
}
