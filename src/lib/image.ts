export type Img = { base64: string; mimeType: string };

/** Perkecil gambar (sisi terpanjang = maxSide) dan ubah ke JPEG */
export function resizeBase64(
  base64: string,
  mimeType: string,
  maxSide: number,
  quality = 0.8
): Promise<Img> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, maxSide / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      const ctx = c.getContext('2d');
      if (!ctx) return reject(new Error('Canvas gagal'));
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      resolve({ base64: c.toDataURL('image/jpeg', quality).split(',')[1], mimeType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = `data:${mimeType};base64,${base64}`;
  });
}