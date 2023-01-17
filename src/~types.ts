import type { Component } from "solid-js";

export type AudioPlugin = {
  Controls: Component;
  setup(): {
    audioNode: AudioNode;
    off(): void;
  };
};
