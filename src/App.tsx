import { useEffect, useRef, useState } from "react";


/**
 * @type {() => void}
 */
export function useRC600MIDI() {
  const [midiAccess, setMidiAccess] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const midiInRef = useRef(null);
  const midiOutRef = useRef(null);

  // request MIDI access
  useEffect(() => {
    navigator.requestMIDIAccess({ sysex: false }).then((access) => {
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

  const rcState = {
    rhythmOn: false,
    tracks: {}
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

// export default function RC600Controller() {
//   const [midiOut, setMidiOut] = useState(null);
//   const [status, setStatus] = useState("Not connected");

//   async function connectMIDI() {
//     try {
//       const access = await navigator.requestMIDIAccess();
//       for (let output of access.outputs.values()) {
//         if (output.name.includes("RC-600")) {
//           setMidiOut(output);
//           setStatus(`Connected to ${output.name}`);
//           return;
//         }
//       }
//       setStatus("RC-600 not found");
//     } catch (e) {
//       setStatus("MIDI access failed");
//     }
//   }

//   function setCC(cc, value, channel = 0) {
//     if (!midiOut) return;
//     midiOut.send([0xB0 | channel, cc, value]);
//   }

//   function trigger(cc, channel = 0) {
//     if (!midiOut) return;

//     midiOut.send([0xB0 | channel, cc, 127]);
//     setTimeout(() => midiOut.send([0xB0 | channel, cc, 0]), 10);
//   }


//   function loadMemory(slot, channel = 0) {
//     if (!midiOut) return;
//     midiOut.send([0xC0 | channel, slot - 1]);
//   }

//   const tracks = [1, 2, 3, 4, 5, 6];

//   return (
//     <div className="min-h-screen bg-zinc-900 text-white p-4">
//       <h1 className="text-2xl font-bold mb-4">RC-600 Editor (Tier 1 Assigns)</h1>

//       <button
//         onClick={connectMIDI}
//         className="mb-4 px-4 py-2 bg-blue-600 rounded-xl"
//       >
//         Connect MIDI
//       </button>

//       <p className="mb-6 text-sm opacity-80">{status}</p>

//       <div className="grid grid-cols-2 gap-4">
//         {tracks.map((t) => (
//           <div key={t} className="bg-zinc-800 p-4 rounded-2xl shadow">
//             <h2 className="text-lg font-semibold mb-2">Track {t}</h2>
//             <button
//               onClick={() => trigger(79 + t)}
//               className="w-full mb-2 py-2 bg-green-600 rounded-xl"
//             >
//               REC / PLAY
//             </button>
//             <button
//               onClick={() => trigger(86 + t)}
//               className="w-full py-2 bg-red-600 rounded-xl"
//             >
//               STOP
//             </button>
//           </div>
//         ))}
//       </div>

//       <div className="mt-8 bg-zinc-800 p-4 rounded-2xl">
//         <h2 className="text-lg font-semibold mb-4">Global Controls</h2>
//         <div className="grid grid-cols-2 gap-4">
//           <button onClick={() => trigger(86)} className="py-2 bg-red-700 rounded-xl">ALL STOP</button>
//           <button onClick={() => trigger(93)} className="py-2 bg-yellow-600 rounded-xl">UNDO / REDO</button>
//           <button onClick={() => trigger(94)} className="py-2 bg-purple-600 rounded-xl">RHYTHM</button>
//           <button onClick={() => loadMemory(1)} className="py-2 bg-blue-700 rounded-xl">LOAD MEM 1</button>
//         </div>
//       </div>

//       <p className="mt-6 text-xs opacity-60">
//         CC Map: 80–85 Track Rec/Play · 87–92 Track Stop · 86 All Stop
//       </p>
//     </div>
//   );
// }