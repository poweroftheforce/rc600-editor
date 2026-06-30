import React from 'react';
import { RhythmPanel } from './RhythmPanel';
import type { RhythmConfig, RhythmLockKey, RhythmLockState } from '../midi/rc600Rhythm';

interface ControllerViewProps {
  rhythmConfig: RhythmConfig;
  lockState: RhythmLockState;
  onRhythmToggle: () => void;
  onConfigChange: (config: RhythmConfig) => void;
  onRandomize: () => void;
  onToggleLock: (field: RhythmLockKey) => void;
  onNavigateToMonitor: () => void;
}

export function ControllerView({
  rhythmConfig,
  lockState,
  onRhythmToggle,
  onConfigChange,
  onRandomize,
  onToggleLock,
  onNavigateToMonitor,
}: ControllerViewProps) {
  return (
    <div style={styles.container}>
      <h1>RC-600 Controller</h1>

      <div style={styles.buttonBar}>
        <button onClick={onRhythmToggle} style={styles.button}>
          Toggle Rhythm
        </button>
        <button onClick={onNavigateToMonitor} style={styles.button}>
          🔍 SysEx Monitor
        </button>
      </div>

      <RhythmPanel
        config={rhythmConfig}
        locks={lockState}
        toggleLock={onToggleLock}
        onChange={onConfigChange}
        onRandomize={onRandomize}
      />
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },
  buttonBar: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    padding: '8px 16px',
    fontSize: 14,
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 4,
  },
} as const;
