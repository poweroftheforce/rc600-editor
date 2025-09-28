// rc600-midi.js - Web MIDI helper for RC-600
const RC600MIDI = (function(){
  let midiAccess = null;
  let selectedOutput = null;
  let selectedInput = null;
  const listeners = new Set();

  function log(...args){ console.log('[RC600MIDI]', ...args); }

  async function init() {
    if (!navigator.requestMIDIAccess) {
      throw new Error('Web MIDI API not available in this browser');
    }
    midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    // auto-select likely RC-600 device by name
    for (let out of midiAccess.outputs.values()) {
      log('OUT available:', out.name);
      if (!selectedOutput && /RC-600|BOSS|Boss/i.test(out.name)) selectedOutput = out;
    }
    for (let inp of midiAccess.inputs.values()) {
      log('IN available:', inp.name);
      if (!selectedInput && /RC-600|BOSS|Boss/i.test(inp.name)) selectedInput = inp;
      inp.onmidimessage = (ev)=> _handleMessage(ev);
    }
    // fallback to first available if RC-600 not found
    if (!selectedOutput) selectedOutput = midiAccess.outputs.values().next().value || null;
    if (!selectedInput) selectedInput = midiAccess.inputs.values().next().value || null;
    log('Selected OUT:', selectedOutput && selectedOutput.name, 'Selected IN:', selectedInput && selectedInput.name);
    return { input: selectedInput, output: selectedOutput };
  }

  function selectOutputByName(nameFragment){
    for (let out of midiAccess.outputs.values()) {
      if (out.name && out.name.includes(nameFragment)) {
        selectedOutput = out;
        log('Selected output', out.name);
        return out;
      }
    }
    return null;
  }

  function selectInputByName(nameFragment){
    for (let inp of midiAccess.inputs.values()) {
      if (inp.name && inp.name.includes(nameFragment)) {
        selectedInput = inp;
        inp.onmidimessage = (ev)=> _handleMessage(ev);
        log('Selected input', inp.name);
        return inp;
      }
    }
    return null;
  }

  function _handleMessage(ev){
    const data = Array.from(ev.data);
    listeners.forEach(fn => {
      try { fn({ data, timestamp: ev.timeStamp, raw: ev }); } catch(e){ console.error(e); }
    });
  }

  function on(fn){ listeners.add(fn); }
  function off(fn){ listeners.delete(fn); }

  function sendRaw(bytes, timestamp = 0){
    if (!selectedOutput) { log('No MIDI output selected'); return; }
    selectedOutput.send(bytes, window.performance ? window.performance.now() + timestamp : undefined);
    log('sendRaw', bytes);
  }

  function sendStart(){ sendRaw([0xFA]); }
  function sendStop(){ sendRaw([0xFC]); }
  function sendClock(){ sendRaw([0xF8]); }

  function sendProgramChange(channel, program){
    const status = 0xC0 | (channel & 0x0F);
    sendRaw([status, program & 0x7F]);
  }

  function sendCC(channel, ccNum, value){
    const status = 0xB0 | (channel & 0x0F);
    sendRaw([status, ccNum & 0x7F, value & 0x7F]);
  }

  function sendSysEx(manufacturerIdBytes, dataBytes){
    if (!midiAccess) { log('No midiAccess'); return; }
    if (!selectedOutput) { log('No output'); return; }
    const syx = [0xF0, ...manufacturerIdBytes, ...dataBytes, 0xF7];
    sendRaw(syx);
  }

  function memorySlotToPC(memorySlot){ return Math.max(0, Math.min(98, memorySlot - 1)); }
  function pcToMemorySlot(pc){ return pc + 1; }

  return {
    init, selectOutputByName, selectInputByName, on, off,
    sendRaw, sendStart, sendStop, sendClock,
    sendProgramChange, sendProgramChangeForSlot: (slot, channel=0) => sendProgramChange(channel, memorySlotToPC(slot)),
    sendCC, sendSysEx, memorySlotToPC, pcToMemorySlot
  };
})();
