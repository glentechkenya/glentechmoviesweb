import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import * as sample from "./sample-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const KEITH_API_BASE = process.env.KEITH_API_BASE || ""; // e.g. https://keith-api.example

async function callKeith(pathSuffix, params = {}) {
  if (!KEITH_API_BASE) throw new Error("No KEITH_API_BASE configured");
  const url = `${KEITH_API_BASE}${pathSuffix}`;
  // No Authorization header sent — public endpoints only
  const resp = await axios.get(url, { params, timeout: 15000 });
  return resp.data;
}

/* Search */
app.get("/api/search", async (req, res) => {
  const q = req.query.q || "";
  try {
    if (KEITH_API_BASE) {
      const data = await callKeith(`/search?q=${encodeURIComponent(q)}`);
      return res.json(data);
    } else {
      const s = sample.movieSearchSample;
      const filtered = s.result.results.filter(r => r.title.toLowerCase().includes(q.toLowerCase()));
      return res.json({ status: true, creator: s.creator, result: { keyword: q, count: filtered.length, results: filtered }});
    }
  } catch (err) {
    console.error("Search error:", err.message);
    return res.status(500).json({ status: false, error: "Error contacting Keith API or no KEITH_API_BASE set." });
  }
});

/* Movie download info */
app.get("/api/movie/:bookId", async (req, res) => {
  const bookId = req.params.bookId;
  try {
    if (KEITH_API_BASE) {
      const data = await callKeith(`/movie/${encodeURIComponent(bookId)}`);
      return res.json(data);
    } else {
      return res.json(sample.movieDownloadSample);
    }
  } catch (err) {
    console.error("Movie fetch error:", err.message);
    return res.status(500).json({ status: false, error: "Error contacting Keith API or no KEITH_API_BASE set." });
  }
});

/* Latest & Trending */
app.get("/api/latest", async (req, res) => {
  try {
    if (KEITH_API_BASE) {
      const data = await callKeith(`/latest`);
      return res.json(data);
    } else {
      return res.json(sample.latestTrendingSample);
    }
  } catch (err) {
    console.error("Latest error:", err.message);
    return res.status(500).json({ status: false, error: "Error contacting Keith API or no KEITH_API_BASE set." });
  }
});

/* Trailer */
app.get("/api/trailer", async (req, res) => {
  const url = req.query.url || "";
  try {
    if (KEITH_API_BASE) {
      const data = await callKeith(`/trailer?url=${encodeURIComponent(url)}`);
      return res.json(data);
    } else {
      return res.json(sample.trailerSample);
    }
  } catch (err) {
    console.error("Trailer error:", err.message);
    return res.status(500).json({ status: false, error: "Error contacting Keith API or no KEITH_API_BASE set." });
  }
});

/* SPA fallback */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GlentechKenya Movies running on port ${PORT}`));
