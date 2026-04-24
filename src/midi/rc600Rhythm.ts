export const RhythmKits = [
  "Rock",
  "Pop",
  "Funk",
  "Jazz",
  "Metal",
  "Latin",
  "Blues",
  "EDM"
] as const;

export type RhythmKit = typeof RhythmKits[number];

export type RhythmConfig = {
  kit: RhythmKit;
  tempo: number;
  fineTempo: number; // +/- adjustment
  variation: number;
  swing: number;
  level: number;
};