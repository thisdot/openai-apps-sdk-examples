import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { App as McpApp } from "@modelcontextprotocol/ext-apps";
import { useState, useRef } from "react";
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

type Status = "idle" | "success" | "denied" | "error";

const PREDEFINED_LINKS = [
  { label: "MCP Docs", url: "https://modelcontextprotocol.io/docs/extensions/apps" },
  { label: "GitHub", url: "https://github.com/modelcontextprotocol" },
  { label: "Example.com", url: "https://example.com" },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<DemoData | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { app, error } = useApp({
    appInfo: { name: "Open Link", version: "1.0.0" },
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

  const handleOpenLink = async (url: string) => {
    setLastUrl(url);
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      const result = await app.openLink({ url });
      if (result.isError) {
        setStatus("denied");
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
    }

    timerRef.current = setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Open Link</h1>
        <p className="text-gray-600 mb-4">
          Request the host to open a URL. The host may deny the request based on its security policy.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {PREDEFINED_LINKS.map((link) => (
            <button
              key={link.url}
              onClick={() => handleOpenLink(link.url)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customUrl.trim()) handleOpenLink(customUrl.trim());
            }}
            placeholder="https://..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (customUrl.trim()) handleOpenLink(customUrl.trim());
            }}
            disabled={!customUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Open
          </button>
        </div>

        {status === "success" && (
          <p className="text-green-600 text-xs mb-2">
            Opened: {lastUrl}
          </p>
        )}
        {status === "denied" && (
          <p className="text-amber-600 text-xs mb-2">
            Denied by host: {lastUrl}
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-xs mb-2">
            Error opening: {lastUrl}
          </p>
        )}

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p><strong className="text-gray-700">How it works:</strong> All link requests go through the host — the app cannot open links directly.</p>
          <p>The host decides whether to allow or deny each URL based on its security policy.</p>
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
