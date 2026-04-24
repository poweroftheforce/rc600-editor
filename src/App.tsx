import React, { useState } from "react";
import { useRC600MIDI } from "./hooks/useRC600MIDI";
import { TrackGrid } from "./components/TrackGrid";
import { RC600CC } from "./midi/rc600CC";
import { RhythmPanel } from "./components/RhythmPanel";

export default function App() {
  const {
  state,
  sendCC,
  rhythmConfig,
  setRhythmConfig,
  updateTempo,
  randomizeRhythm,
  saveConfig,
  loadConfig,
  downloadConfig
} = useRC600MIDI();

  //const [rhythmConfig, setRhythmConfig] = useState({ tempo: 120, fineTempo: 0, kit: 0, variation: 0, swing: 0, level: 100 });


  return (
    <div style={{ padding: 20 }}>
      <h1>RC-600 Controller</h1>

      <button onClick={() => sendCC(RC600CC.RHYTHM_START_STOP, 127)}>
        Toggle Rhythm
      </button>

      <TrackGrid state={state} />

      <RhythmPanel
        config={rhythmConfig}
        onChange={(cfg) => {
          setRhythmConfig(cfg);
          updateTempo(cfg.tempo, cfg.fineTempo);
        }}
        onRandomize={randomizeRhythm}
      />
    </div>
  );
}
