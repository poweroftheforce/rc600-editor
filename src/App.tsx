import React, { useState } from "react";
import { useRC600MIDI } from "./hooks/useRC600MIDI";
import { TrackGrid } from "./components/TrackGrid";
import { RC600CC } from "./midi/rc600CC";
import { RhythmPanel } from "./components/RhythmPanel";

export default function App() {
  const {
    state,
    sendCC,
    level,
    updateRhythmLevel,
    rhythmConfig,
    setRhythmConfig,
    lockState,
    snapshots,
    toggleLock,
    saveSnapshot,
    loadSnapshot,
    updateTempo,
    randomizeRhythm,
    saveConfig,
    loadConfig,
    downloadConfig
  } = useRC600MIDI();

  return (
    <div style={{ padding: 20 }}>
      <h1>RC-600 Controller</h1>

      <button onClick={() => sendCC(RC600CC.RHYTHM_START_STOP, 127)}>
        Toggle Rhythm
      </button>

      <TrackGrid state={state} />

      <RhythmPanel
        config={rhythmConfig}
        level={level}
        locks={lockState}
        snapshots={snapshots}
        updateRhythmLevel={updateRhythmLevel}
        onChange={(cfg) => {
          setRhythmConfig(cfg);
          updateTempo(cfg.tempo, cfg.fineTempo);
        }}
        onRandomize={() => randomizeRhythm(level)}
        toggleLock={toggleLock}
        saveSnapshot={saveSnapshot}
        loadSnapshot={loadSnapshot}
      />
    </div>
  );
}
