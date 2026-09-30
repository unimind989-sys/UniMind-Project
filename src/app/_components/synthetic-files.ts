// Public, invented test bytes. No account, source document or student data.
const pdfText =
  "BT /F1 14 Tf 45 750 Td (SYNTHETIC ONLY - identify labels, then compare diagrams.) Tj ET";
function pdfBytes() {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${pdfText.length} >>\nstream\n${pdfText}\nendstream`,
  ];
  let value = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(value.length);
    value += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const start = value.length;
  value += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => String(offset).padStart(10, "0") + " 00000 n \n")
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return new TextEncoder().encode(value);
}
function wavBytes() {
  const bytes = new Uint8Array(8044);
  const view = new DataView(bytes.buffer);
  const write = (offset: number, value: string) =>
    bytes.set(new TextEncoder().encode(value), offset);
  write(0, "RIFF");
  view.setUint32(4, 8036, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 16000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, 8000, true);
  return bytes;
}
export const syntheticFiles = {
  "synthetic-handout.pdf": { mime: "application/pdf", bytes: pdfBytes },
  "synthetic-recording.wav": { mime: "audio/wav", bytes: wavBytes },
  "synthetic-diagram.png": {
    mime: "image/png",
    bytes: () =>
      Uint8Array.from(
        atob(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aFcoAAAAASUVORK5CYII=",
        ),
        (value) => value.charCodeAt(0),
      ),
  },
};
export function makeSyntheticFile(name: keyof typeof syntheticFiles) {
  const fixture = syntheticFiles[name];
  return new File([fixture.bytes()], name, { type: fixture.mime });
}
export async function isSyntheticFile(file: File) {
  if (!Object.hasOwn(syntheticFiles, file.name)) return false;
  const fixture = syntheticFiles[file.name as keyof typeof syntheticFiles];
  if (!fixture) return false;
  const expected = fixture.bytes();
  if (file.size !== expected.length) return false;
  const bytes = new Uint8Array(await file.arrayBuffer());
  return bytes.every((value, index) => value === expected[index]);
}
