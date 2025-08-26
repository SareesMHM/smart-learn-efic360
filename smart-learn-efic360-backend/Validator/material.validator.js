function parseMeta(metaStr) {
  if (!metaStr) return {};
  try { return JSON.parse(metaStr); } catch { return {}; }
}

function validateCreateOrUpdate(body, filePresent, existingFile) {
  const { title, type, link } = body;
  if (!title || !title.trim()) return "Title is required.";

  const allowed = ["video", "pdf", "assignment", "notes", "link", "quiz", "chatbot"];
  if (!allowed.includes(type)) return "Invalid type.";

  if (type === "link" && !link) return "Link URL is required.";

  if (type === "video") {
    const meta = parseMeta(body.meta);
    const source = meta.videoSource || "upload";
    if (source === "url" && !link) return "Video URL is required.";
    if (source !== "url" && !(filePresent || existingFile)) return "Video file is required.";
  }

  if ((type === "pdf" || type === "assignment") && !(filePresent || existingFile)) {
    return "A file is required.";
  }

  if (type === "assignment") {
    const meta = parseMeta(body.meta);
    if (meta.maxMarks != null && Number.isNaN(Number(meta.maxMarks))) {
      return "Max marks must be a number.";
    }
  }

  if (type === "notes") {
    const meta = parseMeta(body.meta);
    if (!meta.content || !String(meta.content).trim()) return "Notes content is required.";
  }

  if (type === "quiz") {
    const meta = parseMeta(body.meta);
    if (!Array.isArray(meta.questions) || !meta.questions.length) return "At least one quiz question is required.";
  }

  if (type === "chatbot") {
    const meta = parseMeta(body.meta);
    if (!Array.isArray(meta.faqs) || !meta.faqs.length) return "At least one FAQ is required.";
  }

  return null;
}

module.exports = { parseMeta, validateCreateOrUpdate };
