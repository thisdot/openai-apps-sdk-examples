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

type DiceSides = 6 | 12 | 20;
type Status = "idle" | "rolling" | "error";

interface RollResult {
  sides: number;
  rolled: number;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<DemoData | null>(null);
  const [sides, setSides] = useState<DiceSides>(6);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<RollResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { app, error } = useApp({
    appInfo: { name: "Call Server Tool", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app: McpApp) => {
      app.ontoolresult = (toolResult) => {
        setData(toolResult.structuredContent as unknown as DemoData);
        setReady(true);
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

  const handleRoll = async () => {
    setStatus("rolling");
    setErrorMsg(null);

    try {
      const toolResult = await app.callServerTool({
        name: "call_server_tool__roll_dice",
        arguments: { sides },
      });

      if (toolResult.isError) {
        setStatus("error");
        const text = toolResult.content
          ?.filter((c): c is { type: "text"; text: string } => c.type === "text")
          .map((c) => c.text)
          .join(" ");
        setErrorMsg(text || "Tool returned an error.");
      } else {
        const text = toolResult.content
          ?.filter((c): c is { type: "text"; text: string } => c.type === "text")
          .map((c) => c.text)
          .join(" ");
        const parsed = text ? JSON.parse(text) : null;
        setResult(parsed);
        setStatus("idle");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Call Server Tool</h1>
        <p className="text-gray-600 mb-4">
          Roll a dice by calling an app-only server tool directly from the widget — no model involved.
        </p>

        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-gray-700 font-medium">Sides:</label>
          <div className="flex gap-2">
            {([6, 12, 20] as DiceSides[]).map((n) => (
              <button
                key={n}
                onClick={() => setSides(n)}
                className={`px-3 py-1.5 text-sm rounded-lg border font-medium ${
                  sides === n
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                d{n}
              </button>
            ))}
          </div>
          <button
            onClick={handleRoll}
            disabled={status === "rolling"}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "rolling" ? "Rolling..." : "Roll"}
          </button>
        </div>

        {result && status === "idle" && (
          <div className="mb-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-3xl font-bold text-blue-700">{result.rolled}</span>
            <span className="text-sm text-blue-500 ml-2">on a d{result.sides}</span>
          </div>
        )}

        {status === "error" && (
          <p className="text-red-600 text-xs mb-3">{errorMsg || "Failed to call tool."}</p>
        )}

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
