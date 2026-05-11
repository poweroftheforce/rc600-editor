import React from "react";
import { useRC600MIDI } from "./hooks/useRC600MIDI";
import { RhythmPanel } from "./components/RhythmPanel";
import SysExMonitor from "./components/SysExMonitor";

export default function App() {
  const [currentView, setCurrentView] = React.useState<'controller' | 'monitor'>('controller');

  const {
    rhythmConfig,
    setRhythmConfig,
    randomizeRhythm,
    applyRhythmConfig,
    triggerRhythmStartStop,
    lockState,
    toggleLock
  } = useRC600MIDI();

  if (currentView === 'monitor') {
    return (
      <div>
        <button onClick={() => setCurrentView('controller')}>
          ← Back to Controller
        </button>
        <SysExMonitor />
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>RC-600 Controller</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setCurrentView('monitor')}>
          SysEx Monitor
        </button>
      </div>

      <button onClick={() => triggerRhythmStartStop()}>
        Toggle Rhythm
      </button>

      <RhythmPanel
        config={rhythmConfig}
        locks={lockState}
        toggleLock={toggleLock}
        onChange={(cfg) => {
          setRhythmConfig(cfg);
          applyRhythmConfig(cfg);
        }}
        onRandomize={() => randomizeRhythm()}
      />
    </div>
  );
}
