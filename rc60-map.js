// rc600-map.js - high-level mapping API (placeholder CCs)
const RC600MAP = (function(){
  let midiChannel = 0;

  // Placeholder per-track mapping — replace CC numbers after testing
  const trackConfig = {
    1: { channel: 0, volCC: 7, panCC: 20 },
    2: { channel: 0, volCC: 21, panCC: 22 },
    3: { channel: 0, volCC: 23, panCC: 24 },
    4: { channel: 0, volCC: 25, panCC: 26 },
    5: { channel: 0, volCC: 27, panCC: 28 },
    6: { channel: 0, volCC: 29, panCC: 30 },
  };

  function setMidiChannel(ch){ midiChannel = ch & 0x0F; }

  function loadMemory(slot){
    const pc = RC600MIDI.memorySlotToPC(slot);
    RC600MIDI.sendProgramChange(midiChannel, pc);
    console.log('Requested load memory', slot, '-> PC', pc);
  }

  function setTrackVolume(trackNum, value){
    const cfg = trackConfig[trackNum];
    if(!cfg) return console.warn('No mapping for track', trackNum);
    const cc = cfg.volCC;
    RC600MIDI.sendCC(cfg.channel, cc, value);
  }

  function setTrackPan(trackNum, value){
    const cfg = trackConfig[trackNum];
    if(!cfg) return console.warn('No mapping for track', trackNum);
    const panCC = cfg.panCC;
    RC600MIDI.sendCC(cfg.channel, panCC, value);
  }

  function updateTrackMapping(trackNum, mapping){
    trackConfig[trackNum] = { ...(trackConfig[trackNum] || {}), ...mapping };
  }

  return {
    setMidiChannel, loadMemory, setTrackVolume, setTrackPan, updateTrackMapping, trackConfig
  };
})();
