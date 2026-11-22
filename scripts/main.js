document.addEventListener("DOMContentLoaded", () => {
  // Scroll progress bar
  const progressBar = document.getElementById("scrollProgress");
  window.addEventListener("scroll", () => {
    if (!progressBar) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }, { passive: true });

  // Mobile nav toggle
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      mainNav.classList.toggle("open");
    });
  }

  // Intersection reveal
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => observer.observe(el));

  // Subtle tilt on hero kinetic frame
  const heroStage = document.getElementById("heroStage");
  const kineticFrame = document.querySelector(".kinetic-frame");
  if (heroStage && kineticFrame) {
    heroStage.addEventListener("mousemove", (e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      kineticFrame.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg)`;
    });
    heroStage.addEventListener("mouseleave", () => {
      kineticFrame.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
    });
  }

  // Home spotlight shape + photo cycler
  const spotlightStage = document.getElementById("spotlightStage");
  const spotlightImg = document.getElementById("spotlightImg");
  const spotlightBadge = document.getElementById("spotlightBadge");
  const spotlightTitle = document.getElementById("spotlightTitle");
  const spotlightDesc = document.getElementById("spotlightDesc");
  const cyclePhotoBtn = document.getElementById("cyclePhotoBtn");
  const shapeChips = document.querySelectorAll(".shape-chip");

  if (spotlightStage && typeof PORTFOLIO_DATA !== "undefined") {
    let idx = 2;
    const renderSpotlight = () => {
      const item = PORTFOLIO_DATA.photos[idx % PORTFOLIO_DATA.photos.length];
      spotlightImg.src = item.file;
      spotlightImg.alt = item.title;
      spotlightBadge.textContent = item.tag;
      spotlightTitle.textContent = item.title;
      spotlightDesc.textContent = item.caption;
    };

    shapeChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        shapeChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        const shape = chip.dataset.shape;
        spotlightStage.classList.remove("shape-arch", "shape-oval", "shape-asymmetric", "shape-diamond-soft");
        spotlightStage.classList.add(`shape-${shape}`);
      });
    });

    if (cyclePhotoBtn) {
      cyclePhotoBtn.addEventListener("click", () => {
        idx = (idx + 1) % PORTFOLIO_DATA.photos.length;
        renderSpotlight();
      });
    }
  }

  // Timeline rendering, filtering & scrubber
  const timelineFeed = document.getElementById("timelineFeed");
  const chapterSlider = document.getElementById("chapterSlider");
  const scrubberReadout = document.getElementById("scrubberReadout");
  const filterButtons = document.querySelectorAll(".filter-btn[data-filter]");

  if (timelineFeed && typeof PORTFOLIO_DATA !== "undefined") {
    let activeFilter = "all";

    const drawTimeline = (highlightIndex = -1) => {
      const filtered = PORTFOLIO_DATA.chapters.filter((ch) =>
        activeFilter === "all" ? true : ch.track === activeFilter
      );
      timelineFeed.innerHTML = filtered.map((ch) => `
        <article class="milestone-row ${ch.index === highlightIndex ? "highlighted" : ""}">
          <div class="milestone-thumb">
            <img src="${ch.photo}" alt="${ch.title}" loading="lazy" />
          </div>
          <div class="milestone-body">
            <span class="mono-tag">${ch.period}</span>
            <h3>${ch.title}</h3>
            <p>${ch.summary}</p>
          </div>
        </article>
      `).join("");
    };

    drawTimeline(0);

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        drawTimeline(chapterSlider ? Number(chapterSlider.value) : -1);
      });
    });

    if (chapterSlider && scrubberReadout) {
      chapterSlider.addEventListener("input", () => {
        const val = Number(chapterSlider.value);
        const ch = PORTFOLIO_DATA.chapters[val];
        if (ch) {
          scrubberReadout.textContent = `Chapter ${val + 1} of ${PORTFOLIO_DATA.chapters.length} — ${ch.title}`;
          drawTimeline(val);
        }
      });
    }
  }

  // Gallery rendering, masks & lightbox
  const sculptedGrid = document.getElementById("sculptedGrid");
  const categoryButtons = document.querySelectorAll("#galleryFilters .filter-btn");
  const maskButtons = document.querySelectorAll("#galleryMasks .mask-btn");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxMask = document.getElementById("lightboxMask");
  const lightboxFile = document.getElementById("lightboxFile");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxBackdrop = document.getElementById("lightboxBackdrop");
  const prevPhotoBtn = document.getElementById("prevPhotoBtn");
  const nextPhotoBtn = document.getElementById("nextPhotoBtn");

  if (sculptedGrid && typeof PORTFOLIO_DATA !== "undefined") {
    let currentCategory = "all";
    let currentMask = "arch";
    let visibleList = [...PORTFOLIO_DATA.photos];
    let modalIdx = 0;

    const renderGallery = () => {
      visibleList = PORTFOLIO_DATA.photos.filter((p) =>
        currentCategory === "all" ? true : p.category === currentCategory
      );
      sculptedGrid.innerHTML = visibleList.map((p, i) => `
        <article class="reel-card" data-idx="${i}">
          <div class="reel-frame shape-${currentMask}">
            <img src="${p.file}" alt="${p.title}" loading="lazy" />
          </div>
          <div class="reel-meta">
            <span class="mono-tag">${p.file} &middot; ${p.tag}</span>
            <h3>${p.title}</h3>
            <p>${p.caption}</p>
          </div>
        </article>
      `).join("");

      sculptedGrid.querySelectorAll(".reel-card").forEach((card) => {
        card.addEventListener("click", () => {
          modalIdx = Number(card.dataset.idx);
          openModal();
        });
      });
    };

    const openModal = () => {
      const item = visibleList[modalIdx];
      if (!item || !lightbox) return;
      lightboxImg.src = item.file;
      lightboxImg.alt = item.title;
      lightboxFile.textContent = `FILE: ${item.file}`;
      lightboxTitle.textContent = item.title;
      lightboxCaption.textContent = item.caption;
      lightboxMask.className = `lightbox-media shape-${currentMask}`;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
      if (!lightbox) return;
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
    };

    categoryButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        categoryButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        renderGallery();
      });
    });

    maskButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        maskButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentMask = btn.dataset.mask;
        renderGallery();
      });
    });

    if (lightboxClose) lightboxClose.addEventListener("click", closeModal);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeModal);
    if (prevPhotoBtn) {
      prevPhotoBtn.addEventListener("click", () => {
        modalIdx = (modalIdx - 1 + visibleList.length) % visibleList.length;
        openModal();
      });
    }
    if (nextPhotoBtn) {
      nextPhotoBtn.addEventListener("click", () => {
        modalIdx = (modalIdx + 1) % visibleList.length;
        openModal();
      });
    }

    renderGallery();
  }

  // Contact note composer
  const noteForm = document.getElementById("noteForm");
  const noteOutput = document.getElementById("noteOutput");
  const copyNoteBtn = document.getElementById("copyNoteBtn");

  if (noteForm && noteOutput) {
    noteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("senderName").value.trim();
      const topic = document.getElementById("senderTopic").value;
      const msg = document.getElementById("senderMessage").value.trim();
      noteOutput.textContent = `Hi Hassan,

I'm ${name} reaching out regarding ${topic}.

${msg}`;
    });
  }

  if (copyNoteBtn && noteOutput) {
    copyNoteBtn.addEventListener("click", () => {
      navigator.clipboard?.writeText(noteOutput.textContent).catch(() => {});
      copyNoteBtn.textContent = "Copied";
      setTimeout(() => { copyNoteBtn.textContent = "Copy Message"; }, 1600);
    });
  }
});
