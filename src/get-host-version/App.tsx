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

interface HostVersion {
  name?: string;
  version?: string;
}

export default function App() {
  const [data, setData] = useState<DemoData | null>(null);
  const [hostVersion, setHostVersion] = useState<HostVersion | null>(null);

  const { app, error } = useApp({
    appInfo: { name: "Get Host Version", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app: McpApp) => {
      app.ontoolresult = (result) => {
        setData(result.structuredContent as unknown as DemoData);
        try {
          const ver = app.getHostVersion();
          setHostVersion(ver as unknown as HostVersion);
        } catch {
          setHostVersion({});
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

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-32 p-4">
        <p className="text-gray-500 text-sm">Waiting for tool result...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Host Version</h1>
        <p className="text-gray-600 mb-4">
          Host identity from <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">app.getHostVersion()</code>.
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-gray-500 w-24 shrink-0">name</span>
            <span className="font-mono text-lg text-gray-800">
              {hostVersion?.name ?? <span className="text-gray-300">—</span>}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-gray-500 w-24 shrink-0">version</span>
            <span className="font-mono text-lg text-gray-800">
              {hostVersion?.version ?? <span className="text-gray-300">—</span>}
            </span>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p><strong className="text-gray-700">How it works:</strong> Call <code>app.getHostVersion()</code> after connection to identify the host application and version.</p>
          <p>Useful for feature detection or logging which host is running your app.</p>
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
