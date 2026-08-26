import { ProjectConfig } from "../types";

export interface ShareState {
  project: ProjectConfig;
  selectedTechIds: string[];
}

const PARAM = "s";

function toBase64Url(json: string): string {
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  return decodeURIComponent(escape(atob(base64)));
}

export function encodeShareLink(state: ShareState): string {
  const encoded = toBase64Url(JSON.stringify(state));
  const url = new URL(window.location.href);
  url.search = `?${PARAM}=${encoded}`;
  url.hash = "";
  return url.toString();
}

export function decodeShareStateFromLocation(): ShareState | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(PARAM);
  if (!encoded) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.selectedTechIds) || !parsed.project) {
      return null;
    }
    return parsed as ShareState;
  } catch {
    return null;
  }
}
