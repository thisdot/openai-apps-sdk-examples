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

interface StoryInput {
  title?: string;
  author?: string;
  genre?: string;
  setting?: string;
  paragraphs?: string[];
  moral?: string;
}

type Phase = "waiting" | "streaming" | "complete";

function formatStory(story: StoryInput, { fadeTrailing }: { fadeTrailing: boolean }) {
  return (
    <>
      {story.paragraphs && story.paragraphs.length > 0 && (
        <div className="space-y-3 mt-3 border-t border-gray-200 pt-3">
          {story.paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`text-sm leading-relaxed ${
                fadeTrailing && i === story.paragraphs!.length - 1
                  ? "text-gray-400"
                  : "text-gray-700"
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}
      {story.moral !== undefined && (
        <p className={`mt-3 pt-3 border-t border-gray-200 text-sm italic ${
          fadeTrailing ? "text-gray-400" : "text-gray-600"
        }`}>
          Moral: {story.moral || "..."}
        </p>
      )}
    </>
  );
}

export default function App() {
  const [story, setStory] = useState<StoryInput | null>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [data, setData] = useState<DemoData | null>(null);

  const { app, error } = useApp({
    appInfo: { name: "Streaming Tool Input", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app: McpApp) => {
      app.ontoolinputpartial = (params) => {
        setStory((params.arguments ?? null) as StoryInput | null);
        setPhase("streaming");
      };
      app.ontoolinput = (params) => {
        setStory((params.arguments ?? null) as StoryInput | null);
      };
      app.ontoolresult = (result) => {
        setData(result.structuredContent as unknown as DemoData);
        setPhase("complete");
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

  const phaseColors: Record<Phase, string> = {
    waiting: "bg-gray-100 border-gray-300 text-gray-700",
    streaming: "bg-blue-50 border-blue-300 text-blue-700",
    complete: "bg-green-50 border-green-300 text-green-700",
  };

  const phaseLabels: Record<Phase, string> = {
    waiting: "Waiting for model to call tool...",
    streaming: "Streaming input...",
    complete: "Complete",
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Streaming Tool Input</h1>
        <p className="text-gray-600 mb-4">
          Watch tool arguments stream in progressively as the model generates them.
        </p>

        {/* Phase indicator */}
        <div className={`mb-4 px-4 py-2 border rounded-lg text-sm font-medium ${phaseColors[phase]}`}>
          {phaseLabels[phase]}
        </div>

        {/* Story preview card */}
        {story && (
          <div className={`mb-4 border rounded-xl p-5 ${
            phase === "streaming" ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-gray-50"
          }`}>
            {story.title !== undefined && (
              <h2 className={`text-xl font-bold mb-1 ${phase === "streaming" ? "text-gray-700" : "text-gray-900"}`}>
                {story.title || "..."}
              </h2>
            )}
            {story.author !== undefined && (
              <p className={`text-sm mb-1 ${phase === "streaming" ? "text-gray-500" : "text-gray-600"}`}>
                by {story.author || "..."}
              </p>
            )}
            {story.genre !== undefined && (
              <p className={`text-xs italic ${phase === "streaming" ? "text-gray-400" : "text-gray-500"}`}>
                {story.genre || "..."}
              </p>
            )}
            {story.setting !== undefined && (
              <p className={`text-xs mb-3 ${phase === "streaming" ? "text-gray-400" : "text-gray-500"}`}>
                Setting: {story.setting || "..."}
              </p>
            )}
            {formatStory(story, { fadeTrailing: phase === "streaming" })}
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
