let midiAccess = null;
let rc600Out = null;

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(access) {
    midiAccess = access;
    const outputs = Array.from(midiAccess.outputs.values());
    rc600Out = outputs.find(o => o.name.includes("RC-600") || o.name.includes("Boss"));

    if (rc600Out) {
        console.log("✅ Connected to RC-600:", rc600Out.name);
    } else {
        console.warn("❌ RC-600 not found. Available outputs:", outputs.map(o => o.name));
    }
}

function onMIDIFailure() {
    alert("Could not access Web MIDI API.");
}

// 🎛️ Example: Send START
function sendStart() {
    if (rc600Out) {
        rc600Out.send([0xFA]); // MIDI START command
        console.log("▶️ Start sent");
    }
}

// ⏹️ Example: Send STOP
function sendStop() {
    if (rc600Out) {
        rc600Out.send([0xFC]); // MIDI STOP command
        console.log("⏹️ Stop sent");
    }
}

// 📦 Example: Send Program Change (switch memory slot)
function sendProgramChange(slot = 0) {
    if (rc600Out) {
        rc600Out.send([0xC0, slot]); // PC #slot
        console.log(`📀 Sent Program Change to slot ${slot + 1}`);
    }
}

function saveSettings() {
    const settings = {
        memorySlot: document.getElementById('memorySlot').value,
        loopName: document.getElementById('loopName').value,
        tempo: document.getElementById('tempo').value,
        timeSignature: document.getElementById('timeSignature').value,
        track1Volume: document.getElementById('track1Vol').value,
        track1Pan: document.getElementById('track1Pan').value,
        fx1: document.getElementById('fx1').checked,
        fx2: document.getElementById('fx2').checked
    };
    document.getElementById('output').textContent = JSON.stringify(settings, null, 2);
}
