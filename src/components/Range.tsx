import type { JSX } from "solid-js";

export default function Range(props: {
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
