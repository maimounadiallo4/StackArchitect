import { ArchitectureModel, LaneKey } from "../types";
import { getTechLogo } from "./logos";

export type DiagramTheme = "dark" | "light";

const PALETTE: Record<DiagramTheme, {
  bg: string;
  nodeBg: string;
  border: string;
  text: string;
  textMuted: string;
  badgeBg: string;
}> = {
  dark: {
    bg: "#0b0a08",
    nodeBg: "#1a1815",
    border: "#2c271e",
    text: "#f3efe2",
    textMuted: "#a39c8b",
    badgeBg: "#24211b",
  },
  light: {
    bg: "#faf7ee",
    nodeBg: "#fffdf6",
    border: "#d8caa2",
    text: "#1d1a10",
    textMuted: "#5a5137",
    badgeBg: "#ede5cc",
  },
};

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(input: string, max: number): string {
  return input.length > max ? `${input.slice(0, max - 1)}…` : input;
}

/**
 * Renders the full architecture diagram (lanes, edges, nodes) as a
 * standalone, self-contained SVG string — independent of the live canvas
 * DOM/pan/zoom state, so the export is always a clean, reproducible view of
 * the whole model.
 */
export function generateDiagramSVG(
  model: ArchitectureModel,
  theme: DiagramTheme = "dark",
  laneLabels: Record<LaneKey, string>
): string {
  const palette = PALETTE[theme];
  const nodeMap = new Map(model.nodes.map((n) => [n.id, n]));
  const PAD = 40;

  // Tight bounding box around everything we're about to draw.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  model.nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  });
  model.zones.forEach((z) => {
    minX = Math.min(minX, z.x);
    minY = Math.min(minY, z.y);
    maxX = Math.max(maxX, z.x + z.width);
    maxY = Math.max(maxY, z.y + z.height);
  });

  if (!isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 400;
    maxY = 200;
  }

  const offsetX = PAD - minX;
  const offsetY = PAD - minY;
  const totalWidth = Math.round(maxX - minX + PAD * 2);
  const totalHeight = Math.round(maxY - minY + PAD * 2);

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" font-family="-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">`
  );
  parts.push(`<rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="${palette.bg}"/>`);
  parts.push(
    `<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1.5L8 5L0 8.5Z" fill="${palette.textMuted}"/></marker>`
  );

  // --- Lanes ---
  model.zones.forEach((zone) => {
    const x = zone.x + offsetX;
    const y = zone.y + offsetY;
    const label = zone.laneKey ? laneLabels[zone.laneKey] : zone.title;
    const labelWidth = Math.min(zone.width - 16, Math.max(70, label.length * 6.5 + 28));
    parts.push(
      `<rect x="${x}" y="${y}" width="${zone.width}" height="${zone.height}" rx="18" fill="${zone.color}0c" stroke="${zone.color}45" stroke-width="1.5" stroke-dasharray="7 6"/>`
    );
    parts.push(
      `<rect x="${x + 12}" y="${y + 10}" width="${labelWidth}" height="22" rx="7" fill="${palette.bg}" stroke="${zone.color}55" stroke-width="1"/>`
    );
    parts.push(
      `<text x="${x + 12 + labelWidth / 2}" y="${y + 25}" fill="${zone.color}" font-size="10.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">${escapeXml(label.toUpperCase())}</text>`
    );
  });

  // --- Edges ---
  model.edges.forEach((edge) => {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (!src || !tgt) return;

    const leftToRight = tgt.x > src.x;
    const x1 = (leftToRight ? src.x + src.width : src.x) + offsetX;
    const y1 = src.y + src.height / 2 + offsetY;
    const x2 = (leftToRight ? tgt.x : tgt.x + tgt.width) + offsetX;
    const y2 = tgt.y + tgt.height / 2 + offsetY;
    const curvature = Math.max(Math.abs(x2 - x1) * 0.45, 40);
    const cx1 = leftToRight ? x1 + curvature : x1 - curvature;
    const cx2 = leftToRight ? x2 - curvature : x2 + curvature;

    parts.push(
      `<path d="M${x1} ${y1} C${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}" fill="none" stroke="${palette.border}" stroke-width="1.5" marker-end="url(#arrow)"/>`
    );
  });

  // --- Nodes ---
  model.nodes.forEach((node) => {
    const x = node.x + offsetX;
    const y = node.y + offsetY;
    const logo = node.techId ? getTechLogo(node.techId) : undefined;

    parts.push(
      `<rect x="${x}" y="${y}" width="${node.width}" height="${node.height}" rx="14" fill="${palette.nodeBg}" stroke="${palette.border}" stroke-width="1.5"/>`
    );

    // Icon chip
    const iconX = x + 14;
    const iconY = y + 14;
    const iconSize = 32;
    if (logo) {
      parts.push(
        `<rect x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" rx="8" fill="#ffffff" stroke="#00000014"/>`
      );
      const scale = 18 / 24;
      const dx = iconX + (iconSize - 18) / 2;
      const dy = iconY + (iconSize - 18) / 2;
      parts.push(
        `<g transform="translate(${dx}, ${dy}) scale(${scale})"><path d="${logo.path}" fill="#${logo.hex}"/></g>`
      );
    } else {
      const initial = node.title.trim().charAt(0).toUpperCase() || "?";
      parts.push(
        `<rect x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" rx="8" fill="${node.accentColor}1f" stroke="${node.accentColor}40"/>`
      );
      parts.push(
        `<text x="${iconX + iconSize / 2}" y="${iconY + iconSize / 2 + 4}" fill="${node.accentColor}" font-size="13" font-weight="700" text-anchor="middle">${escapeXml(initial)}</text>`
      );
    }

    // Title & subtitle
    const textX = iconX + iconSize + 10;
    parts.push(
      `<text x="${textX}" y="${y + 27}" fill="${palette.text}" font-size="12" font-weight="600">${escapeXml(truncate(node.title, 22))}</text>`
    );
    parts.push(
      `<text x="${textX}" y="${y + 41}" fill="${palette.textMuted}" font-size="9.5">${escapeXml(truncate(node.subtitle, 26))}</text>`
    );

    // Category badge
    const badgeLabel = node.category.toUpperCase();
    const badgeWidth = badgeLabel.length * 5.6 + 16;
    parts.push(
      `<rect x="${x + 14}" y="${y + node.height - 30}" width="${badgeWidth}" height="16" rx="5" fill="${palette.badgeBg}"/>`
    );
    parts.push(
      `<text x="${x + 14 + badgeWidth / 2}" y="${y + node.height - 18.5}" fill="${palette.textMuted}" font-size="8" font-weight="700" text-anchor="middle" letter-spacing="0.4">${escapeXml(badgeLabel)}</text>`
    );
  });

  parts.push("</svg>");
  return parts.join("");
}

/**
 * Rasterizes an SVG string to a PNG Blob using an offscreen canvas.
 * `scale` controls output resolution relative to the SVG's own viewBox
 * (2 = retina-ish sharpness for typical screen/print use).
 */
export function svgToPngBlob(svgString: string, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const widthMatch = svgString.match(/width="(\d+)"/);
    const heightMatch = svgString.match(/height="(\d+)"/);
    const width = widthMatch ? parseInt(widthMatch[1], 10) : 1200;
    const height = heightMatch ? parseInt(heightMatch[1], 10) : 800;

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG encoding failed"));
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to rasterize SVG"));
    };

    img.src = url;
  });
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
