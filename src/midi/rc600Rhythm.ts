export const RhythmGenres = [
  "ACOUSTIC",
  "BALLAD",
  "BLUES",
  "JAZZ",
  "FUSION",
  "R&B",
  "SOUL",
  "FUNK",
  "POP",
  "SOFT ROCK",
  "ROCK",
  "ALT ROCK",
  "PUNK",
  "HEAVY ROCK",
  "METAL",
  "TRAD",
  "WORLD",
  "BALLRM",
  "ELCTRO",
  "GUIDE",
  "USER"
] as const;

export type RhythmGenre = typeof RhythmGenres[number];

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
  genre: RhythmGenre;
  pattern: string;
  variation: number;
  kit: RhythmKit;
  beat: string;
  tempo: number;
  fineTempo: number;
  /*swing: number;*/
  level: number;
  startTrig: string;
  stopTrig: string;
};

export type RhythmLockKey = keyof RhythmConfig;
export type RhythmLockState = Partial<Record<RhythmLockKey, boolean>>;

export type RhythmSnapshot = {
  name: string;
  config: RhythmConfig;
  locks: RhythmLockState;
  savedAt: string;
};
