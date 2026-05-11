import React from "react";

type Track = {
  id: number;
  name: string;
  level: number;
  muted: boolean;
  playing: boolean;
};

type Props = {
  tracks: Track[];
  onLevelChange: (trackId: number, level: number) => void;
  onToggleMute: (trackId: number) => void;
  onTogglePlay: (trackId: number) => void;
};

export default function TrackGrid({
  tracks,
  onLevelChange,
  onToggleMute,
  onTogglePlay
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="rounded-2xl shadow-lg p-4 border bg-white"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{track.name}</h3>
            <button
              onClick={() => onTogglePlay(track.id)}
              className="px-3 py-1 rounded-xl border"
            >
              {track.playing ? "Stop" : "Play"}
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Level</label>
            <input
              type="range"
              min={0}
              max={127}
              value={track.level}
              onChange={(e) =>
                onLevelChange(track.id, Number(e.target.value))
              }
              className="w-full"
            />
          </div>

          <button
            onClick={() => onToggleMute(track.id)}
            className="w-full px-3 py-2 rounded-xl border"
          >
            {track.muted ? "Unmute" : "Mute"}
          </button>
        </div>
      ))}
    </div>
  );
}
