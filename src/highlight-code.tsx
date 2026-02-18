import { useMemo } from "react";
import { highlight } from "sugar-high";

const shStyles: Record<string, string> = {
  "--sh-class": "#8be9fd",
  "--sh-identifier": "#d1d5db",
  "--sh-sign": "#9ca3af",
  "--sh-property": "#8be9fd",
  "--sh-entity": "#50fa7b",
  "--sh-jsxliterals": "#a78bfa",
  "--sh-string": "#4ade80",
  "--sh-keyword": "#c084fc",
  "--sh-comment": "#6b7280",
};

export function HighlightedCode({ code }: { code: string }) {
  const html = useMemo(() => highlight(code), [code]);
  return <span style={shStyles} dangerouslySetInnerHTML={{ __html: html }} />;
}
