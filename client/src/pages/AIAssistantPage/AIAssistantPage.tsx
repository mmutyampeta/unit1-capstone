import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SpoonfulLogo from "../../components/SpoonfulLogo/SpoonfulLogo";
import userService from "../../utils/userService";
import "./AIAssistantPage.css";

type ChatHistory = {
  prompt: string;
  answer: string;
};

type AIAssistantPageProps = {
  onSignOut?: () => void;
};

export default function AIAssistantPage({ onSignOut }: AIAssistantPageProps) {
  const navigate = useNavigate();
  const user = userService.getUser();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = prompt.trim();
    if (!question) {
      setError("Enter a question before sending.");
      return;
    }

    setError("");
    setResponse("");
    setIsLoading(true);
    let answer = "";
    let buffer = "";

    try {
      const result = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question }),
      });
      if (!result.ok || !result.body) {
        const body = await result.json().catch(() => ({ error: "Unable to reach the AI Assistant." }));
        throw new Error(body.error);
      }

      const reader = result.body.getReader();
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
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              answer += text;
              setResponse(answer);
            }
          } catch {
            // Ignore non-JSON keepalive events.
          }
        }
      }
      setHistory((current) => [{ prompt: question, answer }, ...current].slice(0, 3));
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach the AI Assistant.");
    } finally {
      setIsLoading(false);
    }
  }

  const homePath = user ? "/recipes" : "/browse-recipes";

  return (
    <main className="ai-page">
      <header className="ai-header">
        {onSignOut ? <button className="ai-brand" type="button" onClick={() => { onSignOut(); navigate("/"); }}><SpoonfulLogo /></button> : <Link className="ai-brand" to="/"><SpoonfulLogo /></Link>}
        {user && <Link className="ai-dashboard-link" to="/recipes">Your recipes</Link>}
      </header>
      <section className="ai-content" aria-labelledby="ai-heading">
        <nav className="ai-breadcrumbs" aria-label="Breadcrumb"><Link to={homePath}>Home</Link><span>&gt;</span><span>AI Assistant</span></nav>
        <h1 id="ai-heading">AI Assistant</h1>
        <p className="ai-description">Ask for recipe ideas, ingredient substitutions, or cooking help.</p>
        <Link className="ai-tool-link" to="/text-analyzer">Analyze a piece of text</Link>
        <form className="ai-form" onSubmit={handleSubmit}>
          <label htmlFor="ai-prompt">Your question</label>
          <textarea id="ai-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} disabled={isLoading} />
          <button type="submit" disabled={isLoading}>{isLoading ? "Thinking..." : "Ask Assistant"}</button>
        </form>
        {error && <p className="ai-error" role="alert">{error}</p>}
        {isLoading && !response && <p className="ai-thinking">The AI Assistant is thinking...</p>}
        {response && <section className="ai-response" aria-live="polite"><h2>Response</h2><p>{response}</p></section>}
        {history.length > 0 && <section className="ai-history"><h2>Recent questions</h2>{history.map((item, index) => <article key={`${item.prompt}-${index}`}><h3>{item.prompt}</h3><p>{item.answer}</p></article>)}</section>}
      </section>
    </main>
  );
}