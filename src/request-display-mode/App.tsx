import { useApp } from "@modelcontextprotocol/ext-apps/react";
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

type DisplayMode = "inline" | "fullscreen" | "pip";

interface ModeResult {
  requested: DisplayMode;
  granted: DisplayMode;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<DemoData | null>(null);
  const [currentMode, setCurrentMode] = useState<string | null>(null);
  const [availableModes, setAvailableModes] = useState<DisplayMode[]>([]);
  const [modeResult, setModeResult] = useState<ModeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { app, error } = useApp({
    appInfo: { name: "Request Display Mode", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app: McpApp) => {
      app.ontoolresult = (result) => {
        setData(result.structuredContent as unknown as DemoData);
        setReady(true);
        const ctx = app.getHostContext();
        if (ctx) {
          setCurrentMode(ctx.displayMode ?? "inline");
          setAvailableModes((ctx.availableDisplayModes as DisplayMode[]) ?? []);
        }
      };
      app.onhostcontextchanged = (ctx) => {
        if (ctx.displayMode) setCurrentMode(ctx.displayMode);
        if (ctx.availableDisplayModes) {
          setAvailableModes(ctx.availableDisplayModes as DisplayMode[]);
        }
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

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-32 p-4">
        <p className="text-gray-500 text-sm">Waiting for tool result...</p>
      </div>
    );
  }

  const handleRequestMode = async (mode: DisplayMode) => {
    setErrorMsg(null);
    setModeResult(null);

    try {
      const result = await app.requestDisplayMode({ mode });
      setModeResult({ requested: mode, granted: result.mode as DisplayMode });
      setCurrentMode(result.mode);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Request failed");
    }
  };

  const allModes: DisplayMode[] = ["inline", "fullscreen", "pip"];

  const isExpanded = currentMode === "fullscreen" || currentMode === "pip";

  return (
    <div className={isExpanded ? "min-h-screen w-full p-6 bg-white dark:bg-gray-900" : "flex items-center justify-center p-4"}>
      <div className={isExpanded ? "max-w-xl w-full mx-auto" : "bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 max-w-xl w-full"}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Request Display Mode</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Request the host to change the widget's display mode. Must be called from a user action (button click).
        </p>

        <div className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
          <p className="text-blue-800 dark:text-blue-300">
            <span className="font-medium">Current mode:</span> {currentMode ?? "unknown"}
          </p>
          <p className="text-blue-700 dark:text-blue-400 mt-1">
            <span className="font-medium">Available modes:</span>{" "}
            {availableModes.length > 0 ? availableModes.join(", ") : "none reported"}
          </p>
        </div>

        <div className="flex gap-2 mb-3">
          {allModes.map((mode) => {
            const isAvailable = availableModes.length === 0 || availableModes.includes(mode);
            const isCurrent = currentMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleRequestMode(mode)}
                disabled={!isAvailable}
                className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                  isCurrent
                    ? "bg-blue-600 text-white border-blue-600"
                    : isAvailable
                      ? "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>

        {modeResult && (
          <p className={`text-xs mb-2 ${
            modeResult.requested === modeResult.granted ? "text-green-600" : "text-amber-600"
          }`}>
            Requested: {modeResult.requested} → Granted: {modeResult.granted}
          </p>
        )}
        {errorMsg && (
          <p className="text-red-600 text-xs mb-2">{errorMsg}</p>
        )}

        <p className="text-xs text-amber-600 mb-3">
          Note: requestDisplayMode() must be called from a user-initiated action (e.g. button click). It will fail if called programmatically.
        </p>

        {data && (
          <details className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
            <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              See the code and explanation...
            </summary>
            <ol className="mt-3 space-y-4 text-sm text-gray-500 dark:text-gray-400">
              {data.steps.map((step) => (
                <li key={step.id}>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {step.id}. {step.title}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500"> — {step.summary}</span>
                  {step.code && (
                    <pre className="mt-1.5 px-3 py-2.5 bg-gray-900 text-gray-300 text-xs leading-relaxed rounded-lg overflow-x-auto whitespace-pre">
                      <code><HighlightedCode code={step.code} /></code>
                    </pre>
                  )}
                </li>
              ))}
            </ol>
            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 space-y-1">
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
