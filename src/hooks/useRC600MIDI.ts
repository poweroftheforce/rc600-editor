import { useEffect, useRef, useState } from "react";
import { RC600CC } from "../midi/rc600CC";
import { RC600State, TrackState } from "../types/rc600";
import { RhythmConfig, RhythmKits } from "../midi/rc600Rhythm";

export function useRC600MIDI() {
  const [state, setState] = useState<RC600State>({
    rhythmOn: false,
    tracks: {}
  });

  const midiInRef = useRef<WebMidi.MIDIInput | null>(null);
  const midiOutRef = useRef<WebMidi.MIDIOutput | null>(null);

  const [rhythmConfig, setRhythmConfig] = useState<RhythmConfig>({
    kit: "Rock",
    tempo: 120,
    fineTempo: 0,
    variation: 0,
    swing: 0,
    level: 100
  });

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

  function sendTempo(bpm: number) {
    console.log("Sending tempo:", bpm);

    // placeholder for SysEx
    // sendSysEx([...tempo address..., bpm]);
  }

  function updateTempo(coarse: number, fine: number) {
    const finalTempo = coarse + fine;

    setRhythmConfig(prev => ({
      ...prev,
      tempo: coarse,
      fineTempo: fine
    }));

    sendTempo(finalTempo);
  }

  function randomizeRhythm() {
    const randomKit =
      RhythmKits[Math.floor(Math.random() * RhythmKits.length)];

    const newConfig: RhythmConfig = {
      kit: randomKit,
      tempo: Math.floor(Math.random() * (160 - 70) + 70),
      fineTempo: Math.floor(Math.random() * 5) - 2,
      variation: Math.floor(Math.random() * 3),
      swing: Math.floor(Math.random() * 100),
      level: Math.floor(Math.random() * 127)
    };

    setRhythmConfig(newConfig);

    // apply to hardware
    sendTempo(newConfig.tempo + newConfig.fineTempo);
    console.log("Randomized rhythm:", newConfig);
  }

  function saveConfig(config: RhythmConfig) {
    const json = JSON.stringify(config, null, 2);
    localStorage.setItem("rc600-rhythm", json);
  }

  function loadConfig(): RhythmConfig | null {
    const raw = localStorage.getItem("rc600-rhythm");
    return raw ? JSON.parse(raw) : null;
  }

  function downloadConfig(config: RhythmConfig) {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rc600-rhythm.json";
    a.click();
  }

  return {
    state,
    sendCC,
    rhythmConfig,
    setRhythmConfig,
    updateTempo,
    randomizeRhythm,
    saveConfig,
    loadConfig,
    downloadConfig
  };
}
