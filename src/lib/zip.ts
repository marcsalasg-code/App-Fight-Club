import { createHash } from "crypto";

interface ZipFile {
    name: string;
    content: Buffer;
}

// Simple pure-JavaScript ZIP encoder (uncompressed/store mode) for Next.js endpoints
export function createZip(files: ZipFile[]): Buffer {
    let offset = 0;
    const localHeaders: Buffer[] = [];
    const centralDirectory: Buffer[] = [];

    // Date/Time in MS-DOS format
    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

    const fileEntries = files.map(file => {
        const nameBuf = Buffer.from(file.name, 'utf-8');
        const size = file.content.length;
        const crc = crc32(file.content);

        // Local Header
        const localHeader = Buffer.alloc(30 + nameBuf.length);
        localHeader.writeUInt32LE(0x04034b50, 0); // Signature
        localHeader.writeUInt16LE(10, 4);          // Minimum version required
        localHeader.writeUInt16LE(0, 6);           // General purpose flag
        localHeader.writeUInt16LE(0, 8);           // Compression (0 = store)
        localHeader.writeUInt16LE(dosTime, 10);    // Mod time
        localHeader.writeUInt16LE(dosDate, 12);    // Mod date
        localHeader.writeUInt32LE(crc, 14);        // CRC-32
        localHeader.writeUInt32LE(size, 18);       // Compressed size
        localHeader.writeUInt32LE(size, 22);       // Uncompressed size
        localHeader.writeUInt16LE(nameBuf.length, 26); // Name length
        localHeader.writeUInt16LE(0, 28);          // Extra field length
        nameBuf.copy(localHeader, 30);

        const currentOffset = offset;
        offset += localHeader.length + size;

        return {
            nameBuf,
            size,
            crc,
            localHeader,
            fileOffset: currentOffset
        };
    });

    // Central Directory Headers
    let centralDirSize = 0;
    fileEntries.forEach((entry, idx) => {
        const file = files[idx];
        const nameLen = entry.nameBuf.length;

        const cdHeader = Buffer.alloc(46 + nameLen);
        cdHeader.writeUInt32LE(0x02014b50, 0);   // Signature
        cdHeader.writeUInt16LE(20, 4);            // Made by version
        cdHeader.writeUInt16LE(10, 6);            // Min version
        cdHeader.writeUInt16LE(0, 8);             // Flag
        cdHeader.writeUInt16LE(0, 10);            // Compression
        cdHeader.writeUInt16LE(dosTime, 12);      // Time
        cdHeader.writeUInt16LE(dosDate, 14);      // Date
        cdHeader.writeUInt32LE(entry.crc, 16);    // CRC
        cdHeader.writeUInt32LE(entry.size, 20);   // Compressed size
        cdHeader.writeUInt32LE(entry.size, 24);   // Uncompressed size
        cdHeader.writeUInt16LE(nameLen, 28);      // Name len
        cdHeader.writeUInt16LE(0, 30);            // Extra len
        cdHeader.writeUInt16LE(0, 32);            // Comment len
        cdHeader.writeUInt16LE(0, 34);            // Disk start
        cdHeader.writeUInt16LE(0, 36);            // Internal attr
        cdHeader.writeUInt32LE(0, 38);            // External attr
        cdHeader.writeUInt32LE(entry.fileOffset, 42); // Local header offset
        entry.nameBuf.copy(cdHeader, 46);

        centralDirectory.push(cdHeader);
        centralDirSize += cdHeader.length;
    });

    // End of Central Directory
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // Signature
    eocd.writeUInt16LE(0, 4);          // Disk number
    eocd.writeUInt16LE(0, 6);          // Disk of central directory start
    eocd.writeUInt16LE(files.length, 8); // Num of entries on this disk
    eocd.writeUInt16LE(files.length, 10); // Tot entries
    eocd.writeUInt32LE(centralDirSize, 12); // Central dir size
    eocd.writeUInt32LE(offset, 16);    // Central dir offset

    // Build the final buffer
    const buffers: Buffer[] = [];
    fileEntries.forEach((entry, idx) => {
        buffers.push(entry.localHeader);
        buffers.push(files[idx].content);
    });
    centralDirectory.forEach(cd => buffers.push(cd));
    buffers.push(eocd);

    return Buffer.concat(buffers);
}

// CRC-32 Lookup Table helper
const crcTable = new Int32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
}

function crc32(buf: Buffer): number {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
        crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ -1) >>> 0;
}
