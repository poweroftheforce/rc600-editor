import { useEffect, useState } from "react";
import { RC600CC } from "../midi/rc600CC";
import {
  RhythmConfig,
  RhythmGenres,
  RhythmKits,
  RhythmLockKey,
  RhythmLockState,
  RhythmSnapshot
} from "../midi/rc600Rhythm";
import { useMidi } from "./useMidi";

export function useRC600MIDI() {
  const beats = [
    "3/4",
    "4/4",
    "6/8",
    "7/8"
  ];

  const [rhythmConfig, setRhythmConfig] = useState<RhythmConfig>({
    kit: "Rock",
    tempo: 120,
    fineTempo: 0,
    variation: 0,
    /*swing: 0,*/
    level: 100,
    genre: RhythmGenres[0],
    beat: beats[2],
    pattern: "AUTO",
    startTrig: "LOOP START",
    stopTrig: "LOOP STOP",
  });

  const kitMap: Record<string, number> = {
    Rock: 0,
    Pop: 1,
    Funk: 2,
    Jazz: 3,
    Metal: 4,
    Latin: 5,
    Blues: 6,
    EDM: 7
  };

  const { sendCC, sendSysEx, state } = useMidi();
  const [level, setLevel] = useState<number>(100);
  const [lockState, setLockState] = useState<RhythmLockState>({});
  const [snapshots, setSnapshots] = useState<RhythmSnapshot[]>([]);

  const updateRhythmLevel = (newLevel: number) => {
    setLevel(newLevel);
    setRhythmConfig((prev) => ({ ...prev, level: newLevel }));
    // applyRhythmConfig({ ...rhythmConfig, level: newLevel });
    sendRhythmLevel(newLevel);
  };

  useEffect(() => {
    const raw = localStorage.getItem("rc600-snapshots");
    if (!raw) return;

    try {
      setSnapshots(JSON.parse(raw));
    } catch {
      setSnapshots([]);
    }
  }, []);

  // function mapMinMaxToACT(input: number, min: number, max: number) {
  function mapMinMaxToACT(input: number) {
    // Ranges: min-max to 1-127
    // return (input - min) * (127 - 1) / (max - min) + 1;
    return (input - 40) * (127 - 1) / (300 - 40) + 1;
  }

  function sendTempo(bpm: number) {
    // sendCC(RC600CC.TEMPO, mapMinMaxToACT(bpm, 40, 300));
    sendCC(RC600CC.TEMPO, mapMinMaxToACT(bpm));
  }

  function sendRhythmLevel(level: number) {
    sendCC(RC600CC.RHYTHM_LEVEL, level);
  }

  function sendVariation(variation: number) {
    sendCC(RC600CC.RHYTHM_VARIATION, variation);
  }

  function sendRhythmKit(kit: string) {
    sendCC(RC600CC.RHYTHM_KIT, kitMap[kit] ?? 0);
  }

  // function sendSwing(swing: number) {
  //   sendCC(RC600CC.SWING, swing);
  // }

  function triggerRhythmStartStop() {
    sendCC(RC600CC.RHYTHM_START_STOP, 127);
  }

  function triggerFill() {
    sendCC(RC600CC.RHYTHM_FILL, 127);
  }

  function updateTempo(coarse: number, fine: number) {
    const finalTempo = coarse + fine;

    setRhythmConfig(prev => ({
      ...prev,
      tempo: coarse,
      fineTempo: fine
    }));
    // applyRhythmConfig({
    //   ...rhythmConfig,
    //   tempo: coarse,
    //   fineTempo: fine
    // });

    sendTempo(finalTempo);
  }

  function randomizeRhythm(level: number = 100) {
    const current = rhythmConfig;

    const nextConfig: RhythmConfig = {
      genre: lockState.genre ? current.genre : RhythmGenres[Math.floor(Math.random() * RhythmGenres.length)],
      pattern: lockState.pattern ? current.pattern : "AUTO",
      variation: lockState.variation ? current.variation : Math.floor(Math.random() * 4),
      kit: lockState.kit ? current.kit : RhythmKits[Math.floor(Math.random() * RhythmKits.length)],
      beat: lockState.beat ? current.beat : beats[Math.floor(Math.random() * beats.length)],
      tempo: current.tempo,
      fineTempo: current.fineTempo,
      /*swing: lockState.swing ? current.swing : Math.floor(Math.random() * 100),*/
      level: lockState.level ? current.level : level,
      startTrig: lockState.startTrig ? current.startTrig : "LOOP START",
      stopTrig: lockState.stopTrig ? current.stopTrig : "LOOP STOP"
    };

    setRhythmConfig(nextConfig);
    applyRhythmConfig(nextConfig);
  }

  function applyRhythmConfig(config: RhythmConfig) {
    sendTempo(config.tempo + config.fineTempo);
    sendRhythmKit(config.kit);
    sendVariation(config.variation);
    //sendSwing(config.swing);
    // sendRhythmLevel(config.level);
    updateRhythmLevel(config.level);
  }

  function saveConfig(config: RhythmConfig) {
    const json = JSON.stringify(config, null, 2);
    localStorage.setItem("rc600-rhythm", json);
  }

  function loadConfig(): RhythmConfig | null {
    const raw = localStorage.getItem("rc600-rhythm");
    return raw ? JSON.parse(raw) : null;
  }

  function persistSnapshots(nextSnapshots: RhythmSnapshot[]) {
    setSnapshots(nextSnapshots);
    localStorage.setItem("rc600-snapshots", JSON.stringify(nextSnapshots));
  }

  function toggleLock(field: RhythmLockKey) {
    setLockState((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  }

  function saveSnapshot(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const nextSnapshots = [
      ...snapshots.filter((snapshot) => snapshot.name !== trimmed),
      {
        name: trimmed,
        config: rhythmConfig,
        locks: lockState,
        savedAt: new Date().toISOString()
      }
    ];

    persistSnapshots(nextSnapshots);
  }

  function loadSnapshot(name: string) {
    const snapshot = snapshots.find((snapshot) => snapshot.name === name);
    if (!snapshot) return;

    setLockState(snapshot.locks);
    setLevel(snapshot.config.level);

    setRhythmConfig(snapshot.config);
    applyRhythmConfig(snapshot.config);
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

  function savePreset(name: string) {
    const presets = JSON.parse(
      localStorage.getItem("rc600-presets") || "{}"
    );

    presets[name] = rhythmConfig;

    localStorage.setItem(
      "rc600-presets",
      JSON.stringify(presets, null, 2)
    );
  }

  function loadPreset(name: string) {
    const presets = JSON.parse(
      localStorage.getItem("rc600-presets") || "{}"
    );

    if (!presets[name]) return;

    setRhythmConfig(presets[name]);
    applyRhythmConfig(presets[name]);
  }

  function exportPresets() {
    const presets =
      localStorage.getItem("rc600-presets") || "{}";

    const blob = new Blob([presets], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "rc600-presets.json";
    a.click();
  }

  return {
    state,
    sendCC,
    level,
    updateRhythmLevel,
    rhythmConfig,
    setRhythmConfig,
    applyRhythmConfig,
    lockState,
    snapshots,
    toggleLock,
    saveSnapshot,
    loadSnapshot,
    updateTempo,
    triggerRhythmStartStop,
    randomizeRhythm,
    saveConfig,
    loadConfig,
    downloadConfig,
    savePreset,
    loadPreset,
    exportPresets
  };
}