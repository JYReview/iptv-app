export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://8tv.example.com/",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    res.status(200).json({
      url,
      status: response.ok ? "Available" : "Not Working",
      statusCode: response.status,
    });
  } catch (e) {
    res.status(200).json({ url, status: "Not Working", error: e.message });
  }
}