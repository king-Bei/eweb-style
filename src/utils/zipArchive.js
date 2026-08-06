const textEncoder = new TextEncoder();

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const writeUint16 = (view, offset, value) => {
  view.setUint16(offset, value, true);
};

const writeUint32 = (view, offset, value) => {
  view.setUint32(offset, value, true);
};

const dosDateTime = (date = new Date()) => {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
};

const makeHeader = (size) => {
  const buffer = new ArrayBuffer(size);
  return { buffer, view: new DataView(buffer) };
};

const concatUint8Arrays = (parts) => {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach(part => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
};

export const createZipBlob = (files) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosDate, dosTime } = dosDateTime();

  files.forEach(file => {
    const nameBytes = textEncoder.encode(file.name);
    const contentBytes = file.content instanceof Uint8Array
      ? file.content
      : textEncoder.encode(String(file.content || ''));
    const checksum = crc32(contentBytes);

    const local = makeHeader(30 + nameBytes.length);
    writeUint32(local.view, 0, 0x04034b50);
    writeUint16(local.view, 4, 20);
    writeUint16(local.view, 6, 0x0800);
    writeUint16(local.view, 8, 0);
    writeUint16(local.view, 10, dosTime);
    writeUint16(local.view, 12, dosDate);
    writeUint32(local.view, 14, checksum);
    writeUint32(local.view, 18, contentBytes.length);
    writeUint32(local.view, 22, contentBytes.length);
    writeUint16(local.view, 26, nameBytes.length);
    writeUint16(local.view, 28, 0);
    new Uint8Array(local.buffer).set(nameBytes, 30);

    localParts.push(new Uint8Array(local.buffer), contentBytes);

    const central = makeHeader(46 + nameBytes.length);
    writeUint32(central.view, 0, 0x02014b50);
    writeUint16(central.view, 4, 20);
    writeUint16(central.view, 6, 20);
    writeUint16(central.view, 8, 0x0800);
    writeUint16(central.view, 10, 0);
    writeUint16(central.view, 12, dosTime);
    writeUint16(central.view, 14, dosDate);
    writeUint32(central.view, 16, checksum);
    writeUint32(central.view, 20, contentBytes.length);
    writeUint32(central.view, 24, contentBytes.length);
    writeUint16(central.view, 28, nameBytes.length);
    writeUint16(central.view, 30, 0);
    writeUint16(central.view, 32, 0);
    writeUint16(central.view, 34, 0);
    writeUint16(central.view, 36, 0);
    writeUint32(central.view, 38, 0);
    writeUint32(central.view, 42, offset);
    new Uint8Array(central.buffer).set(nameBytes, 46);

    centralParts.push(new Uint8Array(central.buffer));
    offset += local.buffer.byteLength + contentBytes.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const end = makeHeader(22);
  writeUint32(end.view, 0, 0x06054b50);
  writeUint16(end.view, 4, 0);
  writeUint16(end.view, 6, 0);
  writeUint16(end.view, 8, files.length);
  writeUint16(end.view, 10, files.length);
  writeUint32(end.view, 12, centralDirectory.length);
  writeUint32(end.view, 16, offset);
  writeUint16(end.view, 20, 0);

  return new Blob([...localParts, centralDirectory, new Uint8Array(end.buffer)], { type: 'application/zip' });
};
