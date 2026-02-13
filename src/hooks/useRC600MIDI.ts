import { useEffect, useRef, useState } from "react";
import { RC600CC } from "../midi/rc600CC";
import { RC600State, TrackState } from "../types/rc600";

export function useRC600MIDI() {
  const [state, setState] = useState<RC600State>({
    rhythmOn: false,
    tracks: {}
  });

  const midiInRef = useRef<WebMidi.MIDIInput | null>(null);
  const midiOutRef = useRef<WebMidi.MIDIOutput | null>(null);

  // 🎹 Connect to MIDI
  useEffect(() => {
    navigator
      .requestMIDIAccess({ sysex: false, software: true })
      .then((access) => {
        const inputs = Array.from(access.inputs.values());
        const outputs = Array.from(access.outputs.values());

        midiInRef.current =
          inputs.find((i) => i.name?.includes("RC-600")) || inputs[0];

        midiOutRef.current =
          outputs.find((o) => o.name?.includes("RC-600")) || outputs[0];

        if (midiInRef.current) {
          midiInRef.current.onmidimessage = handleMessage;
        }
      });
  }, []);

  // 🎧 Handle incoming MIDI
  function handleMessage(event: WebMidi.MIDIMessageEvent) {
    const [status, data1, data2] = event.data;
    const type = status & 0xf0;

    if (type === 0xb0) handleCC(data1, data2);
  }

  function handleCC(cc: number, value: number) {
    setState((prev) => {
      const next = { ...prev, tracks: { ...prev.tracks } };

      // 🎵 Rhythm
      if (cc === RC600CC.RHYTHM_START_STOP) {
        next.rhythmOn = value > 0;
      }

      // 🎚 Track states
      const trackMap: Record<number, keyof TrackState> = {
        [RC600CC.TRACK1_PLAY]: "playing",
        [RC600CC.TRACK2_PLAY]: "playing",
        [RC600CC.TRACK3_PLAY]: "playing",
        [RC600CC.TRACK4_PLAY]: "playing",
        [RC600CC.TRACK5_PLAY]: "playing",
        [RC600CC.TRACK6_PLAY]: "playing",

        [RC600CC.TRACK1_REC]: "recording",
        [RC600CC.TRACK2_REC]: "recording",
        [RC600CC.TRACK3_REC]: "recording",
        [RC600CC.TRACK4_REC]: "recording",
        [RC600CC.TRACK5_REC]: "recording",
        [RC600CC.TRACK6_REC]: "recording",

        [RC600CC.TRACK1_STOP]: "stopped",
        [RC600CC.TRACK2_STOP]: "stopped",
        [RC600CC.TRACK3_STOP]: "stopped",
        [RC600CC.TRACK4_STOP]: "stopped",
        [RC600CC.TRACK5_STOP]: "stopped",
        [RC600CC.TRACK6_STOP]: "stopped"
      };

      if (trackMap[cc]) {
        const trackNum = getTrackFromCC(cc);
        const key = trackMap[cc];

        const prevTrack = prev.tracks[trackNum] || {
          playing: false,
          recording: false,
          stopped: true
        };

        next.tracks[trackNum] = {
          ...prevTrack,
          [key]: value > 0
        };
      }

      return next;
    });
  }

  function getTrackFromCC(cc: number): number {
    const map: Record<number, number> = {
      80: 1, 81: 2, 82: 3, 83: 4, 84: 5, 85: 6,
      70: 1, 71: 2, 72: 3, 73: 4, 74: 5, 75: 6,
      60: 1, 61: 2, 62: 3, 63: 4, 64: 5, 65: 6
    };
    return map[cc] || 1;
  }

  // 🚀 send MIDI out
  function sendCC(cc: number, value: number) {
    midiOutRef.current?.send([0xb0, cc, value]);
  }

  return { state, sendCC };
}
