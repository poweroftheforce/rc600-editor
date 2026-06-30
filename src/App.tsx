import React from "react";
import { useRC600MIDI } from "./hooks/useRC600MIDI";
import { ControllerView } from "./components/ControllerView";
import { MonitorView } from "./components/MonitorView";
import { VIEWS } from "./types/app";
import type { ViewType } from "./types/app";

export default function App() {
  const [currentView, setCurrentView] = React.useState<ViewType>(VIEWS.CONTROLLER);

  const {
    rhythmConfig,
    setRhythmConfig,
    applyRhythmConfig,
    randomizeRhythm,
    triggerRhythmStartStop,
    lockState,
    toggleLock
  } = useRC600MIDI();

  if (currentView === VIEWS.MONITOR) {
    return (
      <MonitorView
        onBack={() => setCurrentView(VIEWS.CONTROLLER)}
      />
    );
  }

  return (
    <ControllerView
      rhythmConfig={rhythmConfig}
      lockState={lockState}
      onRhythmToggle={() => triggerRhythmStartStop()}
      onConfigChange={(cfg) => {
        setRhythmConfig(cfg);
        applyRhythmConfig(cfg);
      }}
      onRandomize={() => randomizeRhythm()}
      onToggleLock={toggleLock}
      onNavigateToMonitor={() => setCurrentView(VIEWS.MONITOR)}
    />
  );
}
