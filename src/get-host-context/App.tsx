import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { App as McpApp } from "@modelcontextprotocol/ext-apps";
import { useState, useCallback } from "react";
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

export default function App() {
  const [data, setData] = useState<DemoData | null>(null);
  const [context, setContext] = useState<Record<string, unknown> | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const captureContext = useCallback((app: McpApp) => {
    try {
      const ctx = app.getHostContext();
      setContext(ctx as unknown as Record<string, unknown>);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setContext({});
    }
  }, []);

  const { app, error } = useApp({
    appInfo: { name: "Get Host Context", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app: McpApp) => {
      app.ontoolresult = (result) => {
        setData(result.structuredContent as unknown as DemoData);
        captureContext(app);
      };
      app.onhostcontextchanged = () => {
        captureContext(app);
        setUpdateCount((c) => c + 1);
      };
    },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-32 p-4">
        <p className="text-red-600 text-sm">Connection failed: {error.message}</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center min-h-32 p-4">
        <p className="text-gray-500 text-sm">Connecting...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-32 p-4">
        <p className="text-gray-500 text-sm">Waiting for tool result...</p>
      </div>
    );
  }

  const SIMPLE_KEYS = ["theme", "displayMode", "locale", "timeZone", "platform"] as const;
  const ARRAY_KEYS = ["availableDisplayModes"] as const;
  const OBJECT_KEYS = ["containerDimensions", "deviceCapabilities"] as const;

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Host Context</h1>
        <p className="text-gray-600 mb-4">
          Live environment info from <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">app.getHostContext()</code>.
        </p>

        {lastUpdated && (
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Last updated: {lastUpdated}
            {updateCount > 0 && <span>({updateCount} live update{updateCount !== 1 ? "s" : ""})</span>}
          </div>
        )}

        <div className="space-y-3 mb-4">
          {SIMPLE_KEYS.map((key) => {
            const value = context?.[key];
            return (
              <div key={key} className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-gray-500 w-40 shrink-0">{key}</span>
                <span className="font-mono text-sm text-gray-800">
                  {value !== undefined && value !== null ? String(value) : <span className="text-gray-300">—</span>}
                </span>
              </div>
            );
          })}

          {ARRAY_KEYS.map((key) => {
            const value = context?.[key];
            return (
              <div key={key} className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-gray-500 w-40 shrink-0">{key}</span>
                <span className="font-mono text-sm text-gray-800">
                  {Array.isArray(value) ? value.join(", ") : <span className="text-gray-300">—</span>}
                </span>
              </div>
            );
          })}

          {OBJECT_KEYS.map((key) => {
            const value = context?.[key];
            if (!value || typeof value !== "object") {
              return (
                <div key={key} className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-gray-500 w-40 shrink-0">{key}</span>
                  <span className="text-gray-300 text-sm">—</span>
                </div>
              );
            }
            return (
              <div key={key}>
                <span className="font-mono text-xs text-gray-500">{key}</span>
                <pre className="mt-1 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p><strong className="text-gray-700">How it works:</strong> Call <code>app.getHostContext()</code> after connection. Register <code>app.onhostcontextchanged</code> for live updates.</p>
          <p>Context changes when the user switches theme, resizes the widget, or changes display mode.</p>
        </div>

        {data && (
          <details className="mt-4 border-t border-gray-100 pt-3">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              See the code and explanation...
            </summary>
            <ol className="mt-3 space-y-4 text-sm text-gray-500">
              {data.steps.map((step) => (
                <li key={step.id}>
                  <span className="font-medium text-gray-700">
                    {step.id}. {step.title}
                  </span>
                  <span className="text-gray-400"> — {step.summary}</span>
                  {step.code && (
                    <pre className="mt-1.5 px-3 py-2.5 bg-gray-900 text-gray-300 text-xs leading-relaxed rounded-lg overflow-x-auto whitespace-pre">
                      <code><HighlightedCode code={step.code} /></code>
                    </pre>
                  )}
                </li>
              ))}
            </ol>
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <a
                href="https://modelcontextprotocol.io/docs/extensions/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-blue-500 underline"
              >
                MCP Apps docs
              </a>
              <a
                href="https://modelcontextprotocol.github.io/ext-apps/api/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-blue-500 underline"
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
