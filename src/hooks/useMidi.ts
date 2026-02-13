import { useEffect, useRef, useState } from "react";

export function useRC600MIDI() {
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

  type TrackState = {
    playing: boolean;
    recording: boolean;
  };

  function handleCC(cc: number, value: number, channel: number) {
    switch (cc) {
      case 94: // Rhythm Start/Stop
        rcState.rhythmOn = value > 0;
        console.log("Rhythm:", rcState.rhythmOn ? "ON" : "OFF");
        break;

      case 80: // example track state
        updateTrackState(1, value);
        break;

      default:
        // console.log(`CC ${cc} = ${value}`);
        break;
    }
  }

  function handleNote(note: number, velocity: number, channel: number) {
    // RC-600 sometimes uses note events for triggers
    console.log("NOTE:", note, velocity, channel);
  }

  function updateTrackState(track: number, value: number) {
    rcState.tracks[track] = {
      playing: value === 127,
      recording: value === 64
    };

    console.log("Track", track, rcState.tracks[track]);
  }

  function sendCC(cc: number, value: number, channel = 0) {
    const output = midiOutRef.current;
    if (!output) return;

    output.send([0xb0 + channel, cc, value]);
  }
}