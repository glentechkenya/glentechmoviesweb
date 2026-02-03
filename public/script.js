const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsEl = document.getElementById("results");
const latestEl = document.getElementById("latest");
const trendingEl = document.getElementById("trending");

const trailerModal = document.getElementById("trailerModal");
const trailerPlayer = document.getElementById("trailerPlayer");
const trailerTitle = document.getElementById("trailerTitle");
const trailerDesc = document.getElementById("trailerDesc");
const openDetail = document.getElementById("openDetail");
const closeModal = document.getElementById("closeModal");

searchBtn.addEventListener("click", () => doSearch(searchInput.value));
searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(searchInput.value); });
closeModal.addEventListener("click", () => { trailerModal.classList.add("hidden"); trailerPlayer.pause(); trailerPlayer.src = ""; });

async function doSearch(q){
  if (!q) return;
  resultsEl.innerHTML = `<div class="card"><div class="meta"><h3>Searching for "${q}"...</h3></div></div>`;
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!data?.result?.results?.length) {
      resultsEl.innerHTML = `<div class="card"><div class="meta"><h3>No results for "${q}"</h3></div></div>`;
      return;
    }
    renderResults(data.result.results);
  } catch (err) {
    resultsEl.innerHTML = `<div class="card"><div class="meta"><h3>Error contacting API</h3><p>${err.message}</p></div></div>`;
  }
}

function renderResults(items){
  resultsEl.innerHTML = "";
  items.forEach(it => {
    const card = document.createElement("div");
    card.className = "card";
    const img = document.createElement("img");
    img.src = it.thumbnail || it.image || "https://via.placeholder.com/160x90?text=Poster";
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<h3>${it.title}</h3><p>Rating: ${it.rating || "N/A"} • Type: ${it.type || "N/A"}</p>`;
    const actions = document.createElement("div");
    actions.className = "actions";
    const trailerBtn = document.createElement("a");
    trailerBtn.className = "btn";
    trailerBtn.textContent = "Trailer";
    trailerBtn.href = "#";
    trailerBtn.addEventListener("click", (e) => { e.preventDefault(); openTrailer(it.url); });
    const detailBtn = document.createElement("a");
    detailBtn.className = "btn";
    detailBtn.textContent = "Open";
    detailBtn.href = it.url;
    detailBtn.target = "_blank";
    actions.appendChild(trailerBtn);
    actions.appendChild(detailBtn);
    card.appendChild(img);
    card.appendChild(meta);
    card.appendChild(actions);
    resultsEl.appendChild(card);
  });
}

async function openTrailer(detailUrl){
  try {
    const res = await fetch(`/api/trailer?url=${encodeURIComponent(detailUrl)}`);
    const data = await res.json();
    const r = data.result || data;
    trailerTitle.textContent = r.title || "Trailer";
    trailerDesc.textContent = r.description || "";
    trailerPlayer.src = r.trailerUrl || r.video_url || "";
    openDetail.href = r.url || detailUrl;
    trailerModal.classList.remove("hidden");
    trailerPlayer.play().catch(()=>{});
  } catch (err) {
    alert("Error fetching trailer: " + err.message);
  }
}

/* load latest & trending on start */
async function loadLatest(){
  try {
    const res = await fetch("/api/latest");
    const data = await res.json();
    const latest = data.result?.latest || [];
    const trending = data.result?.trending || [];
    latestEl.innerHTML = "";
    latest.forEach(it => {
      const c = document.createElement("div");
      c.className = "card";
      c.innerHTML = `<img src="${it.image || 'https://via.placeholder.com/160x90'}" /><div class="meta"><h3>${it.title}</h3><p>${it.episodes || ''}</p></div><div class="actions"><a class="btn" href="#" onclick="event.preventDefault(); openTrailer('${it.image}')">Open</a></div>`;
      latestEl.appendChild(c);
    });
    trendingEl.innerHTML = "";
    trending.forEach(it => {
      const c = document.createElement("div");
      c.className = "card";
      c.innerHTML = `<img src="${it.image || 'https://via.placeholder.com/160x90'}" /><div class="meta"><h3>${it.title}</h3><p>Rank: ${it.rank || '-'}</p></div><div class="actions"><a class="btn" href="#" onclick="event.preventDefault(); openTrailer('${it.image}')">Open</a></div>`;
      trendingEl.appendChild(c);
    });
  } catch (err) {
    console.error("Latest load error", err);
  }
}

loadLatest();
