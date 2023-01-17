import * as rangeSlider from "@zag-js/range-slider";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createMemo, For, createUniqueId } from "solid-js";

export function RangeSlider() {
  const [state, send] = useMachine(
    rangeSlider.machine({
      id: createUniqueId(),
      value: [60],
      thumbAlignment: "center",
    })
  );

  const api = createMemo(() =>
    rangeSlider.connect(state, send, normalizeProps)
  );

  return (
    <div class="p-4 bg-slate-100" {...api().rootProps}>
      <div class="h-2 bg-red-600" {...api().trackProps}>
        <div {...api().rangeProps} />
      </div>
      <For each={api().value}>
        {(_, index) => (
          <div
            class="rounded-full w-8 h-8 bg-red-700"
            {...api().getThumbProps(index())}
          >
            <input {...api().getHiddenInputProps(index())} />
          </div>
        )}
      </For>
    </div>
  );
}
