import https from "https";

const UA = "DiscoverCCC/1.0 (educational project; Santarém agenda)";

function fetchInsecure(url: string, accept: string): Promise<string> {
  const u = new URL(url);
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        hostname: u.hostname,
        path: `${u.pathname}${u.search}`,
        method: "GET",
        headers: { "User-Agent": UA, Accept: accept },
        rejectUnauthorized: false,
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          res.resume();
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      }
    );
    req.on("error", reject);
    req.setTimeout(35_000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function fetchCm(url: string, accept: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: accept },
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    console.warn("fetchCm primary failed, fallback:", url, err);
    return fetchInsecure(url, accept);
  }
}

export function fetchRssXml(feedUrl: string): Promise<string> {
  return fetchCm(
    feedUrl,
    "application/rss+xml, application/xml, text/xml, */*"
  );
}

export function fetchCmPageHtml(pageUrl: string): Promise<string> {
  return fetchCm(
    pageUrl,
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  );
}
