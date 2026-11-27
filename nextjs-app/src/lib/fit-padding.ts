// what this file does: the padding the map keeps free when it fits to pins
// pure functions, so they can be tested without a browser
// change in this version (v2): new drawerOpen flag

export interface FitPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SheetSize = "peek" | "half" | "full";

export const DEFAULT_FIT_PADDING: FitPadding = { top: 60, right: 60, bottom: 60, left: 60 };
export const MAX_FIT_ZOOM = 11;

const MIN_VISIBLE = 120;
const REM = 18;
const DESKTOP_MIN = 1024;
const PANEL_EDGE = 12;
const PANEL_GAP = 24;
const COLLAPSED_LEFT = 40;
const TIME_BAR_HEIGHT = 320;
const TOP = 72;
const PEEK_BOTTOM = 150;
const HEADER_HEIGHT = 72;
const SHEET_GAP = 16;
const RIGHT_FREE = 72;
const DRAWER_MIN = 22 * REM;
const DRAWER_MAX = 28 * REM;

function phoneBottom(sheet: SheetSize, viewportHeight: number): number {
  if (sheet === "peek") return PEEK_BOTTOM;
  return Math.round((viewportHeight - HEADER_HEIGHT) / 2) + SHEET_GAP;
}

export function mapPadding(
  viewportWidth: number,
  panelOpen = true,
  sheet: SheetSize = "peek",
  viewportHeight = 844,
  drawerOpen = false,
): FitPadding {
  if (viewportWidth >= DESKTOP_MIN) {
    const panel = Math.min(Math.max(20 * REM, viewportWidth * 0.3), 26 * REM);
    const drawer = Math.min(Math.max(DRAWER_MIN, viewportWidth * 0.3), DRAWER_MAX);
    return {
      top: TOP,
      right: drawerOpen ? Math.round(drawer + PANEL_EDGE + PANEL_GAP) : RIGHT_FREE,
      bottom: TIME_BAR_HEIGHT,
      left: panelOpen ? Math.round(panel + PANEL_EDGE + PANEL_GAP) : COLLAPSED_LEFT,
    };
  }
  return { top: TOP, right: 40, bottom: phoneBottom(drawerOpen ? "half" : sheet, viewportHeight), left: 40 };
}

export function clampPadding(padding: FitPadding, width: number, height: number): FitPadding {
  const across = padding.left + padding.right;
  const down = padding.top + padding.bottom;
  const acrossScale = across > 0 ? Math.min(1, Math.max(0, width - MIN_VISIBLE) / across) : 1;
  const downScale = down > 0 ? Math.min(1, Math.max(0, height - MIN_VISIBLE) / down) : 1;
  return {
    top: Math.floor(padding.top * downScale),
    right: Math.floor(padding.right * acrossScale),
    bottom: Math.floor(padding.bottom * downScale),
    left: Math.floor(padding.left * acrossScale),
  };
}
