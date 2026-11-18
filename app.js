// ===== 설정 =====
// 유튜브 영상 ID를 넣으면 페이지에 영상이 임베드됩니다. (예: https://www.youtube.com/watch?v=XXXX → "XXXX")
const YOUTUBE_VIDEO_ID = "";
// 영상 ID가 없을 때 연결할 유튜브 검색어
const YOUTUBE_SEARCH_QUERY = "2026 5월 25일 호우 대응 중대본";

const DATA_URL = "data/press.json";

let articles = [];

// 마크다운 본문에서 요약(첫 번째 본문 단락) 추출
function summarize(markdown, maxLen = 120) {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((p) => p.replace(/^#+\s*/gm, "").replace(/\*\*/g, "").replace(/---/g, "").trim())
    .filter((p) => p && !p.startsWith("담당 부서"));
  const text = paragraphs[0] || "";
  return text.length > maxLen ? text.slice(0, maxLen).trim() + "…" : text;
}

function renderCards(list) {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "검색 결과가 없습니다.";
    container.appendChild(empty);
    return;
  }

  for (const a of list) {
    const card = document.createElement("article");
    card.className = "card";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = a.부처;

    const title = document.createElement("h2");
    title.textContent = a.제목;

    const summary = document.createElement("p");
    summary.textContent = summarize(a.본문);

    card.append(badge, title, summary);
    container.appendChild(card);
  }
}

function applyFilter() {
  const keyword = document.getElementById("keyword").value.trim().toLowerCase();
  const filtered = keyword
    ? articles.filter((a) => a.부처.toLowerCase().includes(keyword) || a.본문.toLowerCase().includes(keyword))
    : articles;

  document.getElementById("result-count").textContent = `결과 ${filtered.length}건`;
  renderCards(filtered);
}

function renderVideo() {
  const area = document.getElementById("video-area");
  if (YOUTUBE_VIDEO_ID) {
    const wrap = document.createElement("div");
    wrap.className = "video-wrap";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(YOUTUBE_VIDEO_ID)}`;
    iframe.title = "관련 영상";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    wrap.appendChild(iframe);
    area.appendChild(wrap);
  } else {
    const link = document.createElement("a");
    link.className = "video-link";
    link.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(YOUTUBE_SEARCH_QUERY)}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "YouTube에서 관련 영상 보기";
    const note = document.createElement("p");
    note.className = "video-note";
    note.textContent = "app.js의 YOUTUBE_VIDEO_ID에 영상 ID를 입력하면 페이지에 직접 임베드됩니다.";
    area.append(link, note);
  }
}

async function init() {
  renderVideo();
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    articles = await res.json();
  } catch (err) {
    document.getElementById("result-count").textContent = "데이터를 불러오지 못했습니다.";
    console.error(err);
    return;
  }
  document.getElementById("keyword").addEventListener("input", applyFilter);
  applyFilter();
}

init();
