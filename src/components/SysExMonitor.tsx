import React, { useState, useRef } from "react";
import { analyzeSysExMessages } from "../utils/sysexParser";

function SysExMonitor() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showTestSender, setShowTestSender] = useState(false);
  const [testAddress, setTestAddress] = useState("00010000");
  const [testData, setTestData] = useState("0001");

  const sendTestSysEx = () => {
    if (!midiOutRef.current) {
      addMessage("❌ Not connected to MIDI output");
      return;
    }

    try {
      const addressBytes = testAddress.match(/.{2}/g)?.map(h => parseInt(h, 16)) || [];
      const dataBytes = testData.match(/.{2}/g)?.map(h => parseInt(h, 16)) || [];

      if (addressBytes.length !== 4) {
        addMessage("❌ Address must be 8 hex chars (4 bytes)");
        return;
      }

      // Calculate checksum
      const payload = [...addressBytes, ...dataBytes];
      let sum = 0;
      for (let i = 0; i < payload.length; i++) {
        sum += payload[i];
      }
      const checksum = (128 - (sum % 128)) & 0x7f;

      const message = [
        0xf0, 0x41, 0x10, 0x00, 0x00, 0x00, 0x32, 0x12,
        ...payload,
        checksum,
        0xf7
      ];

      midiOutRef.current.send(message);
      const hexStr = message.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      addMessage(`✅ Sent: ${hexStr}`);
    } catch (error) {
      addMessage(`❌ Error: ${error}`);
    }
  };

  const midiInRef = useRef<WebMidi.MIDIInput | null>(null);
  const midiOutRef = useRef<WebMidi.MIDIOutput | null>(null);

  const connectMIDI = async () => {
    try {
      const access = await navigator.requestMIDIAccess({ sysex: true, software: true });
      const inputs = Array.from(access.inputs.values());
      const outputs = Array.from(access.outputs.values());
      const rc600Input = inputs.find(i => i.name?.includes("RC-600")) || inputs[0];
      const rc600Output = outputs.find(o => o.name?.includes("RC-600")) || outputs[0];

      if (rc600Input) {
        midiInRef.current = rc600Input;
        midiInRef.current.onmidimessage = handleMidiMessage;
        setIsConnected(true);
        addMessage("✅ Connected to input: " + rc600Input.name);
      } else {
        addMessage("❌ RC-600 input not found. Available: " + inputs.map(i => i.name).join(", "));
      }

      if (rc600Output) {
        midiOutRef.current = rc600Output;
        addMessage("✅ Connected to output: " + rc600Output.name);
      } else {
        addMessage("⚠️ RC-600 output not found. Test sender won't work.");
      }
    } catch (error) {
      addMessage("❌ MIDI access failed: " + error);
    }
  };

  const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
    const data = Array.from(event.data);
    const [status] = data;

    if (status === 0xF0) {
      // SysEx message
      const hexString = data.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      addMessage(`SysEx: ${hexString}`);
    } else if ((status & 0xF0) === 0xB0) {
      // CC message
      const cc = data[1];
      const value = data[2];
      addMessage(`CC ${cc}: ${value}`);
    }
  };

  const addMessage = (msg: string) => {
    setMessages(prev => [...prev.slice(-49), msg]); // Keep last 50 messages
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(messages.join('\n'));
    addMessage("Messages copied to clipboard");
  };

  const analysis = analyzeSysExMessages(messages);

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>RC-600 SysEx Monitor</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={connectMIDI} disabled={isConnected}>
          {isConnected ? "Connected" : "Connect MIDI"}
        </button>
        <button onClick={clearMessages} style={{ marginLeft: 10 }}>
          Clear
        </button>
        <button onClick={copyToClipboard} style={{ marginLeft: 10 }}>
          Copy to Clipboard
        </button>
        <button onClick={() => setShowAnalysis(!showAnalysis)} style={{ marginLeft: 10 }}>
          {showAnalysis ? "Hide" : "Show"} Analysis
        </button>
        <button onClick={() => setShowTestSender(!showTestSender)} style={{ marginLeft: 10 }}>
          {showTestSender ? "Hide" : "Show"} Test Sender
        </button>
      </div>

      {showTestSender && (
        <div style={{ marginBottom: 20, padding: 10, backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
          <h3>Test SysEx Sender</h3>
          <p>Send test SysEx messages to debug RC-600 communication</p>
          
          <div style={{ marginBottom: 10 }}>
            <label>Address (8 hex chars):</label><br/>
            <input
              type="text"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value.toUpperCase())}
              placeholder="00010000"
              style={{ width: '200px', padding: '5px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Data (hex, e.g. 0001 for 1 or 00 7f for 127):</label><br/>
            <input
              type="text"
              value={testData}
              onChange={(e) => setTestData(e.target.value.toUpperCase())}
              placeholder="0001"
              style={{ width: '200px', padding: '5px', marginTop: '5px' }}
            />
          </div>

          <button onClick={sendTestSysEx} style={{ padding: '8px 16px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
            Send Test SysEx
          </button>

          <div style={{ marginTop: 10, fontSize: '12px', color: '#666' }}>
            💡 Tip: Try adjusting parameters on the RC-600 and check if any CC messages appear below
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Connect your RC-600 via USB</li>
          <li>Click "Connect MIDI"</li>
          <li>Change parameters on the RC-600 (tempo, rhythm settings, etc.)</li>
          <li>Watch the SysEx messages appear below</li>
          <li>Use "Show Analysis" to identify parameter addresses</li>
        </ol>
      </div>

      {showAnalysis && (
        <div style={{ marginBottom: 20, padding: 10, backgroundColor: '#e8f4fd', border: '1px solid #ccc' }}>
          <h3>Analysis Summary:</h3>
          <p>Found {analysis.parsed.length} Roland SysEx messages</p>
          <p>Unique addresses: {Object.keys(analysis.addressGroups).length}</p>

          <h4>Parameter Addresses:</h4>
          {analysis.summary.map((item, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <strong>Address: {item.address}</strong> ({item.count} messages)<br/>
              Data values: {item.dataValues}
            </div>
          ))}
        </div>
      )}

      <div style={{
        border: '1px solid #ccc',
        height: '400px',
        overflowY: 'auto',
        backgroundColor: '#f9f9f9',
        padding: '10px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SysExMonitor;