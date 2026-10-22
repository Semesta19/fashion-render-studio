export type Presentation = 'ghost' | 'model' | 'flat';

export const PRESENTATION_LABELS: Record<Presentation, string> = {
  ghost: 'Ghost Mannequin',
  model: 'Di Model',
  flat: 'Flat Lay',
};

const PRESENTATION_TEXT: Record<Presentation, string> = {
  ghost:
    'Professional e-commerce "ghost mannequin" (invisible mannequin) product photo. The garment holds natural 3D volume as if worn on an invisible body, with a clean hollow neck/sleeve/hem opening. No mannequin, no person, no hanger, no hands, no stand.',
  model:
    'The garment is worn by a real human fashion model standing straight in a relaxed neutral pose, full body visible from head to toe, natural skin, natural hair, simple minimal styling (no accessories that hide the garment). The garment is the clear focus.',
  flat:
    'Professional flat-lay product photo: the garment laid perfectly flat and symmetrical, photographed straight from above, sleeves and hem arranged neatly, natural fabric wrinkles only.',
};

type Opts = {
  garmentType: string;
  hasSketch: boolean;
  hasTexture: boolean;
  repeat: number; // jumlah pengulangan pola per sisi pada gambar tekstur
  mirrored: boolean;
  presentation: Presentation;
  userNotes: string;
};

// Anggap gambar tekstur mewakili kain seluas ±40 cm. 1 ulangan = 40/repeat cm.
const SWATCH_CM = 40;

export function buildPrompt(o: Opts): string {
  const n = Math.max(1, Math.round(o.repeat));
  const tileCm = SWATCH_CM / n;
  const tileCmTxt = tileCm >= 10 ? tileCm.toFixed(0) : tileCm.toFixed(1);

  const imgSketch = 'Image 1';
  const imgTexture = o.hasSketch ? 'Image 2' : 'Image 1';

  const sections: string[] = [];

  sections.push(
    `TASK: Produce one photorealistic, high-end fashion product photograph of a ${o.garmentType}. ` +
      `It must look like a real photo of a physically sewn garment, not an illustration, 3D render or CGI.`
  );

  const refs: string[] = [];
  if (o.hasSketch) {
    refs.push(
      `${imgSketch} is the DESIGN SKETCH. It is the single source of truth for the garment's construction. It is a line drawing only: take shape, cut and details from it, but never copy its line style, its paper, or its colors.`
    );
  }
  if (o.hasTexture) {
    refs.push(
      `${imgTexture} is the FABRIC SWATCH. It defines the fabric's print/pattern, color, weave and surface feel.`
    );
  }
  if (refs.length) sections.push(`REFERENCE IMAGES:\n- ${refs.join('\n- ')}`);

  sections.push(
    `BACKGROUND (strict): Pure plain white seamless studio background (#FFFFFF), edge to edge, completely empty. ` +
      `No room, walls, columns, floor texture, props, plants, furniture, gradients or watermark. ` +
      `Only a very soft contact shadow directly beneath the subject is allowed.`
  );

  if (o.hasSketch) {
    sections.push(
      `SKETCH FIDELITY (strict, highest priority):\n` +
        `- Reproduce the exact silhouette and proportions of the sketch: overall length, width, shoulder line, waist or drop-waist position, sleeve length and shape, cuff shape, neckline shape and depth, collar, hem shape and hem width, volume and flare.\n` +
        `- Reproduce EVERY construction detail drawn in the sketch at the same position and size: each seam line, panel and special cut, yoke, godet, gather, pleat, dart, tuck, ruffle, slit, placket, button, zipper, drawstring/tie, pocket, binding/trim, topstitching, and any piece cut from a different fabric or in a different grain/pattern direction.\n` +
        `- Special panels, color blocking or fabric cuts that differ from a standard garment of this type must appear exactly as in the sketch. Do NOT replace them with a generic version of this garment.\n` +
        `- Do not add, remove, simplify, move or invent any seam, panel, trim or design element that is not in the sketch. When a detail is unclear, keep it minimal and symmetrical.\n` +
        `- If the sketch shows several views (e.g. front and back), render the same views in the same left-to-right order, each as a complete garment at equal size. If it shows one view, render only that single view. Never add extra views.\n` +
        `- Keep the garment centered and fully inside the frame with a comfortable margin; nothing cropped.`
    );
  }

  if (o.hasTexture) {
    const mirrorNote = o.mirrored
      ? `The swatch image was assembled by tiling with mirrored (flipped) repeats; treat the mirrored seams as a technical artifact, and show a natural, continuous, non-mirrored-looking pattern on the garment. `
      : `The swatch image was assembled by tiling the same fabric sample; tile boundaries are technical artifacts and must never show as lines or breaks on the garment. `;
    sections.push(
      `FABRIC AND PATTERN (strict):\n` +
        `- Use ${imgTexture} as the fabric for the whole garment (except parts the user notes say otherwise). Keep its exact colors, motif shapes, motif spacing and weave look. Do not recolor, restyle, redraw or replace the motifs.\n` +
        `- PATTERN SCALE: ${imgTexture} contains a ${n}x${n} grid of repeats. Treat the whole swatch as about ${SWATCH_CM} cm of real fabric, so one repeat is about ${tileCmTxt} cm on the finished garment. ` +
        `Keep this real-world scale consistent across the entire garment: ${
          n <= 2
            ? 'motifs are LARGE, only a few repeats are visible across the front of the garment'
            : n <= 5
              ? 'motifs are MEDIUM sized'
              : 'motifs are SMALL and dense, many repeats are visible across the garment'
        }. Do not enlarge, shrink, blur or stretch the motifs to fit the garment; the more repeats in the swatch, the smaller the motifs must look.\n` +
        `- ${mirrorNote}\n` +
        `- Apply the print as real printed/woven cloth: the pattern follows the fabric grain and each panel's direction, bends and foreshortens naturally with folds, gathers, sleeves and the body curvature, and is cut and matched at seams like real sewn fabric. Panels in the sketch that use a different grain direction show the pattern in that direction.\n` +
        `- Show believable fabric structure: visible weave or knit, natural sheen or matte finish matching the swatch, correct thickness and drape for this fabric.`
    );
  } else {
    sections.push(
      `FABRIC: No swatch is provided. Use the fabric and color described in the designer notes. If none are given, use a realistic solid mid-tone woven fabric. Show believable weave texture, thickness and drape.`
    );
  }

  sections.push(`PRESENTATION: ${PRESENTATION_TEXT[o.presentation]}`);

  sections.push(
    `REALISM: 85mm lens, straight-on eye-level, soft diffused studio light, sharp focus on the whole garment. ` +
      `Natural fabric wrinkles, real stitching and thread detail, accurate weight and drape under gravity, neutral color accuracy, no HDR look, no plastic or airbrushed surface.`
  );

  sections.push(
    `DO NOT: alter the design; add embroidery, logos, text or labels not in the sketch or notes; show sketch lines; add extra garments or items; crop the garment; distort proportions; stylize as illustration or 3D render.`
  );

  const notes = o.userNotes.trim().slice(0, 600);
  if (notes) {
    sections.push(
      `DESIGNER NOTES (apply only where they do not contradict the sketch fidelity, background and scale rules above): ${notes}`
    );
  }

  return sections.join('\n\n');
}
