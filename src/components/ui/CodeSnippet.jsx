import { Highlight, themes } from "prism-react-renderer";

export default function CodeSnippet({ code, language }) {
  if (!code) return null;

  return (
    <div className="relative text-left rounded-xl border border-base bg-panel overflow-hidden text-sm">
      <div className="flex items-center px-4 py-2 border-b border-base bg-panel-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <span className="ml-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
          {language}
        </span>
      </div>
      <div className="p-4 overflow-x-auto">
        <Highlight
          theme={{ ...themes.dracula, plain: { color: "#f8f8f2", backgroundColor: "transparent" } }}
          code={code.trim()}
          language={language || "javascript"}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={{ ...style, margin: 0, padding: 0 }}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })} className="table-row">
                  <span className="table-cell select-none pr-4 text-right opacity-30 text-xs">
                    {i + 1}
                  </span>
                  <span className="table-cell">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
