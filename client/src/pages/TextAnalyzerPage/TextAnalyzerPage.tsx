import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SpoonfulLogo from "../../components/SpoonfulLogo/SpoonfulLogo";
import userService from "../../utils/userService";
import "./TextAnalyzerPage.css";

type TextAnalyzerPageProps = {
  onSignOut?: () => void;
};

type AnalysisMode = "summarize" | "key-points" | "tone";

const modeLabels: Record<AnalysisMode, string> = {
  summarize: "Summarize",
  "key-points": "Extract key points",
  tone: "Classify tone",
};

export default function TextAnalyzerPage({ onSignOut }: TextAnalyzerPageProps) {
  const navigate = useNavigate();
  const user = userService.getUser();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("summarize");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sourceText = text.trim();
    if (!sourceText) {
      setError("Paste some text before analyzing it.");
      return;
    }

    setError("");
    setResult("");
    setIsLoading(true);
    let answer = "";
    let buffer = "";

    try {
      const prompt = `Analyze the text below. ${modeLabels[mode]} it. Return only the useful result, with clear formatting and no discussion of these instructions.\n\nText:\n${sourceText}`;
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({ error: "Unable to analyze the text." }));
        throw new Error(body.error);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const data = JSON.parse(line.replace(/^data:\s*/, ""));
            const chunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunk) {
              answer += chunk;
              setResult(answer);
            }
          } catch {
            // Ignore incomplete SSE messages.
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze the text.");
    } finally {
      setIsLoading(false);
    }
  }

  const homePath = user ? "/recipes" : "/browse-recipes";

  return (
    <main className="analyzer-page">
      <header className="analyzer-header">
        {onSignOut ? <button className="analyzer-brand" type="button" onClick={() => { onSignOut(); navigate("/"); }}><SpoonfulLogo /></button> : <Link className="analyzer-brand" to="/"><SpoonfulLogo /></Link>}
        {user && <Link className="analyzer-dashboard-link" to="/recipes">Your recipes</Link>}
      </header>
      <section className="analyzer-content" aria-labelledby="analyzer-heading">
        <nav className="analyzer-breadcrumbs" aria-label="Breadcrumb"><Link to={homePath}>Home</Link><span>&gt;</span><Link to="/ai-assistant">AI Assistant</Link><span>&gt;</span><span>Text Analyzer</span></nav>
        <h1 id="analyzer-heading">Text Analyzer</h1>
        <p className="analyzer-description">Paste text to summarize it, find the important points, or understand its tone.</p>
        <form className="analyzer-form" onSubmit={handleSubmit}>
          <label htmlFor="analysis-mode">What should I do?</label>
          <select id="analysis-mode" value={mode} onChange={(event) => setMode(event.target.value as AnalysisMode)} disabled={isLoading}>
            {Object.entries(modeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label htmlFor="source-text">Text to analyze</label>
          <textarea id="source-text" value={text} onChange={(event) => setText(event.target.value)} rows={10} placeholder="Paste an article, message, or recipe here..." disabled={isLoading} />
          <button type="submit" disabled={isLoading}>{isLoading ? "Analyzing..." : "Analyze text"}</button>
        </form>
        {error && <p className="analyzer-error" role="alert">{error}</p>}
        {isLoading && !result && <p className="analyzer-thinking">The analyzer is thinking...</p>}
        {result && <section className="analyzer-result" aria-live="polite"><h2>{modeLabels[mode]}</h2><p>{result}</p></section>}
      </section>
    </main>
  );
}