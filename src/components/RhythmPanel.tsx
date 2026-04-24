import React from "react";
import { RhythmKits, RhythmConfig } from "../midi/rc600Rhythm";

type Props = {
  config: RhythmConfig;
  onChange: (config: RhythmConfig) => void;
  onRandomize: () => void;
};

export const RhythmPanel: React.FC<Props> = ({
  config,
  onChange,
  onRandomize
}) => {
  return (
    <div style={{ padding: 20, background: "#1a1a1a", color: "white", borderRadius: 12 }}>
      <h3>Rhythm Control</h3>

      {/* Kit Selector */}
      <select
        value={config.kit}
        onChange={(e) =>
          onChange({ ...config, kit: e.target.value as any })
        }
      >
        {RhythmKits.map((kit) => (
          <option key={kit}>{kit}</option>
        ))}
      </select>

      {/* Tempo */}
      <div>
        <label>Tempo: {config.tempo}</label>
        <input
          type="range"
          min={60}
          max={200}
          value={config.tempo}
          onChange={(e) =>
            onChange({ ...config, tempo: +e.target.value })
          }
        />
      </div>

      {/* Fine Tempo */}
      <div>
        <label>Fine: {config.fineTempo}</label>
        <input
          type="range"
          min={-5}
          max={5}
          value={config.fineTempo}
          onChange={(e) =>
            onChange({ ...config, fineTempo: +e.target.value })
          }
        />
      </div>

      {/* Swing */}
      <div>
        <label>Swing: {config.swing}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={config.swing}
          onChange={(e) =>
            onChange({ ...config, swing: +e.target.value })
          }
        />
      </div>

      {/* Randomizer */}
      <button onClick={onRandomize}>
        🎲 Randomize Rhythm
      </button>
    </div>
  );
};