import React, { useState } from "react";

export default function RC600Controller() {
  const [midiOut, setMidiOut] = useState(null);
  const [status, setStatus] = useState("Not connected");

  async function connectMIDI() {
    try {
      const access = await navigator.requestMIDIAccess();
      for (let output of access.outputs.values()) {
        if (output.name.includes("RC-600")) {
          setMidiOut(output);
          setStatus(`Connected to ${output.name}`);
          return;
        }
      }
      setStatus("RC-600 not found");
    } catch (e) {
      setStatus("MIDI access failed");
    }
  }

  function setCC(cc, value, channel = 0) {
    if (!midiOut) return;
    midiOut.send([0xB0 | channel, cc, value]);
  }

  function trigger(cc, channel = 0) {
    if (!midiOut) return;

    midiOut.send([0xB0 | channel, cc, 127]);
    setTimeout(() => midiOut.send([0xB0 | channel, cc, 0]), 10);
  }


  function loadMemory(slot, channel = 0) {
    if (!midiOut) return;
    midiOut.send([0xC0 | channel, slot - 1]);
  }

  const tracks = [1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">RC-600 Editor (Tier 1 Assigns)</h1>

      <button
        onClick={connectMIDI}
        className="mb-4 px-4 py-2 bg-blue-600 rounded-xl"
      >
        Connect MIDI
      </button>

      <p className="mb-6 text-sm opacity-80">{status}</p>

      <div className="grid grid-cols-2 gap-4">
        {tracks.map((t) => (
          <div key={t} className="bg-zinc-800 p-4 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-2">Track {t}</h2>
            <button
              onClick={() => trigger(79 + t)}
              className="w-full mb-2 py-2 bg-green-600 rounded-xl"
            >
              REC / PLAY
            </button>
            <button
              onClick={() => trigger(86 + t)}
              className="w-full py-2 bg-red-600 rounded-xl"
            >
              STOP
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-zinc-800 p-4 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Global Controls</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => trigger(86)} className="py-2 bg-red-700 rounded-xl">ALL STOP</button>
          <button onClick={() => trigger(93)} className="py-2 bg-yellow-600 rounded-xl">UNDO / REDO</button>
          <button onClick={() => trigger(94)} className="py-2 bg-purple-600 rounded-xl">RHYTHM</button>
          <button onClick={() => loadMemory(1)} className="py-2 bg-blue-700 rounded-xl">LOAD MEM 1</button>
        </div>
      </div>

      <p className="mt-6 text-xs opacity-60">
        CC Map: 80–85 Track Rec/Play · 87–92 Track Stop · 86 All Stop
      </p>
    </div>
  );
}
