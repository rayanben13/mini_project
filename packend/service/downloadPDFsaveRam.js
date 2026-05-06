

export async function downloadPDF(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer);
}
