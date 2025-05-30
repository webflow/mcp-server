export function generateUUIDv4(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return [...bytes]
    .map((b, i) => {
      const hex = b.toString(16).padStart(2, "0");
      return [4, 6, 8, 10].includes(i) ? `-${hex}` : hex;
    })
    .join("");
}
