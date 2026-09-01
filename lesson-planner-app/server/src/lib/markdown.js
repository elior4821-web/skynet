// Minimal parsing of the Markdown-ish content the AI produces, just enough
// to lay it out in PPTX/DOCX/PDF exports without pulling in a full parser.

export function parseSlides(content) {
  const lines = content.split("\n");
  const slides = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const slideHeading = line.match(/^##\s*שקף\s*\d+\s*:?\s*(.*)$/);
    if (slideHeading) {
      current = { title: slideHeading[1].trim() || "שקף", bullets: [] };
      slides.push(current);
      continue;
    }
    if (!current) continue;
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      current.bullets.push(bullet[1].trim());
    } else if (line) {
      current.bullets.push(line);
    }
  }

  if (slides.length) return slides;

  // Fallback: no "## שקף" markers found, split by any ## heading instead.
  return parseSections(content).map((section) => ({
    title: section.heading,
    bullets: section.body.split("\n").filter(Boolean),
  }));
}

export function parseSections(content) {
  const lines = content.split("\n");
  const sections = [];
  let current = { heading: "", body: [] };

  for (const rawLine of lines) {
    const heading = rawLine.match(/^##\s+(.*)$/);
    if (heading) {
      if (current.heading || current.body.length) sections.push(finalize(current));
      current = { heading: heading[1].trim(), body: [] };
    } else {
      current.body.push(rawLine);
    }
  }
  if (current.heading || current.body.length) sections.push(finalize(current));
  return sections;

  function finalize(section) {
    return { heading: section.heading, body: section.body.join("\n").trim() };
  }
}
