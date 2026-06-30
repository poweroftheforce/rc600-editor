export type TrackState = {
  playing: boolean;
  recording: boolean;
  stopped: boolean;
};

export type RC600State = {
  rhythmOn: boolean;
  tracks: Record<number, TrackState>;
};
