import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing url" });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://8tv.example.com/",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    res.status(200).json({ url, status: "Available" });
  } catch (e) {
    res.status(200).json({ url, status: "Not Working" });
  }
}