// Utility to parse Roland/Boss SysEx messages and extract parameter addresses
export function parseRolandSysEx(hexString: string) {
  // Remove spaces and convert to bytes
  const bytes = hexString.replace(/\s+/g, '').match(/.{2}/g)?.map(h => parseInt(h, 16));
  if (!bytes || bytes[0] !== 0xF0 || bytes[1] !== 0x41) {
    return null; // Not a Roland SysEx
  }

  const deviceId = bytes[2];
  const modelId = bytes[6];
  const command = bytes[7];

  if (modelId !== 0x32) {
    return null; // Not RC-600
  }

  if (command === 0x12) {
    // DT1 (Data Set) command
    const address = bytes.slice(8, 12); // 4-byte address
    const data = bytes.slice(12, -2); // Data bytes (excluding checksum and F7)
    const checksum = bytes[bytes.length - 2];

    return {
      type: 'DT1',
      deviceId,
      modelId,
      address: address.map(b => b.toString(16).padStart(2, '0')).join(''),
      data: data.map(b => b.toString(16).padStart(2, '0')).join(' '),
      checksum: checksum.toString(16).padStart(2, '0')
    };
  }

  return null;
}

export function analyzeSysExMessages(messages: string[]) {
  const parsed = messages
    .filter(msg => msg.startsWith('SysEx:'))
    .map(msg => {
      const hexData = msg.replace('SysEx: ', '');
      return parseRolandSysEx(hexData);
    })
    .filter(Boolean);

  // Group by address to find patterns
  const addressGroups: Record<string, any[]> = {};
  parsed.forEach(p => {
    if (p && p.address) {
      if (!addressGroups[p.address]) {
        addressGroups[p.address] = [];
      }
      addressGroups[p.address].push(p);
    }
  });

  return {
    parsed,
    addressGroups,
    summary: Object.entries(addressGroups).map(([addr, msgs]) => ({
      address: addr,
      count: msgs.length,
      dataValues: msgs.map(m => m.data).join(', ')
    }))
  };
}