import zlib
import struct

def create_png(width, height, filepath):
    # Emerald green #10b981 (16, 185, 129) with darker corners
    raw_data = bytearray()
    cx, cy = width / 2, height / 2
    r_sq = (width * 0.42) ** 2
    
    for y in range(height):
        raw_data.append(0) # Filter type None
        for x in range(width):
            dist_sq = (x - cx) ** 2 + (y - cy) ** 2
            if dist_sq <= r_sq:
                # Shield inside
                raw_data.extend([16, 185, 129, 255]) # Emerald
            else:
                # Background
                raw_data.extend([15, 23, 42, 255]) # Dark slate #0f172a

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)

    png_header = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b"IHDR", ihdr_data)
    idat = chunk(b"IDAT", zlib.compress(bytes(raw_data)))
    iend = chunk(b"IEND", b"")

    with open(filepath, "wb") as f:
        f.write(png_header + ihdr + idat + iend)

create_png(192, 192, "public/icons/icon-192.png")
create_png(512, 512, "public/icons/icon-512.png")
print("Icons generated successfully!")
