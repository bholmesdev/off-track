import type { Component } from "solid-js";

export type AudioPlugin = {
  name: string;
  Controls: Component;
  setup(): {
    audioNode: AudioNode;
    off(): void;
  };
};
