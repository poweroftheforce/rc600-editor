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
