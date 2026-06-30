import React from 'react';
import SysExMonitor from './SysExMonitor';

interface MonitorViewProps {
  onBack: () => void;
}

export function MonitorView({ onBack }: MonitorViewProps) {
  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← Back to Controller
      </button>
      <SysExMonitor />
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    padding: '8px 16px',
    fontSize: 14,
    cursor: 'pointer',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: 4,
  },
} as const;
