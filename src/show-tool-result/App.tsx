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
  greeting: string;
  message: string;
  timestamp: string;
  toolName: string;
  inputReceived: { name: string };
  steps: Step[];
}

export default function App() {
  const [data, setData] = useState<DemoData | null>(null);

  const { app, error } = useApp({
    appInfo: { name: "Show Tool Result", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app: McpApp) => {
      app.ontoolresult = (result) => {
        setData(result.structuredContent as unknown as DemoData);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.greeting}</h1>
        <p className="text-gray-600 mb-4">{data.message}</p>
        <p className="text-xs text-gray-400">{data.timestamp}</p>

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
      </div>
    </div>
  );
}
