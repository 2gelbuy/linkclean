import sharp from "sharp";
import { resolve } from "path";

const W = 1280,
  H = 800;
const outDir = resolve("assets/screenshots");

// Colors
const BG_LIGHT = "#f0f4ff";
const BG_DARK = "#0f172a";
const BLUE = "#2563eb";
const WHITE = "#ffffff";

async function createTextOverlay(text, subtext, bgColor, textColor, filename) {
  // Load real popup screenshot
  const popup = await sharp(resolve(outDir, "real-popup.png"))
    .resize(340, null, { fit: "inside" })
    .png()
    .toBuffer();

  const popupMeta = await sharp(popup).metadata();
  const popupW = popupMeta.width;
  const popupH = popupMeta.height;

  // Calculate popup position (centered horizontally, offset right)
  const popupX = Math.round(W * 0.62);
  const popupY = Math.round((H - popupH) / 2);

  // Create SVG text
  const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const escapedSub = subtext.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${bgColor}"/>
    <text x="80" y="${H / 2 - 30}" font-family="Segoe UI, system-ui, sans-serif" font-size="36" font-weight="700" fill="${textColor}">${escapedText}</text>
    <text x="80" y="${H / 2 + 20}" font-family="Segoe UI, system-ui, sans-serif" font-size="18" fill="${textColor}" opacity="0.6">${escapedSub}</text>
  </svg>`;

  const bg = await sharp(Buffer.from(svg)).png().toBuffer();

  // Add drop shadow effect to popup (via a dark rect behind it)
  const shadow = `<svg width="${popupW + 20}" height="${popupH + 20}" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="${popupW + 12}" height="${popupH + 12}" rx="12" fill="rgba(0,0,0,0.15)"/>
  </svg>`;
  const shadowBuf = await sharp(Buffer.from(shadow)).png().toBuffer();

  // White background for popup
  const popupBg = `<svg width="${popupW + 8}" height="${popupH + 8}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${popupW + 8}" height="${popupH + 8}" rx="12" fill="white"/>
  </svg>`;
  const popupBgBuf = await sharp(Buffer.from(popupBg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: shadowBuf, left: popupX - 4, top: popupY - 4 },
      { input: popupBgBuf, left: popupX - 4, top: popupY - 4 },
      { input: popup, left: popupX, top: popupY },
    ])
    .toFile(resolve(outDir, filename));

  console.log("Created:", filename);
}

// Screenshot 1: Main feature - real popup
await createTextOverlay(
  "Clean Your LinkedIn Feed",
  "Hide promoted posts, ads, and noise with one click",
  BG_LIGHT,
  "#1e293b",
  "01-clean-feed.png",
);

// Screenshot 2: Filter controls
await createTextOverlay(
  "6 Smart Filters",
  "Promoted · Suggested · Newsletters · Polls · Reshares · Video",
  "#f8fafc",
  "#1e293b",
  "02-filters.png",
);

// Screenshot 3: Stats
await createTextOverlay(
  "Track What You Hide",
  "See posts hidden this session and all time",
  BG_LIGHT,
  "#1e293b",
  "03-stats.png",
);

// Screenshot 4: Privacy
await createTextOverlay(
  "100% Local. Zero Tracking.",
  "No servers. No accounts. All processing in your browser.",
  BG_DARK,
  WHITE,
  "04-privacy.png",
);

// Screenshot 5: Languages
await createTextOverlay(
  "Works in 20+ Languages",
  "English, Russian, German, French, Spanish, Turkish, and more",
  BG_DARK,
  WHITE,
  "05-languages.png",
);

console.log("All 5 screenshots created");
