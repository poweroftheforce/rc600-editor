import { useEffect, useRef, useState } from "react";
import { RC600CC } from "../midi/rc600CC";
import { RC600State, TrackState } from "../types/rc600";

/**
 * Calculates the Roland/Boss Checksum for a single array payload
 */
function rolandChecksum(payload: number[]): number {
  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    sum += payload[i];
  }
  const checksum = 128 - (sum % 128);
  return checksum === 128 ? 0 : checksum;
}


function useRC600MIDI() {
  const [state, setState] = useState<RC600State>({
    rhythmOn: false,
    tracks: {}
  });
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<WebMidi.MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<WebMidi.MIDIOutput[]>([]);
  const midiInRef = useRef<WebMidi.MIDIInput | null>(null);
  const midiOutRef = useRef<WebMidi.MIDIOutput | null>(null);

  // request MIDI access
  useEffect(() => {
    navigator.requestMIDIAccess({ sysex: false, software: true }).then((access) => {
      setMidiAccess(access);

      const ins = Array.from(access.inputs.values());
      const outs = Array.from(access.outputs.values());

      setInputs(ins);
      setOutputs(outs);

      // auto-select RC-600 if present
      const rcIn = ins.find(i => i.name?.includes("RC-600")) || ins[0];
      const rcOut = outs.find(o => o.name?.includes("RC-600")) || outs[0];

      if (rcIn) midiInRef.current = rcIn;
      if (rcOut) midiOutRef.current = rcOut;
    });
  }, []);

  useEffect(() => {
    const input = midiInRef.current;
    if (!input) return;

    const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
      const [status, data1, data2] = event.data;
      const type = status & 0xf0;
      const channel = status & 0x0f;

      if (type === 0xb0) {
        handleCC(data1, data2, channel);
      }

      if (type === 0x90 || type === 0x80) {
        handleNote(data1, data2, channel);
      }
    };

    input.onmidimessage = handleMidiMessage;

    return () => {
      input.onmidimessage = null;
    };
  }, [inputs]);

  /**
   * @typedef {Object} TrackState
   * @property {boolean} playing
   * @property {boolean} recording
   */

  /**
   * @typedef {Object} RC600State
   * @property {boolean} rhythmOn
   * @property {Object.<number, TrackState>} tracks
   */

  const rcState: {
    rhythmOn: boolean;
    tracks: Record<number, TrackState>;
  } = {
    rhythmOn: false,
    tracks: {}
  };

  // 🎧 Handle incoming MIDI
  function handleMessage(event: WebMidi.MIDIMessageEvent) {
    const [status, data1, data2] = event.data;
    const type = status & 0xf0;

    if (type === 0xb0) handleCC(data1, data2, status & 0x0f);
  }

  // function handleCC(cc: number, value: number, channel: number) {
  //   switch (cc) {
  //     case 94: // Rhythm Start/Stop
  //       rcState.rhythmOn = value > 0;
  //       console.log("handleCC::Rhythm:", rcState.rhythmOn ? "ON" : "OFF");
  //       break;

  //     case 80: // example track state
  //       updateTrackState(1, value);
  //       console.log("handleCC::Track 1:", rcState.tracks[1]);
  //       break;

  //     default:
  //       console.log(`handleCC::default CC ${cc} = ${value}`);
  //       break;
  //   }
  // }
  function handleCC(cc: number, value: number, channel: number) {
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

        if (key === "stopped") {
          next.tracks[trackNum] = {
            playing: false,
            recording: false,
            stopped: value > 0
          };
        } else {
          next.tracks[trackNum] = {
            ...prevTrack,
            [key]: value > 0,
            stopped: key === "playing" ? !(value > 0) && prevTrack.stopped : prevTrack.stopped
          };
        }
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

  function handleNote(note: number, velocity: number, channel: number) {
    // RC-600 sometimes uses note events for triggers
    console.log("NOTE:", note, velocity, channel);
  }

  function updateTrackState(track: number, value: number) {
    rcState.tracks[track] = {
      playing: value === 127,
      recording: value === 64,
      stopped: false
    };

    console.log("updateTrackState::Track", track, rcState.tracks[track]);
  }

  function sendCC(cc: number, value: number, humanChannel = 10) {
    const output = midiOutRef.current;
    const channel = humanChannel - 1;

    if (!output) return;
    console.log(0xb0 + channel, cc, value);
    output.send([0xb0 + channel, cc, value]);
  }

  function sendSysEx(address: number[], data: number[]) {
    if (!midiOutRef.current) return;

    const payload = [...address, ...data];
    const checksum = rolandChecksum(payload);

    midiOutRef.current.send([
      0xf0,
      0x41,       // Roland
      0x10,       // Device ID (default)
      0x00,
      0x00,
      0x00,
      0x32,       // RC-600 model family
      0x12,       // DT1 (data set)
      ...payload,
      checksum,
      0xf7
    ]);
  }

  return {
    handleMessage,
    midiInRef,
    midiOutRef,
    sendCC,
    sendSysEx,
    state
  };
}

export { useRC600MIDI as useMidi };