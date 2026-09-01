import { Router } from "express";
import PDFDocument from "pdfkit";
import PptxGenJS from "pptxgenjs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseSlides, parseSections } from "../lib/markdown.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HEBREW_FONT = path.join(__dirname, "..", "assets", "fonts", "NotoSansHebrew-Regular.woff2");

const router = Router();

function safeFilename(title) {
  return (title || "document").replace(/[\\/:*?"<>|]/g, "").slice(0, 80) || "document";
}

// Content-Disposition headers must be ASCII; Hebrew titles go through the
// RFC 5987 filename* form, with a plain ASCII fallback for older clients.
function contentDisposition(title, ext) {
  const name = safeFilename(title);
  const encoded = encodeURIComponent(`${name}.${ext}`);
  return `attachment; filename="document.${ext}"; filename*=UTF-8''${encoded}`;
}

router.post("/pptx", async (req, res) => {
  const { title, content } = req.body ?? {};
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "content is required" });
  }

  const slides = parseSlides(content);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";

  if (title) {
    const titleSlide = pptx.addSlide();
    titleSlide.addText(title, {
      x: 0.5, y: 2, w: 9, h: 1.5, align: "center", fontSize: 32, bold: true, rtlMode: true,
    });
  }

  for (const slide of slides) {
    const s = pptx.addSlide();
    s.addText(slide.title, {
      x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 24, bold: true, align: "right", rtlMode: true,
    });
    s.addText(
      slide.bullets.map((text) => ({ text, options: { bullet: true, breakLine: true } })),
      { x: 0.5, y: 1.3, w: 9, h: 4.5, fontSize: 16, align: "right", rtlMode: true }
    );
  }

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  res.setHeader("Content-Disposition", contentDisposition(title, "pptx"));
  res.send(buffer);
});

router.post("/docx", async (req, res) => {
  const { title, content } = req.body ?? {};
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "content is required" });
  }

  const sections = parseSections(content);
  const children = [];

  if (title) {
    children.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
      })
    );
  }

  for (const section of sections) {
    if (section.heading) {
      children.push(
        new Paragraph({
          text: section.heading,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        })
      );
    }
    for (const line of section.body.split("\n")) {
      if (!line.trim()) continue;
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [new TextRun({ text: line.replace(/^[-*]\s+/, "• "), rightToLeft: true })],
        })
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", contentDisposition(title, "docx"));
  res.send(buffer);
});

router.post("/pdf", (req, res) => {
  const { title, content } = req.body ?? {};
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "content is required" });
  }

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", contentDisposition(title, "pdf"));
  doc.pipe(res);

  doc.font(HEBREW_FONT);

  if (title) {
    doc.fontSize(22).text(title, { align: "right" });
    doc.moveDown();
  }

  const sections = parseSections(content);
  for (const section of sections) {
    if (section.heading) {
      doc.fontSize(16).text(section.heading, { align: "right" });
      doc.moveDown(0.3);
    }
    doc.fontSize(12).text(section.body, { align: "right" });
    doc.moveDown();
  }

  doc.end();
});

export default router;
