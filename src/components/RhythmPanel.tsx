import React from "react";
import {
  RhythmKits,
  RhythmConfig,
  RhythmLockKey,
  RhythmLockState
} from "../midi/rc600Rhythm";

type Props = {
  config: RhythmConfig;
  locks: RhythmLockState;
  toggleLock: (field: RhythmLockKey) => void;
  onChange: (config: RhythmConfig) => void;
  onRandomize: () => void;
};

export const RhythmPanel: React.FC<Props> = ({
  config,
  locks,
  toggleLock,
  onChange,
  onRandomize
}) => {
  const lockFields: Array<{ key: RhythmLockKey; label: string }> = [
    { key: "kit", label: "Kit" },
    { key: "tempo", label: "Tempo" },
    { key: "fineTempo", label: "Fine Tempo" },
    { key: "swing", label: "Swing" },
    { key: "level", label: "Level" }
  ];

  return (
    <div style={{ padding: 20, background: "#1a1a1a", color: "white", borderRadius: 12 }}>
      <h3>Rhythm Control</h3>

      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label>Kit</label>
          <select
            value={config.kit}
            onChange={(e) => onChange({ ...config, kit: e.target.value as any })}
            style={{ width: "100%" }}
          >
            {RhythmKits.map((kit) => (
              <option key={kit}>{kit}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Level: {config.level}</label>
          <input
            type="range"
            min={0}
            max={127}
            value={config.level}
            onChange={(e) => onChange({ ...config, level: +e.target.value })}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>Tempo: {config.tempo}</label>
          <input
            type="range"
            min={60}
            max={200}
            value={config.tempo}
            onChange={(e) => onChange({ ...config, tempo: +e.target.value })}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>Fine: {config.fineTempo}</label>
          <input
            type="range"
            min={-5}
            max={5}
            value={config.fineTempo}
            onChange={(e) => onChange({ ...config, fineTempo: +e.target.value })}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>Swing: {config.swing}</label>
          <input
            type="range"
            min={0}
            max={100}
            value={config.swing}
            onChange={(e) => onChange({ ...config, swing: +e.target.value })}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {lockFields.map((field) => (
            <button
              key={field.key}
              type="button"
              onClick={() => toggleLock(field.key)}
              style={{
                flex: "1 1 120px",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #444",
                background: locks[field.key] ? "#2f8" : "#333",
                color: "white",
                cursor: "pointer"
              }}
            >
              {locks[field.key] ? "🔒" : "🔓"} {field.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRandomize}
          style={{ marginTop: 12, padding: "12px 16px", borderRadius: 10, background: "#0a74da", color: "white", border: "none", cursor: "pointer" }}
        >
          🎲 Randomize Rhythm
        </button>
      </div>
    </div>
  );
};
