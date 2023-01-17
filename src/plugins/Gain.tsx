import { STAGE_MAX_TIME } from "../~consts";
import { AudioPlugin } from "../~types";
import { createStore } from "solid-js/store";
import Range from "../components/Range";

export default function gainPlugin(props: {
  audioCtx: AudioContext;
}): AudioPlugin {
  const [adsr, setAdsr] = createStore({
    attack: 0.01,
    decay: 0.1,
    sustain: 0.2,
    release: 0.1,
  });
  return {
    setup() {
      const gainNode = props.audioCtx.createGain();

      const now = props.audioCtx.currentTime;
      const atkDuration = adsr.attack * STAGE_MAX_TIME;
      const atkEnd = now + atkDuration;
      const decDuration = adsr.decay * STAGE_MAX_TIME;

      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.5, atkEnd);
      gainNode.gain.setTargetAtTime(adsr.sustain, atkEnd, decDuration);

      return {
        audioNode: gainNode,
        off() {
          const now = props.audioCtx.currentTime;
          const relDuration = adsr.release * STAGE_MAX_TIME;
          const relEnd = now + relDuration;

          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.linearRampToValueAtTime(0, relEnd);
          //   gainNode.addEventListener(
          //     "ended",
          //     () => {
          //       gainNode.disconnect();
          //     },
          //     { once: true }
          //   );
        },
      };
    },
    Controls() {
      return (
        <>
          <Range
            label="ATK"
            input={{
              value: adsr.attack,
              onInput: (e) =>
                setAdsr({ attack: e.currentTarget.valueAsNumber }),
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
              onInput: (e) =>
                setAdsr({ sustain: e.currentTarget.valueAsNumber }),
            }}
          />
          <Range
            label="REL"
            input={{
              value: adsr.release,
              onInput: (e) =>
                setAdsr({ release: e.currentTarget.valueAsNumber }),
            }}
          />
        </>
      );
    },
  };
}
