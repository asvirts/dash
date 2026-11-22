export const C = {
  bg: "#0a0c0a",
  panel: "#121512",
  panel2: "#1a1e1a",
  line: "#262b26",
  ink: "#eef2ea",
  mute: "#8b958a",
  lime: "#c8f53c",
  amber: "#f5b13c",
  rose: "#f5603c",
} as const;

export const R = { sm: 8, md: 12, lg: 16 } as const;

export function matchColor(m: number) {
  return m >= 85 ? C.lime : m >= 70 ? C.amber : C.rose;
}
