import React, { useState } from "react";
import {
  RhythmKits,
  RhythmGenres,
  RhythmConfig,
  RhythmLockKey,
  RhythmLockState,
  RhythmSnapshot
} from "../midi/rc600Rhythm";

type Props = {
  config: RhythmConfig;
  level: number;
  locks: RhythmLockState;
  snapshots: RhythmSnapshot[];
  updateRhythmLevel: (level: number) => void;
  onChange: (config: RhythmConfig) => void;
  onRandomize: () => void;
  toggleLock: (field: RhythmLockKey) => void;
  saveSnapshot: (name: string) => void;
  loadSnapshot: (name: string) => void;
};

export const RhythmPanel: React.FC<Props> = ({
  config,
  level,
  locks,
  snapshots,
  updateRhythmLevel,
  onChange,
  onRandomize,
  toggleLock,
  saveSnapshot,
  loadSnapshot
}) => {
  const [snapshotName, setSnapshotName] = useState("");

  const lockFields: Array<{ key: RhythmLockKey; label: string }> = [
    { key: "genre", label: "Genre" },
    { key: "kit", label: "Kit" },
    { key: "variation", label: "Variation" },
    { key: "beat", label: "Beat" },
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
          <label>Genre</label>
          <select
            value={config.genre}
            onChange={(e) => onChange({ ...config, genre: e.target.value as any })}
            style={{ width: "100%" }}
          >
            {RhythmGenres.map((genre) => (
              <option key={genre}>{genre}</option>
            ))}
          </select>
        </div>

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
          <label>Level: {level}</label>
          <input
            type="range"
            min={0}
            max={127}
            value={level}
            onChange={(e) => updateRhythmLevel(+e.target.value)}
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

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {lockFields.map((field) => (
            <button
              key={field.key}
              type="button"
              onClick={() => toggleLock(field.key)}
              style={{
                padding: "8px 10px",
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

        <div style={{ borderTop: "1px solid #444", paddingTop: 12, marginTop: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>Snapshots</div>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder="Snapshot name"
              style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #444", background: "#111", color: "white" }}
            />
            <button
              type="button"
              onClick={() => {
                saveSnapshot(snapshotName);
                setSnapshotName("");
              }}
              style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#2f8", color: "#111", cursor: "pointer" }}
            >
              Save
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {snapshots.length === 0 ? (
              <div style={{ color: "#aaa" }}>No snapshots saved yet.</div>
            ) : (
              snapshots.map((snapshot) => (
                <button
                  key={snapshot.name}
                  type="button"
                  onClick={() => loadSnapshot(snapshot.name)}
                  style={{ textAlign: "left", padding: 10, borderRadius: 8, border: "1px solid #444", background: "#222", color: "white" }}
                >
                  {snapshot.name} • {new Date(snapshot.savedAt).toLocaleTimeString()}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
