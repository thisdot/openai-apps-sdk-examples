import {
  useApp,
  useHostStyles,
  useDocumentTheme,
} from "@modelcontextprotocol/ext-apps/react";
import type { App as McpApp } from "@modelcontextprotocol/ext-apps";
import { useState } from "react";
import { HighlightedCode } from "../highlight-code";

interface Step {
  id: number;
  title: string;
  summary: string;
  code?: string;
}

interface DemoData {
  toolName: string;
  steps: Step[];
}

const CSS_VARS_TO_SHOW = [
  "--color-background-primary",
  "--color-background-secondary",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-border-light",
  "--border-radius-md",
] as const;

export default function App() {
  const [data, setData] = useState<DemoData | null>(null);

  const { app, error } = useApp({
    appInfo: { name: "Host Theming", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app: McpApp) => {
      app.ontoolresult = (result) => {
        setData(result.structuredContent as unknown as DemoData);
      };
    },
  });

  useHostStyles(app, app?.getHostContext());
  const theme = useDocumentTheme();

  if (error) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <p style={{ color: "red", fontSize: 14 }}>
          Connection failed: {error.message}
        </p>
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <p style={{ fontSize: 14, opacity: 0.6 }}>Connecting...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <p style={{ fontSize: 14, opacity: 0.6 }}>Waiting for tool result...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
      <div
        style={{
          background: "var(--color-background-primary)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border-light)",
          borderRadius: "var(--border-radius-md, 1rem)",
          padding: 24,
          maxWidth: 560,
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>
          Host Theming
        </h1>
        <p style={{ color: "var(--color-text-secondary)", margin: "0 0 16px" }}>
          This card is styled entirely with the host's CSS variables. It adapts automatically.
        </p>

        <div
          style={{
            background: "var(--color-background-secondary)",
            border: "1px solid var(--color-border-light)",
            borderRadius: "var(--border-radius-md, 0.5rem)",
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>
            Current theme:{" "}
            <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{theme}</span>
          </p>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Variable", "Value", "Preview"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      paddingBottom: 4,
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CSS_VARS_TO_SHOW.map((varName) => {
                const value =
                  typeof window !== "undefined"
                    ? getComputedStyle(document.documentElement)
                        .getPropertyValue(varName)
                        .trim()
                    : "";
                const isColor = varName.startsWith("--color-");
                return (
                  <tr key={varName}>
                    <td style={{ padding: "2px 0", fontFamily: "monospace" }}>{varName}</td>
                    <td style={{ padding: "2px 0", fontFamily: "monospace" }}>{value || "(unset)"}</td>
                    <td style={{ padding: "2px 0" }}>
                      {isColor && value && (
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background: `var(${varName})`,
                            border: "1px solid var(--color-border-light)",
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data && (
          <details style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: 12 }}>
            <summary
              style={{ fontSize: 14, cursor: "pointer", color: "var(--color-text-secondary)" }}
            >
              See the code and explanation...
            </summary>
            <ol style={{ margin: "12px 0 0", padding: 0, listStyle: "none", color: "var(--color-text-secondary)" }}>
              {data.steps.map((step) => (
                <li key={step.id} style={{ marginBottom: 16, fontSize: 14 }}>
                  <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {step.id}. {step.title}
                  </span>
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {" "}&mdash; {step.summary}
                  </span>
                  {step.code && (
                    <pre
                      style={{
                        marginTop: 6,
                        padding: "10px 12px",
                        fontSize: 12,
                        lineHeight: 1.5,
                        borderRadius: 8,
                        overflowX: "auto",
                        whiteSpace: "pre",
                        background: theme === "dark" ? "#1e1e1e" : "#1a1a2e",
                        color: "#d1d5db",
                      }}
                    >
                      <code><HighlightedCode code={step.code} /></code>
                    </pre>
                  )}
                </li>
              ))}
            </ol>
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>
              <a
                href="https://modelcontextprotocol.io/docs/extensions/apps"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "underline", marginBottom: 4 }}
              >
                MCP Apps docs
              </a>
              <a
                href="https://modelcontextprotocol.github.io/ext-apps/api/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "underline" }}
              >
                API reference
              </a>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
