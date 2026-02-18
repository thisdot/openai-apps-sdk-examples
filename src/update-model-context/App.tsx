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

type Status = "idle" | "updating" | "updated" | "error";

export default function App() {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<DemoData | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [currentContext, setCurrentContext] = useState<string | null>(null);

  const { app, error } = useApp({
    appInfo: { name: "Update Model Context", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app: McpApp) => {
      app.ontoolresult = (result) => {
        setData(result.structuredContent as unknown as DemoData);
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

  const handleSetContext = async () => {
    if (!text.trim()) return;

    setStatus("updating");

    try {
      await app.updateModelContext({
        content: [{ type: "text", text: text.trim() }],
      });

      setStatus("updated");
      setCurrentContext(text.trim());
      setText("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Update Model Context</h1>
        <p className="text-gray-600 mb-4">
          Set context that the model will receive on its next turn. No immediate response.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter context for the model..."
          disabled={status === "updating"}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none mb-2"
        />
        <button
          onClick={handleSetContext}
          disabled={status === "updating" || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "updating" ? "Setting..." : "Set Context"}
        </button>

        {status === "updated" && (
          <p className="text-green-600 text-xs mt-2">
            Context set. It will be included in the model's next turn.
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-xs mt-2">Failed to update context.</p>
        )}

        {currentContext && (
          <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-400 mb-1">Current context:</p>
            <p className="text-sm text-gray-700 break-words">{currentContext}</p>
          </div>
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
