document.addEventListener("DOMContentLoaded", () => {
  // Subtle cursor orb
  const orb = document.getElementById("ambientOrb");
  if (orb) {
    window.addEventListener("pointermove", (e) => {
      orb.style.left = `${e.clientX}px`;
      orb.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  // Scroll progress indicator
  const scrollBar = document.getElementById("scrollBar");
  window.addEventListener("scroll", () => {
    if (!scrollBar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    scrollBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }, { passive: true });

  // Mobile menu toggle
  const burgerBtn = document.getElementById("burgerBtn");
  const navLinks = document.getElementById("navLinks");
  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener("click", () => {
      const expanded = burgerBtn.getAttribute("aria-expanded") === "true";
      burgerBtn.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("open");
    });
  }

  // Smooth reveal with instant fallback so content never hides
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("reveal-ready");
          entry.target.classList.add("is-shown");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    revealItems.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.96) {
        el.classList.add("is-shown");
      } else {
        el.classList.add("reveal-ready");
        io.observe(el);
      }
    });

    setTimeout(() => {
      revealItems.forEach((el) => {
        el.classList.remove("reveal-ready");
        el.classList.add("is-shown");
      });
    }, 750);
  } else {
    revealItems.forEach((el) => el.classList.add("is-shown"));
  }

  // Hero full formal photo cycler (n.jpg / z1.jpeg / z.jpg)
  const swapFormalBtn = document.getElementById("swapFormalBtn");
  const heroFormalImg = document.getElementById("heroFormalImg");
  const heroFormalTag = document.getElementById("heroFormalTag");
  if (swapFormalBtn && heroFormalImg && typeof HASSAN_SITE_DATA !== "undefined") {
    let formalIdx = 0;
    swapFormalBtn.addEventListener("click", () => {
      formalIdx = (formalIdx + 1) % HASSAN_SITE_DATA.featuredHero.length;
      const item = HASSAN_SITE_DATA.featuredHero[formalIdx];
      heroFormalImg.src = item.file;
      heroFormalImg.alt = item.note;
      if (heroFormalTag) heroFormalTag.textContent = item.label;
    });
  }

  // Timeline page feed
  const timelineList = document.getElementById("timelineList");
  if (timelineList && typeof HASSAN_SITE_DATA !== "undefined") {
    timelineList.innerHTML = HASSAN_SITE_DATA.timeline.map((step) => `
      <article class="story-row">
        <div class="story-thumb">
          <img src="${step.photo}" alt="${step.title}" loading="lazy" />
        </div>
        <div class="story-copy">
          <span class="kicker-label">${step.period}</span>
          <h3>${step.title}</h3>
          <p>${step.text}</p>
        </div>
      </article>
    `).join("");
  }

  // Achievements page feed
  const achievementsList = document.getElementById("achievementsList");
  if (achievementsList && typeof HASSAN_SITE_DATA !== "undefined") {
    achievementsList.innerHTML = HASSAN_SITE_DATA.achievements.map((item) => `
      <article class="story-row">
        <div class="story-thumb">
          <img src="${item.photo}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="story-copy">
          <span class="kicker-label">${item.badge}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </div>
      </article>
    `).join("");
  }

  // Filterable photo archive + contour morpher + lightbox
  const archiveGrid = document.getElementById("archiveGrid");
  const groupChips = document.querySelectorAll("[data-group]");
  const contourChips = document.querySelectorAll("[data-contour]");
  const modalBox = document.getElementById("modalBox");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalTag = document.getElementById("modalTag");
  const modalCaption = document.getElementById("modalCaption");
  const modalClose = document.getElementById("modalClose");
  const modalDim = document.getElementById("modalDim");
  const modalPrev = document.getElementById("modalPrev");
  const modalNext = document.getElementById("modalNext");

  if (archiveGrid && typeof HASSAN_SITE_DATA !== "undefined") {
    let activeGroup = "all";
    let activeContour = "standard";
    let filteredPhotos = [...HASSAN_SITE_DATA.photos];
    let currentIdx = 0;

    const renderArchive = () => {
      filteredPhotos = activeGroup === "all"
        ? [...HASSAN_SITE_DATA.photos]
        : HASSAN_SITE_DATA.photos.filter((p) => p.group === activeGroup);

      const contourClass = activeContour === "standard" ? "" : `contour-${activeContour}`;

      archiveGrid.innerHTML = filteredPhotos.map((p, idx) => `
        <article class="archive-card" data-index="${idx}">
          <div class="archive-frame ${contourClass}">
            <img src="${p.file}" alt="${p.caption}" loading="lazy" />
          </div>
          <div class="archive-meta">
            <span class="kicker-label">${p.tag}</span>
            <h3>${p.title}</h3>
            <p>${p.caption}</p>
          </div>
        </article>
      `).join("");

      archiveGrid.querySelectorAll(".archive-card").forEach((card) => {
        card.addEventListener("click", () => {
          currentIdx = Number(card.dataset.index);
          openModal();
        });
      });
    };

    const openModal = () => {
      const item = filteredPhotos[currentIdx];
      if (!item || !modalBox) return;
      modalImg.src = item.file;
      modalImg.alt = item.caption;
      modalTag.textContent = item.tag;
      modalTitle.textContent = item.title;
      modalCaption.textContent = item.caption;
      modalBox.classList.add("open");
      modalBox.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
      if (!modalBox) return;
      modalBox.classList.remove("open");
      modalBox.setAttribute("aria-hidden", "true");
    };

    groupChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        groupChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeGroup = chip.dataset.group;
        renderArchive();
      });
    });

    contourChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        contourChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeContour = chip.dataset.contour;
        renderArchive();
      });
    });

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalDim) modalDim.addEventListener("click", closeModal);
    if (modalPrev) {
      modalPrev.addEventListener("click", () => {
        currentIdx = (currentIdx - 1 + filteredPhotos.length) % filteredPhotos.length;
        openModal();
      });
    }
    if (modalNext) {
      modalNext.addEventListener("click", () => {
        currentIdx = (currentIdx + 1) % filteredPhotos.length;
        openModal();
      });
    }

    renderArchive();
  }

  // Contact draft builder
  const contactForm = document.getElementById("contactForm");
  const draftPreview = document.getElementById("draftPreview");
  const copyDraftBtn = document.getElementById("copyDraftBtn");

  if (contactForm && draftPreview) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const sender = document.getElementById("senderInput").value.trim() || "A Visitor";
      const subject = document.getElementById("topicSelect").value;
      const details = document.getElementById("messageInput").value.trim();
      draftPreview.textContent = `To Hassan Nadeem regarding ${subject}

From: ${sender}

${details}`;
    });
  }

  if (copyDraftBtn && draftPreview) {
    copyDraftBtn.addEventListener("click", () => {
      navigator.clipboard?.writeText(draftPreview.textContent).catch(() => {});
      copyDraftBtn.textContent = "Copied";
      setTimeout(() => { copyDraftBtn.textContent = "Copy Note"; }, 1500);
    });
  }
});
