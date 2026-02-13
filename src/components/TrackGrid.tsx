import React from "react";
import { RC600State } from "../types/rc600";

type Props = {
  state: RC600State;
};

export const TrackGrid: React.FC<Props> = ({ state }) => {
  const tracks = [1, 2, 3, 4, 5, 6];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {tracks.map((t) => {
        const tr = state.tracks[t];

        const color = tr?.recording
          ? "red"
          : tr?.playing
          ? "limegreen"
          : "gray";

        return (
          <div
            key={t}
            style={{
              padding: 20,
              borderRadius: 12,
              background: "#111",
              textAlign: "center",
              color: "white",
              boxShadow: `0 0 10px ${color}`
            }}
          >
            <div>TRACK {t}</div>
            <div
              style={{
                marginTop: 10,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: color,
                marginInline: "auto"
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
