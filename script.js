const TODAY = new Date();
const SITE_TIME_ZONE = "America/Los_Angeles";
const PRODUCTION_HOSTS = new Set(["voicesofstgen.com", "www.voicesofstgen.com"]);
const isProductionHost = PRODUCTION_HOSTS.has(window.location.hostname);
const isReturningVisitor = getReturningVisitorStatus();

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
  },
  {
    date: "2026-05-24",
    title: "Pentecost Sunday (A)",
    pdfLinks: [
      { label: "All PDFs", url: "https://drive.google.com/file/d/1W4kGltRFsW3AyEReumYG8uN3qxwRMdjV/view?usp=sharing" }
    ],
    songs: [
      { role: "Mass parts", title: "Mass of Christ Savior", composer: "", videoId: "" },
      { role: "Entrance", title: "Creator Spirit, by Whose Aid", composer: "Lasst Uns Erfreuen", videoId: "MLsj73tAh7g" },
      { role: "Sequence", title: "Come, O Holy Spirit", composer: "Hymn to Joy", videoId: "3Jqlc69s4EA" },
      { role: "Preparation of Gifts", title: "Holy Spirit, Come Now", composer: "", videoId: "1Tgz9X8l3GM" },
      { role: "Communion", title: "Many and One", composer: "", videoId: "" },
      { role: "Recessional", title: "One Spirit, One Church", composer: "", videoId: "iMpa11CUg0Q" }
    ],
    optionalSongs: []
  },
  {
    date: "2026-05-31",
    title: "The Most Holy Trinity (A)",
    pdfLinks: [
      { label: "All PDFs", url: "https://drive.google.com/file/d/1gre-KriAwqTGnd1HRKXdCSAWwZ1J-qqa/view?usp=sharing" }
    ],
    songs: [
      { role: "Entrance", title: "Holy, Holy, Holy", composer: "", videoId: "ntdcY8q7a9E" },
      { role: "Preparation of Gifts", title: "Eye Has Not Seen", composer: "", videoId: "7jYgOQC82aU" },
      { role: "Communion", title: "I Am the Bread of Life", composer: "Angrisano", videoId: "08Wk9Z_6mvQ" },
      { role: "Recessional", title: "Holy God, We Praise Your Name", composer: "", videoId: "0ytf_TIujPw" }
    ],
    optionalSongs: []
  },
  {
    date: "2026-06-07",
    title: "The Most Holy Body and Blood of Christ (A)",
    pdfLinks: [],
    songs: [
      { role: "Entrance", title: "Table of Plenty", composer: "Dan Schutte", videoId: "okAMb_ra8Uw" },
      { role: "Sequence", title: "Corpus Christi Sequence", composer: "", videoId: "xbrl2zWi3EA" },
      { role: "Offertory", title: "As Christ Is for Us", composer: "Janet Whitaker", videoId: "LIJ2MJMd_ks" },
      { role: "Communion", title: "Bread of Angels", composer: "", videoId: "0XMGRUUFr0M" },
      { role: "Communion", title: "Miracle of Grace", composer: "", videoId: "-tg7539_wOE" },
      { role: "Recessional", title: "Alleluia, Sing to Jesus", composer: "Hyfrydol", videoId: "Wh61poqcnpA" }
    ],
    optionalSongs: []
  },
  {
    date: "2026-06-14",
    title: "Eleventh Sunday in Ordinary Time (A)",
    pdfLinks: [],
    songs: [
      { role: "Note", title: "10:30 Ugandan Choir", composer: "", videoId: "" },
      { role: "Entrance", title: "Our God Is Here", composer: "", videoId: "WtSnIxnIB3k" },
      { role: "Offertory", title: "Servant Song", composer: "Donna McGargill", videoId: "nVesi-4A52w" },
      { role: "Communion", title: "Ubi Caritas", composer: "Hurd", videoId: "TSk6NDRK44M" },
      { role: "Communion", title: "On Eagle's Wings", composer: "Joncas", videoId: "oXP-FsNUWOc" },
      { role: "Recessional", title: "With One Voice", composer: "Manalo", videoId: "wwXtDuLFHJg" }
    ],
    optionalSongs: [
      { title: "Ubi Caritas - Alejandro D. Consolacion II", videoId: "x93VMgWSPsg" }
    ]
  },
  {
    date: "2026-06-21",
    title: "Twelfth Sunday in Ordinary Time (A)",
    pdfLinks: [],
    songs: [
      { role: "Entrance", title: "In This Place", composer: "Thompson", videoId: "kMcroYiXb7E" },
      { role: "Offertory", title: "In Every Age", composer: "Whitaker", videoId: "5BxarTJavmY" },
      { role: "Communion", title: "Be Not Afraid", composer: "Dufford", videoId: "2oSiX1WKg4w" },
      { role: "Communion", title: "Take and Eat", composer: "Joncas", videoId: "XkvOnb2fsvU" },
      { role: "Father's Day Song", title: "I Am Ever With You", composer: "", videoId: "akVBHThhmHk" },
      { role: "Recessional", title: "Rain Down", composer: "Cortez", videoId: "pmOswvlS6CQ" }
    ],
    optionalSongs: []
  },
  {
    date: "2026-06-28",
    title: "Thirteenth Sunday in Ordinary Time (A)",
    pdfLinks: [],
    songs: [
      { role: "Entrance", title: "Lift High the Cross", composer: "Crucifer / Nicholson", videoId: "jiO3ODgCgxM" },
      { role: "Offertory", title: "Take Up Your Cross", composer: "Cortez", videoId: "HZboEnq9I4k" },
      { role: "Communion", title: "The Supper of the Lord", composer: "Rosania", videoId: "z_WrU9oWqh0" },
      { role: "Communion", title: "We Are Many Parts", composer: "Haugen", videoId: "q77uRQxKDCY" },
      { role: "Recessional", title: "I Am the Bread of Life", composer: "Angrisano / Tom Booth", videoId: "Y845n-lXO4o" }
    ],
    optionalSongs: [
      { title: "Somos El Cuerpo De Cristo", videoId: "9Vj_VYbbn_c" },
      "Go to July"
    ]
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
  ["g-_DmSdrQbI", "Regina Caeli"],
  ["MLsj73tAh7g", "Creator Spirit, By Whose Aid"],
  ["3Jqlc69s4EA", "Come, O Holy Spirit"],
  ["1Tgz9X8l3GM", "Holy Spirit, Come Now"],
  ["iMpa11CUg0Q", "One Spirit, One Church"],
  ["ntdcY8q7a9E", "Holy, Holy, Holy! Lord God Almighty! (Nicaea)"],
  ["7jYgOQC82aU", "Eye Has Not Seen"],
  ["08Wk9Z_6mvQ", "I Am the Bread of Life"],
  ["0ytf_TIujPw", "Holy God, We Praise Thy Name"],
  ["okAMb_ra8Uw", "Table of Plenty"],
  ["xbrl2zWi3EA", "Corpus Christi Sequence"],
  ["LIJ2MJMd_ks", "As Christ Is for Us"],
  ["0XMGRUUFr0M", "Bread of Angels"],
  ["-tg7539_wOE", "Miracle of Grace"],
  ["Wh61poqcnpA", "Alleluia! Sing to Jesus"],
  ["WtSnIxnIB3k", "Our God Is Here"],
  ["nVesi-4A52w", "The Servant Song"],
  ["TSk6NDRK44M", "Ubi Caritas"],
  ["x93VMgWSPsg", "Ubi Caritas - Alejandro D. Consolacion II"],
  ["oXP-FsNUWOc", "On Eagle's Wings"],
  ["wwXtDuLFHJg", "With One Voice"],
  ["kMcroYiXb7E", "In This Place"],
  ["5BxarTJavmY", "In Every Age"],
  ["2oSiX1WKg4w", "Be Not Afraid"],
  ["XkvOnb2fsvU", "Take and Eat"],
  ["akVBHThhmHk", "I Am Ever With You"],
  ["pmOswvlS6CQ", "Rain Down"],
  ["jiO3ODgCgxM", "Lift High the Cross"],
  ["HZboEnq9I4k", "Take Up Your Cross"],
  ["z_WrU9oWqh0", "The Supper of the Lord"],
  ["q77uRQxKDCY", "We Are Many Parts"],
  ["Y845n-lXO4o", "I Am the Bread of Life"],
  ["9Vj_VYbbn_c", "We Are the Body of Christ"]
];

const videoTitleById = new Map(scrapedVideoReferences);

const galleryImages = [
  { src: "assets/gallery/1000046063.jpg", alt: "St. Genevieve choir photo 1" },
  { src: "assets/gallery/1000046064.jpg", alt: "St. Genevieve choir photo 2" },
  { src: "assets/gallery/Resized_20251228_094553.jpeg", alt: "St. Genevieve choir photo 3" },
  { src: "assets/gallery/Resized_20251228_094609.jpeg", alt: "St. Genevieve choir photo 4" },
  { src: "assets/gallery/Resized_20251228_094613.jpeg", alt: "St. Genevieve choir photo 5" },
  { src: "assets/gallery/imagejpeg_0%202.jpg", alt: "St. Genevieve choir photo 6" },
  { src: "assets/gallery/imagejpeg_0.jpg", alt: "St. Genevieve choir photo 7" },
  { src: "assets/gallery/converted/IMG_0602.jpg", alt: "St. Genevieve choir photo 8" },
  { src: "assets/gallery/converted/IMG_6054.jpg", alt: "St. Genevieve choir photo 9" },
  { src: "assets/gallery/converted/IMG_6055.jpg", alt: "St. Genevieve choir photo 10" },
  { src: "assets/gallery/converted/IMG_6799.jpg", alt: "St. Genevieve choir photo 11" },
  { src: "assets/gallery/converted/IMG_6800.jpg", alt: "St. Genevieve choir photo 12" },
  { src: "assets/gallery/converted/IMG_6803.jpg", alt: "St. Genevieve choir photo 13" },
  { src: "assets/gallery/converted/IMG_6804.jpg", alt: "St. Genevieve choir photo 14" }
];

const currentPlanEl = document.querySelector("#current-plan");
const planListEl = document.querySelector("#plan-list");
const archiveListEl = document.querySelector("#archive-list");
const archivePanelEl = document.querySelector("#archive-panel");
const archiveToggleEl = document.querySelector("#archive-toggle");
const videoGridEl = document.querySelector("#video-grid");
const galleryGridEl = document.querySelector("#gallery-grid");
const galleryDialogEl = document.querySelector("#gallery-dialog");
const galleryDialogImageEl = document.querySelector("#gallery-dialog-image");
const galleryDialogCaptionEl = document.querySelector("#gallery-dialog-caption");

let selectedPlan = getCurrentPlan(choirPlans, TODAY);
let selectedGalleryIndex = 0;
let galleryTouchStartX = 0;

render();
renderGallery();
setupGalleryDialog();
setupArchiveToggle();
setupGlobalAnalytics();
trackEvent("site_loaded", {
  current_plan_date: selectedPlan.date,
  current_plan_title: selectedPlan.title,
  total_plans: choirPlans.length,
  total_gallery_images: galleryImages.length
});

function render() {
  renderCurrentPlan(selectedPlan);
  renderPlanList();
  renderVideos(selectedPlan);
}

function getCurrentPlan(plans, today) {
  const currentSunday = getCurrentSundayDateString(today);
  return plans.find((plan) => plan.date >= currentSunday) || plans[plans.length - 1];
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
        ${plan.optionalSongs.map(renderOptionalSongRow).join("")}
      </div>
    </article>
  `;
}

function renderOptionalSongRow(optionalSong) {
  const song = typeof optionalSong === "string"
    ? { role: "Optional", title: optionalSong, composer: "", videoId: "" }
    : { role: "Optional", composer: "", ...optionalSong };

  return renderSongRow(song);
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
  const currentSunday = getCurrentSundayDateString(TODAY);
  const activePlans = choirPlans.filter((plan) => plan.date >= currentSunday);
  const archivedPlans = choirPlans.filter((plan) => plan.date < currentSunday);

  planListEl.innerHTML = activePlans.map(renderPlanCard).join("");
  archiveListEl.innerHTML = archivedPlans.map(renderPlanCard).join("");

  archiveToggleEl.hidden = archivedPlans.length === 0;
  if (archivedPlans.length === 0) {
    archivePanelEl.hidden = true;
    archiveToggleEl.setAttribute("aria-expanded", "false");
  }

  document.querySelectorAll("[data-plan-date]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedPlan = choirPlans.find((plan) => plan.date === button.dataset.planDate);
      trackEvent("plan_selected", {
        plan_date: selectedPlan.date,
        plan_title: selectedPlan.title,
        is_archived: selectedPlan.date < getCurrentSundayDateString(TODAY)
      });
      render();
      document.querySelector("#current-sunday").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderPlanCard(plan) {
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
}

function setupArchiveToggle() {
  archiveToggleEl.addEventListener("click", () => {
    const shouldOpen = archivePanelEl.hidden;

    archivePanelEl.hidden = !shouldOpen;
    archiveToggleEl.setAttribute("aria-expanded", String(shouldOpen));
    archiveToggleEl.textContent = shouldOpen ? "Hide archived plans" : "Show archived plans";

    if (shouldOpen) {
      trackEvent("view_archive", {
        archived_plan_count: archiveListEl.querySelectorAll(".plan-card").length
      });
    }
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

function renderGallery() {
  galleryGridEl.innerHTML = galleryImages.map((image, index) => {
    const caption = `Choir photo ${index + 1}`;

    return `
      <button
        class="gallery-item"
        type="button"
        data-gallery-index="${index}"
        aria-label="Open ${caption}"
      >
        <img src="${image.src}" alt="${escapeAttribute(image.alt)}" loading="lazy">
        <span>${caption}</span>
      </button>
    `;
  }).join("");

  galleryGridEl.querySelectorAll("[data-gallery-index]").forEach((button) => {
    button.addEventListener("click", () => openGalleryImage(Number.parseInt(button.dataset.galleryIndex, 10)));
  });
}

function setupGalleryDialog() {
  galleryDialogEl.querySelector(".dialog-close").addEventListener("click", () => {
    galleryDialogEl.close();
  });

  galleryDialogEl.querySelectorAll("[data-gallery-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      moveGallery(Number.parseInt(button.dataset.galleryDirection, 10), "button");
    });
  });

  galleryDialogEl.addEventListener("click", (event) => {
    if (event.target === galleryDialogEl) {
      galleryDialogEl.close();
    }
  });

  galleryDialogEl.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveGallery(-1, "keyboard");
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveGallery(1, "keyboard");
    }
  });

  galleryDialogImageEl.addEventListener("touchstart", (event) => {
    galleryTouchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  galleryDialogImageEl.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - galleryTouchStartX;

    if (Math.abs(distance) > 45) {
      moveGallery(distance > 0 ? -1 : 1, "swipe");
    }
  }, { passive: true });
}

function openGalleryImage(index) {
  selectedGalleryIndex = index;
  renderGalleryDialogImage();
  trackEvent("open_gallery", getGalleryEventProperties("thumbnail"));

  if (typeof galleryDialogEl.showModal === "function") {
    galleryDialogEl.showModal();
  }
}

function moveGallery(direction, method = "button") {
  selectedGalleryIndex = (selectedGalleryIndex + direction + galleryImages.length) % galleryImages.length;
  renderGalleryDialogImage();
  trackEvent("gallery_navigated", {
    ...getGalleryEventProperties(method),
    direction: direction > 0 ? "next" : "previous"
  });
}

function renderGalleryDialogImage() {
  const image = galleryImages[selectedGalleryIndex];
  const caption = `Choir photo ${selectedGalleryIndex + 1} of ${galleryImages.length}`;

  galleryDialogImageEl.src = image.src;
  galleryDialogImageEl.alt = image.alt;
  galleryDialogCaptionEl.textContent = caption;
}

function getGalleryEventProperties(method) {
  const image = galleryImages[selectedGalleryIndex];

  return {
    method,
    image_index: selectedGalleryIndex,
    image_number: selectedGalleryIndex + 1,
    image_src: image.src,
    image_alt: image.alt
  };
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

  trackEvent("play_practice_video", {
    video_id: videoId,
    video_title: title,
    plan_date: selectedPlan.date,
    plan_title: selectedPlan.title
  });

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

function setupGlobalAnalytics() {
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const target = event.target;
    const pdfLink = target.closest(".pdf-links a");
    const footerLink = target.closest(".site-footer a");
    const currentSundayLink = target.closest('a[href="#current-sunday"]');
    const videosLink = target.closest('a[href="#practice-videos"]');
    const galleryLink = target.closest('a[href="#gallery"]');
    const calendarLink = target.closest('a[href="#calendar"]');

    if (pdfLink) {
      trackEvent("download_pdf_packet", {
        label: pdfLink.textContent.trim(),
        url: pdfLink.href,
        plan_date: selectedPlan.date,
        plan_title: selectedPlan.title
      });
    }

    if (footerLink) {
      trackEvent("church_link_clicked", {
        url: footerLink.href
      });
    }

    if (currentSundayLink) {
      if (currentSundayLink.classList.contains("primary")) {
        trackEvent("view_current_sunday", {
          source: "hero"
        });
      } else {
        trackEvent("open_songs", {
          source: currentSundayLink.classList.contains("skip-link") ? "skip_link" : "navigation"
        });
      }
    }

    if (videosLink) {
      trackEvent("open_videos", {
        source: videosLink.classList.contains("secondary") ? "hero" : "navigation"
      });
    }

    if (galleryLink) {
      trackEvent("open_gallery", {
        source: "navigation"
      });
    }

    if (calendarLink) {
      trackEvent("open_calendar", {
        source: "navigation"
      });
    }
  });

  observeOnce("#practice-videos", "practice_videos_viewed");
  observeOnce("#gallery", "gallery_viewed", { total_gallery_images: galleryImages.length });
  observeOnce("#calendar", "calendar_viewed");
}

function observeOnce(selector, eventName, properties = {}) {
  const element = document.querySelector(selector);

  if (!element || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      trackEvent(eventName, properties);
      observer.disconnect();
    }
  }, { threshold: 0.35 });

  observer.observe(element);
}

function trackEvent(eventName, properties = {}) {
  if (!isProductionHost || !window.posthog || typeof window.posthog.capture !== "function") {
    return;
  }

  window.posthog.capture(eventName, {
    site: "voicesofstgen",
    current_plan_date: selectedPlan?.date,
    current_plan_title: selectedPlan?.title,
    returning_visitor: isReturningVisitor,
    ...properties
  });
}

function getReturningVisitorStatus() {
  const storageKey = "voicesofstgen_seen";

  try {
    const hasVisited = window.localStorage.getItem(storageKey) === "true";
    window.localStorage.setItem(storageKey, "true");
    return hasVisited;
  } catch {
    return false;
  }
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateString}T12:00:00`));
}

function getCurrentSundayDateString(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date).reduce((all, part) => ({ ...all, [part.type]: part.value }), {});
  const weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayIndex = weekdays[parts.weekday];
  const currentDay = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));

  return new Date(currentDay - dayIndex * 86400000).toISOString().slice(0, 10);
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
