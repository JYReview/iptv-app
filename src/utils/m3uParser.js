const ATTRIBUTE_REGEX = /([a-zA-Z0-9\-]+)=("[^"]*"|[^\s"]+)/g;

function parseAttributes(attributeString) {
  const attrs = {};
  let match;
  while ((match = ATTRIBUTE_REGEX.exec(attributeString)) !== null) {
    const key = match[1];
    let value = match[2] ?? "";
    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    }
    attrs[key] = value;
  }
  return attrs;
}

function extractLogo(attrs) {
  if (attrs["tvg-logo"]) return attrs["tvg-logo"];
  if (attrs.logo) return attrs.logo;
  return "";
}

function extractGroup(attrs) {
  return attrs["group-title"] || attrs.group || "Unknown";
}

export function parseM3UPlaylist(text) {
  if (!text || typeof text !== "string") return [];

  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const result = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || !line.startsWith("#EXTINF")) continue;

    const [, rawAttributes = "", titleFragment = ""] = line.match(/#EXTINF:-?\d+(.*),(.*)/) || [];
    const attrs = parseAttributes(rawAttributes);
    const name = titleFragment.trim() || attrs["tvg-name"] || attrs["title"] || "Unknown channel";
    const url = lines[i + 1]?.trim() ?? "";

    if (!url || !url.startsWith("http")) continue;

    result.push({
      id: crypto.randomUUID(),
      name,
      url,
      logo: extractLogo(attrs),
      group: extractGroup(attrs),
      categories: attrs["group-title"] ? [attrs["group-title"]] : [],
      raw: attrs,
      status: "Not Started",
    });
  }

  return result;
}
