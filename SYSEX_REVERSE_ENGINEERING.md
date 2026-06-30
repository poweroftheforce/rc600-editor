# RC-600 SysEx Reverse Engineering

This app now includes tools to reverse-engineer the RC-600's MIDI SysEx parameter addresses.

## How to Use

1. **Start the app**: `npm start`
2. **Click "SysEx Monitor"** in the main interface
3. **Connect your RC-600** via USB and click "Connect MIDI"
4. **Change parameters** on the RC-600 (tempo, rhythm settings, etc.)
5. **Watch the SysEx messages** appear in real-time
6. **Use "Show Analysis"** to group messages by parameter address
7. **Copy the data** to analyze which addresses correspond to which parameters

## Understanding SysEx Messages

Roland/Boss SysEx messages for the RC-600 follow this format:
```
F0 41 [DeviceID] 00 00 00 32 12 [Address] [Data] [Checksum] F7
```

- `F0 41`: Roland manufacturer ID
- `DeviceID`: Usually 10 (default)
- `32`: RC-600 model ID
- `12`: DT1 (Data Set) command
- `Address`: 4 bytes identifying the parameter
- `Data`: Parameter value(s)
- `Checksum`: Roland checksum
- `F7`: End of SysEx

## Example Analysis

When you change the tempo on the RC-600, you might see:
```
SysEx: F0 41 10 00 00 00 32 12 00 01 00 00 01 23 XX F7
```

This means:
- Address: `00010000` (tempo parameter)
- Data: `0123` (tempo value 291 = 120.0 BPM * 10)

## Next Steps

Once you have captured messages for different parameters, update the addresses in:
- `src/hooks/useRC600MIDI.ts` - Replace placeholder addresses with real ones
- `src/midi/rc600CC.ts` - Add any missing CC numbers

The app will then be able to send the correct SysEx messages to control your RC-600.