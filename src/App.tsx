import React from "react";
import { useRC600MIDI } from "./hooks/useRC600MIDI";
import { TrackGrid } from "./components/TrackGrid";
import { RC600CC } from "./midi/rc600CC";

export default function App() {
  const { state, sendCC } = useRC600MIDI();

  return (
    <div style={{ padding: 20 }}>
      <h1>RC-600 Controller</h1>

      <button onClick={() => sendCC(RC600CC.RHYTHM_START_STOP, 127)}>
        Toggle Rhythm
      </button>

      <TrackGrid state={state} />
    </div>
  );
}
