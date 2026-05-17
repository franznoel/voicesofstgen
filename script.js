const TODAY = new Date();

const choirPlans = [
  {
    date: "2026-04-05",
    title: "First Sunday of Easter",
    pdfLinks: [
      { label: "All PDFs", url: "https://drive.google.com/file/d/1NekrbhijCbAZ4qK3WqdLPehF_kKQr-mU/view?usp=sharing" }
    ],
    songs: [
      { role: "Entrance", title: "Jesus Christ Is Risen Today", composer: "", videoId: "r9a41CvVEHw" },
      { role: "Mass parts", title: "Mass of St. Ann", composer: "", videoId: "" },
      { role: "Sequence", title: "Christ Is Arisen", composer: "Randall DeBruyn", videoId: "kjoDUx7cUto" },
      { role: "Sprinkling Rite", title: "You Will Draw Water Joyfully", composer: "Tony Alonso", videoId: "Jx7JUFrKOws" },
      { role: "Preparation of the Gifts", title: "This Is the Day", composer: "Michael Joncas", videoId: "OV55-exqRqk" },
      { role: "Communion", title: "Worthy Is the Lamb", composer: "", videoId: "pjA-a04T_6M" },
      { role: "Recessional", title: "Join in the Dance", composer: "", videoId: "m1YfdgWn8NI" }
    ],
    optionalSongs: ["Go to Pentecost"]
  },
  {
    date: "2026-04-12",
    title: "Second Sunday of Easter (A)",
    pdfLinks: [
      { label: "All PDFs", url: "https://drive.google.com/file/d/1CYP6Lgd8Mr4jGC8ox0LU8OJpJazqrsNp/view?usp=sharing" }
    ],
    songs: [
      { role: "Entrance", title: "Join in the Dance", composer: "Schutte", videoId: "m1YfdgWn8NI" },
      { role: "Preparation of Gifts", title: "Peace I Leave to You", composer: "B. Bridge", videoId: "N7bGBrSme10" },
      { role: "Communion", title: "Hold on to Love", composer: "Manibusan", videoId: "WtrbxIW7bRo" },
      { role: "Recessional", title: "This Day Was Made by the Lord", composer: "Walker", videoId: "CfBD7JdUC2w" }
    ],
    optionalSongs: [
      { title: "Divine Mercy", videoId: "SazCpHzkLwk" }
    ]
  },
  {
    date: "2026-04-19",
    title: "Third Sunday of Easter (A)",
    pdfLinks: [
      { label: "All PDFs", url: "https://drive.google.com/file/d/1PkeHkJ4MEyR28vK_nlGyuzW5i3PvIvtK/view?usp=sharing" }
    ],
    songs: [
      { role: "Entrance", title: "Alleluia, Love Is Alive!", composer: "", videoId: "2mBLw5wt69U" },
      { role: "Preparation of Gifts", title: "Christ the Lord", composer: "", videoId: "ODn8t2ikHdw" },
      { role: "Communion", title: "The Supper of the Lord", composer: "", videoId: "7D2E6QWBINg" },
      { role: "Recessional", title: "Regina Caeli", composer: "Chant / Vatican", videoId: "g-_DmSdrQbI" }
    ],
    optionalSongs: ["The Day of Resurrection - Ellacombe"]
  },
  {
    date: "2026-04-26",
    title: "Fourth Sunday of Easter (A)",
    pdfLinks: [
      { label: "All PDFs", url: "https://drive.google.com/file/d/1rnuKNkqqpLlyJX1c49y6uY5Tf5blfg8B/view?usp=sharing" }
    ],
    songs: [
      { role: "Entrance", title: "Sing a Joyful Song", composer: "", videoId: "43vt850P9Fs" },
      { role: "Preparation of Gifts", title: "Eye Has Not Seen", composer: "Haugen", videoId: "7jYgOQC82aU" },
      { role: "Communion", title: "Because the Lord Is My Shepherd", composer: "Walker", videoId: "o1oTLkhE9qM" },
      { role: "Recessional", title: "Regina Caeli", composer: "Chant / Vatican", videoId: "JGS5v-M5hc0" }
    ],
    optionalSongs: ["As Christ Is for Us"]
  },
  {
    date: "2026-05-03",
    title: "Fifth Sunday of Easter (A)",
    pdfLinks: [
      { label: "All PDFs", url: "https://drive.google.com/file/d/109OHhIk5q4lm1flF3AhPHN9-GTcG2vkk/view?usp=sharing" }
    ],
    songs: [
      { role: "Entrance", title: "Jesus Is Risen", composer: "Lasst Uns Erfreuen", videoId: "nWQu-7V8aLs" },
      { role: "Psalm", title: "Lord, Let Your Mercy Be on Us", composer: "R&A", videoId: "" },
      { role: "Offertory", title: "I Am the Bread of Life", composer: "Angrisano / Tom Booth", videoId: "08Wk9Z_6mvQ" },
      { role: "Communion", title: "O God, You Search Me", composer: "Farrell", videoId: "F-5wRqmFDqI" },
      { role: "Recessional", title: "Regina Caeli", composer: "Chant / Vatican", videoId: "g-_DmSdrQbI" }
    ],
    optionalSongs: []
  },
  {
    date: "2026-05-10",
    title: "Sixth Sunday of Easter (A)",
    pdfLinks: [
      { label: "All PDFs", url: "https://drive.google.com/file/d/17VWCD7sVsHm9n3VxKP-IFZ6QRHUGto_M/view?usp=sharing" },
      { label: "The Prayer PDF", url: "https://drive.google.com/file/d/1JV8O3Q9ejcscIQ7pvejZXuIrvlGrB4QY/view?usp=sharing" }
    ],
    songs: [
      { role: "Entrance", title: "Alleluia, Sing to Jesus", composer: "Hyfrydol", videoId: "Wh61poqcnpA" },
      { role: "Psalm", title: "Let All the Earth Cry Out to God", composer: "R&A", videoId: "" },
      { role: "Offertory", title: "Only in God", composer: "Talbot", videoId: "9pDy_9Hb8Wc" },
      { role: "Communion", title: "Eat This Bread", composer: "Berthier", videoId: "ntJwBHlbwGw" },
      { role: "Communion", title: "Come to Me and Drink", composer: "Bob Hurd", videoId: "qAfTt2pN8Aw" },
      { role: "Mother's Day Song", title: "More Than Enough", composer: "Shawna Edwards", videoId: "P7EfJRrJueY" },
      { role: "Mother's Day Song", title: "A Mother's Prayer", composer: "Celine Dion", videoId: "Jz9y4x1NhJo", notes: "Use with The Prayer PDF lyric change." },
      { role: "Recessional", title: "Regina Caeli", composer: "Chant / Vatican", videoId: "g-_DmSdrQbI" },
      { role: "Optional", title: "Go Make a Difference", composer: "", videoId: "A3IN5Wsi9e0" }
    ],
    optionalSongs: []
  },
  {
    date: "2026-05-17",
    title: "Seventh Sunday of Easter (A)",
    pdfLinks: [
      { label: "All PDFs", url: "https://drive.google.com/file/d/1iLNxXnA5S2P2LCrlJGSfcz_pHrpaxpXA/view?usp=sharing" }
    ],
    songs: [
      { role: "Entrance", title: "Canticle of the Sun", composer: "Haugen", videoId: "-2R180JStUM" },
      { role: "Psalm", title: "I Believe I Shall See", composer: "R&A", videoId: "" },
      { role: "Offertory", title: "We Are Many Parts", composer: "Haugen", videoId: "q77uRQxKDCY" },
      { role: "Communion", title: "We Remember", composer: "", videoId: "FzmLi3nddjI" },
      { role: "Recessional", title: "Go Out, Go Out", composer: "Stephen", videoId: "bdiEEVIhvPI" }
    ],
    optionalSongs: []
  }
];

const scrapedVideoReferences = [
  ["Wh61poqcnpA", "Alleluia! Sing to Jesus"],
  ["9pDy_9Hb8Wc", "Only in God"],
  ["ntJwBHlbwGw", "Eat This Bread"],
  ["qAfTt2pN8Aw", "Come to Me and Drink"],
  ["P7EfJRrJueY", "More Than Enough"],
  ["g-_DmSdrQbI", "Regina Caeli"],
  ["A3IN5Wsi9e0", "Go Make a Difference"],
  ["Jz9y4x1NhJo", "A Mother's Prayer"],
  ["-2R180JStUM", "Canticle of the Sun"],
  ["q77uRQxKDCY", "We Are Many Parts"],
  ["FzmLi3nddjI", "We Remember"],
  ["bdiEEVIhvPI", "Go Out, Go Out"],
  ["r9a41CvVEHw", "Jesus Christ Is Risen Today"],
  ["kjoDUx7cUto", "Christ Is Arisen"],
  ["Jx7JUFrKOws", "You Will Draw Water Joyfully"],
  ["OV55-exqRqk", "Psalm 118: This Is the Day"],
  ["pjA-a04T_6M", "Worthy Is the Lamb"],
  ["m1YfdgWn8NI", "Join in the Dance"],
  ["m1YfdgWn8NI", "Join in the Dance"],
  ["N7bGBrSme10", "Peace I Leave with You"],
  ["WtrbxIW7bRo", "Hold On to Love"],
  ["CfBD7JdUC2w", "This Day Was Made by the Lord"],
  ["SazCpHzkLwk", "Divine Mercy"],
  ["2mBLw5wt69U", "Alleluia! Love Is Alive"],
  ["ODn8t2ikHdw", "Christ the Lord"],
  ["7D2E6QWBINg", "The Supper of the Lord"],
  ["g-_DmSdrQbI", "Regina Caeli"],
  ["43vt850P9Fs", "Sing a Joyful Song"],
  ["7jYgOQC82aU", "Eye Has Not Seen"],
  ["o1oTLkhE9qM", "Because the Lord Is My Shepherd"],
  ["JGS5v-M5hc0", "Regina Caeli - Gregorian Chant"],
  ["nWQu-7V8aLs", "Jesus Is Risen"],
  ["08Wk9Z_6mvQ", "I Am the Bread of Life"],
  ["F-5wRqmFDqI", "O God, You Search Me"],
  ["g-_DmSdrQbI", "Regina Caeli"]
];

const videoTitleById = new Map(scrapedVideoReferences);

const currentPlanEl = document.querySelector("#current-plan");
const planListEl = document.querySelector("#plan-list");
const videoGridEl = document.querySelector("#video-grid");

let selectedPlan = getCurrentPlan(choirPlans, TODAY);

render();

function render() {
  renderCurrentPlan(selectedPlan);
  renderPlanList();
  renderVideos(selectedPlan);
}

function getCurrentPlan(plans, today) {
  const upcoming = plans.find((plan) => new Date(`${plan.date}T23:59:59`) >= today);
  return upcoming || plans[plans.length - 1];
}

function renderCurrentPlan(plan) {
  currentPlanEl.innerHTML = `
    <article>
      <div class="plan-hero">
        <div>
          <p class="plan-date">${formatDate(plan.date)}</p>
          <h3 class="plan-title">${escapeHtml(plan.title)}</h3>
        </div>
        ${renderPdfLinks(plan.pdfLinks)}
      </div>
      <div class="song-table" aria-label="${escapeHtml(plan.title)} song plan">
        ${plan.songs.map(renderSongRow).join("")}
      </div>
    </article>
  `;
}

function renderSongRow(song) {
  const videoLink = song.videoId
    ? `<a class="video-jump" href="#video-${song.videoId}">Practice</a>`
    : `<span class="song-note">No video</span>`;

  return `
    <div class="song-row">
      <div class="song-role">${escapeHtml(song.role)}</div>
      <div>
        <div class="song-title">${escapeHtml(song.title)}</div>
        ${song.notes ? `<div class="song-note">${escapeHtml(song.notes)}</div>` : ""}
      </div>
      <div class="song-composer">${escapeHtml(song.composer || "")}</div>
      ${videoLink}
    </div>
  `;
}

function renderPdfLinks(pdfLinks) {
  if (!pdfLinks.length) {
    return "";
  }

  return `
    <div class="pdf-links" aria-label="PDF links">
      ${pdfLinks.map((pdf) => `
        <a href="${pdf.url}" target="_blank" rel="noreferrer">${escapeHtml(pdf.label)}</a>
      `).join("")}
    </div>
  `;
}

function renderPlanList() {
  planListEl.innerHTML = choirPlans.map((plan) => {
    const isCurrent = plan.date === selectedPlan.date;
    const songPreview = plan.songs.slice(0, 4).map((song) => `<li>${escapeHtml(song.role)}: ${escapeHtml(song.title)}</li>`).join("");

    return `
      <article class="plan-card ${isCurrent ? "current" : ""}">
        <time datetime="${plan.date}">${formatDate(plan.date)}</time>
        <h3>${escapeHtml(plan.title)}</h3>
        <ul>${songPreview}</ul>
        <button class="select-plan" type="button" data-plan-date="${plan.date}">
          ${isCurrent ? "Viewing" : "View songs"}
        </button>
      </article>
    `;
  }).join("");

  planListEl.querySelectorAll("[data-plan-date]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedPlan = choirPlans.find((plan) => plan.date === button.dataset.planDate);
      render();
      document.querySelector("#current-sunday").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderVideos(plan) {
  const videos = getUniqueVideosForPlan(plan);
  videoGridEl.innerHTML = videos.map((video) => `
    <article class="video-card" id="video-${video.videoId}">
      <div class="video-shell" data-video-shell>
        <img
          src="https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg"
          alt=""
          loading="lazy"
        >
        <button
          class="load-video"
          type="button"
          data-video-id="${video.videoId}"
          data-video-title="${escapeAttribute(video.title)}"
          aria-label="Play ${escapeAttribute(video.title)}"
        ></button>
      </div>
      <div class="video-meta">
        <h3>${escapeHtml(video.title)}</h3>
        <p>${escapeHtml(video.role)}</p>
      </div>
    </article>
  `).join("");

  videoGridEl.querySelectorAll("[data-video-id]").forEach((button) => {
    button.addEventListener("click", () => loadVideo(button));
  });
}

function getUniqueVideosForPlan(plan) {
  const videos = [];
  const seen = new Set();

  plan.songs.forEach((song) => {
    if (!song.videoId || seen.has(song.videoId)) {
      return;
    }

    seen.add(song.videoId);
      videos.push({
        videoId: song.videoId,
      title: videoTitleById.get(song.videoId) || song.title,
      role: song.role
    });
  });

  plan.optionalSongs.forEach((optional) => {
    if (typeof optional === "object" && optional.videoId && !seen.has(optional.videoId)) {
      seen.add(optional.videoId);
      videos.push({
        videoId: optional.videoId,
        title: videoTitleById.get(optional.videoId) || optional.title,
        role: "Optional"
      });
    }
  });

  return videos;
}

function loadVideo(button) {
  const shell = button.closest("[data-video-shell]");
  const videoId = button.dataset.videoId;
  const title = button.dataset.videoTitle;

  shell.innerHTML = `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0"
      title="${escapeAttribute(title)}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  `;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateString}T12:00:00`));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
