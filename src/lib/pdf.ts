/**
 * BuildTape Pro — PDF Generation
 * Native: expo-print + expo-sharing
 * Web: opens HTML in new tab / window.print()
 */

import { Platform, Alert } from "react-native";
import { TapeEntry } from "../features/calculator/CalculatorEngine";
import { Job } from "../store";

export async function generateAndSharePDF(
  job: Job | null,
  entries: TapeEntry[],
  title?: string,
): Promise<void> {
  const html = buildPDFHtml(job, entries, title);

  if (Platform.OS === "web") {
    // Web: open a print-ready window
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    } else {
      Alert.alert("Pop-up Blocked", "Allow pop-ups to export PDF.");
    }
    return;
  }

  // Native: expo-print + expo-sharing
  try {
    const Print = await import("expo-print");
    const Sharing = await import("expo-sharing");
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Export ${job?.name ?? "Tape"} as PDF`,
        UTI: "com.adobe.pdf",
      });
    }
  } catch (e: any) {
    Alert.alert("Export Error", e?.message || "Could not export PDF.");
  }
}

function buildPDFHtml(
  job: Job | null,
  entries: TapeEntry[],
  title?: string,
): string {
  const now = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const jobSection = job
    ? `<div class="job-header">
        <h2>${esc(job.name)}</h2>
        ${job.notes ? `<p class="notes">${esc(job.notes)}</p>` : ""}
      </div>`
    : "";

  const entriesHtml = entries
    .map(
      (e, i) => `
      <tr class="${i % 2 === 0 ? "even" : "odd"}">
        <td class="num">${i + 1}</td>
        <td class="expr">${esc(e.expression)}</td>
        <td class="result">${esc(e.result)}</td>
        <td class="type">${e.type}</td>
        <td class="time">${formatTime(e.createdAt)}</td>
      </tr>`,
    )
    .join("");

  const photosHtml = job?.photos && job.photos.length > 0
    ? `<h3>Attached Photos</h3>
       <div class="photos">
         ${job.photos.map(uri => `<img src="${uri}" class="photo" />`).join("")}
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BuildTape Pro Export</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, Arial, sans-serif;
      color: #1a1a1a;
      background: #fff;
      padding: 32px;
      font-size: 12px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #F4821F;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .app-name { font-size: 22px; font-weight: 700; color: #F4821F; }
    .app-tagline { font-size: 10px; color: #666; margin-top: 2px; }
    .export-info { text-align: right; color: #555; font-size: 10px; line-height: 1.6; }
    .job-header {
      background: #f8f8f8;
      border-left: 4px solid #F4821F;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    .job-header h2 { font-size: 16px; }
    .notes { color: #555; margin-top: 4px; font-size: 11px; }
    h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #444; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    thead th {
      background: #2E2E2E;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
    }
    tbody tr.even { background: #fafafa; }
    tbody tr.odd { background: #fff; }
    tbody td { padding: 7px 10px; border-bottom: 1px solid #eee; }
    td.num { color: #999; width: 30px; }
    td.expr { font-family: monospace; font-size: 11px; }
    td.result { font-weight: 600; }
    td.type { font-size: 10px; text-transform: uppercase; color: #F4821F; font-weight: 600; }
    td.time { color: #888; font-size: 10px; }
    .photos { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
    .photo { width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
    .disclaimer {
      background: #FFF8F0;
      border: 1px solid #F4C080;
      padding: 12px 14px;
      color: #7A4A00;
      font-size: 10px;
      line-height: 1.6;
    }
    footer { margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px; color: #aaa; font-size: 9px; text-align: center; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="app-name">📐 BuildTape Pro</div>
      <div class="app-tagline">Construction Calculator · Buy once, own forever.</div>
    </div>
    <div class="export-info">
      <strong>Exported</strong><br>${now}<br>${entries.length} calculation${entries.length !== 1 ? "s" : ""}
    </div>
  </header>
  ${jobSection}
  ${
    entries.length > 0
      ? `<h3>Tape Calculations</h3>
    <table>
      <thead><tr><th>#</th><th>Expression</th><th>Result</th><th>Type</th><th>Time</th></tr></thead>
      <tbody>${entriesHtml}</tbody>
    </table>`
      : `<p style="color:#888;text-align:center;padding:32px;">No calculations to export.</p>`
  }
  ${photosHtml}
  <div class="disclaimer">
    ⚠ <strong>Disclaimer:</strong> BuildTape Pro calculations are for planning and estimating purposes only.
    Always verify measurements and quantities on-site. Stair calculations are based on common practice ranges —
    not code certification. Always confirm compliance with your local building code before construction.
  </div>
  <footer>Generated by BuildTape Pro · One-time purchase · No subscription required</footer>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}
