// Tiny renderer for the "## heading" / "- bullet" markdown-ish content the AI
// produces. Good enough for on-screen display without pulling in a full parser.
export default function MarkdownView({ content }) {
  const lines = content.split("\n");
  const blocks = [];
  let list = null;

  for (const raw of lines) {
    const line = raw.trim();
    const heading = line.match(/^##\s+(.*)$/);
    const bullet = line.match(/^[-*]\s+(.*)$/);

    if (heading) {
      list = null;
      blocks.push({ type: "h", text: heading[1] });
    } else if (bullet) {
      if (!list) {
        list = { type: "ul", items: [] };
        blocks.push(list);
      }
      list.items.push(bullet[1]);
    } else if (line) {
      list = null;
      blocks.push({ type: "p", text: line });
    }
  }

  return (
    <div className="markdown-view">
      {blocks.map((block, i) => {
        if (block.type === "h") return <h3 key={i}>{block.text}</h3>;
        if (block.type === "ul")
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        return <p key={i}>{block.text}</p>;
      })}
    </div>
  );
}
