(()=>{
  let articles = [];
  let currentFilter = 'All';
  let currentIndex = 0;
  let expanded = false;

  const list = document.querySelector('#journal-list');
  const journalDate = document.querySelector('#journal-date');
  const journalMore = document.querySelector('#journal-more');
  const articleDialog = document.querySelector('#article-dialog');
  const articleBody = document.querySelector('#article-body');
  const dossierCountDisplay = document.querySelector('#dossier-count-display');

  // Spotlight elements
  const leadCard = document.querySelector('#lead-story-card');
  const leadImg = document.querySelector('#lead-img');
  const leadCategory = document.querySelector('#lead-category');
  const leadTime = document.querySelector('#lead-time');
  const leadTitle = document.querySelector('#lead-title');
  const leadSummary = document.querySelector('#lead-summary');
  const leadReadBtn = document.querySelector('#lead-read-btn');
  const sideContainer = document.querySelector('#side-stories-container');

  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function getFilteredArticles() {
    if (currentFilter === 'All') return articles;
    return articles.filter(a => a.topic === currentFilter || a.category.toLowerCase().includes(currentFilter.toLowerCase()));
  }

  function renderSpotlight() {
    if (!articles || articles.length === 0) return;

    // Lead Article (First in list or Solar Architecture)
    const lead = articles[0];
    if (lead && leadTitle) {
      if (leadImg) {
        leadImg.src = lead.image;
        leadImg.alt = lead.imageAlt || lead.title;
      }
      if (leadCategory) leadCategory.textContent = lead.category.toUpperCase();
      if (leadTime) leadTime.textContent = `${lead.readingTime || '6 MIN READ'} · IEA PVPS & RESEARCH STANDARDS`;
      if (leadTitle) leadTitle.textContent = lead.title;
      if (leadSummary) leadSummary.textContent = lead.summary;
      if (leadReadBtn) {
        leadReadBtn.onclick = () => openArticle(0);
      }
    }

    // Side Articles (2nd and 3rd in list)
    if (sideContainer && articles.length > 2) {
      const sideArticles = articles.slice(1, 3);
      sideContainer.innerHTML = sideArticles.map((a, idx) => `
        <article class="spotlight-side-card" data-article-index="${idx + 1}">
          <div class="side-card-img-wrap">
            <img src="${esc(a.image)}" alt="${esc(a.imageAlt)}" loading="lazy">
            <span class="side-badge">${esc(a.category.toUpperCase())}</span>
          </div>
          <div class="side-card-body">
            <div class="side-meta">
              <span class="eyebrow">${esc(a.dossierNumber || 'DOSSIER')}</span>
              <span class="side-time">${esc(a.readingTime || '5 min')}</span>
            </div>
            <h3>${esc(a.title)}</h3>
            <p>${esc(a.summary)}</p>
            <button class="side-read-btn" data-article-index="${idx + 1}">
              Read Perspective ↗
            </button>
          </div>
        </article>
      `).join('');

      sideContainer.querySelectorAll('[data-article-index]').forEach(el => {
        el.onclick = (e) => {
          e.stopPropagation();
          const idx = parseInt(el.dataset.articleIndex, 10);
          if (!isNaN(idx)) openArticle(idx);
        };
      });
    }
  }

  function renderGrid() {
    const filtered = getFilteredArticles();
    const visible = expanded ? filtered : filtered.slice(0, 6);

    if (dossierCountDisplay) {
      dossierCountDisplay.textContent = `${String(filtered.length).padStart(2, '0')} PEER-INDEXED PAPERS`;
    }

    if (filtered.length === 0) {
      list.innerHTML = `<div class="journal-empty"><p>No research dossiers found in this specialization.</p></div>`;
      if (journalMore) journalMore.hidden = true;
      return;
    }

    list.innerHTML = visible.map((a, i) => {
      const globalIndex = articles.findIndex(x => x.id === a.id);
      return `
        <article class="journal-card" data-topic="${esc(a.topic || '')}">
          <div class="journal-cover-wrap">
            <img class="journal-cover" src="${esc(a.image)}" alt="${esc(a.imageAlt)}" loading="lazy">
            <span class="journal-badge">${esc(a.dossierNumber || 'RESEARCH DOSSIER')}</span>
          </div>
          <div class="journal-card-body">
            <div class="journal-card-meta">
              <span class="eyebrow">${esc(a.category)}</span>
              <span class="journal-time">${esc(a.readingTime || '5 min read')}</span>
            </div>
            <h3>${esc(a.title)}</h3>
            <p class="journal-summary">${esc(a.summary)}</p>
            <div class="journal-card-footer">
              <span class="journal-date">${esc(a.date)}</span>
              <button class="journal-btn" data-global-index="${globalIndex}" aria-label="Read complete research paper: ${esc(a.title)}">
                Read Research Dossier <span>↗</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click events to grid cards
    list.querySelectorAll('.journal-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.globalIndex, 10);
        if (!isNaN(idx) && idx !== -1) {
          openArticle(idx);
        }
      };
    });

    if (journalMore) {
      journalMore.hidden = filtered.length <= 6;
      journalMore.textContent = expanded ? 'Show initial selection ↑' : `Browse full research archive (${filtered.length} dossiers) ↓`;
    }
  }

  function openArticle(index) {
    currentIndex = index;
    const a = articles[index];
    if (!a) return;

    const prevIndex = (currentIndex - 1 + articles.length) % articles.length;
    const nextIndex = (currentIndex + 1) % articles.length;

    articleBody.innerHTML = `
      <div class="article-masthead">
        <div class="article-meta-bar">
          <span class="article-dossier-tag">${esc(a.dossierNumber || 'RESEARCH DOSSIER')}</span>
          <span class="article-category-tag">${esc(a.category)}</span>
          <span class="article-read-time">${esc(a.readingTime || '6 min read')} · PEER REVIEWED</span>
        </div>
        <h2>${esc(a.title)}</h2>
        <div class="article-byline">
          <span>ATELIER DAOUDI RESEARCH &amp; EDITORIAL</span>
          <span>PUBLISHED: ${esc(a.date)}</span>
          <span class="article-issn">ISSN ARCH-2026-DZ</span>
        </div>
      </div>

      ${a.keyTakeaways && a.keyTakeaways.length ? `
        <div class="article-takeaways">
          <div class="takeaways-header">
            <span class="takeaways-icon">◈</span>
            <strong>EXECUTIVE SUMMARY &amp; ARCHITECTURAL TAKEAWAYS</strong>
          </div>
          <ul>
            ${a.keyTakeaways.map(t => `<li>${esc(t)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <figure class="article-diagram-figure">
        <div class="diagram-container">
          <img class="article-diagram-img" src="${esc(a.image)}" alt="${esc(a.imageAlt)}">
        </div>
        <figcaption>
          <strong>FIGURE 1.0:</strong> ${esc(a.imageCredit)}
          <br><small>${esc(a.imageAlt)}</small>
        </figcaption>
      </figure>

      <div class="article-prose">
        ${a.paragraphs.map((p, idx) => `
          <p class="${idx === 0 ? 'lead-paragraph' : ''}">${esc(p)}</p>
        `).join('')}
      </div>

      ${a.practiceImplications ? `
        <div class="article-practice-box">
          <div class="practice-header">
            <strong>IMPLICATIONS FOR ARCHITECTURAL PRACTICE</strong>
          </div>
          <p>${esc(a.practiceImplications)}</p>
        </div>
      ` : ''}

      <div class="article-sources-block">
        <h3>Primary Institutional Citations &amp; Technical Literature</h3>
        <p class="sources-note">The architectural claims in this dossier are directly anchored in peer-reviewed standards and primary technical documentation from international agencies:</p>
        <ul class="sources-list">
          ${a.sources.map(s => `
            <li>
              <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">
                <span class="source-title">${esc(s.title)}</span>
                <span class="source-link">External Reference ↗</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="article-nav-bar">
        <button id="article-prev-btn" class="nav-article-btn">
          <span>← Previous Dossier</span>
          <small>${esc(articles[prevIndex].title)}</small>
        </button>
        <button id="article-citation-btn" class="action-btn">
          <span>Copy Citation (APA/Harvard)</span>
        </button>
        <button id="article-print-btn" class="action-btn">
          <span>Print / PDF Document</span>
        </button>
        <button id="article-next-btn" class="nav-article-btn">
          <span>Next Dossier →</span>
          <small>${esc(articles[nextIndex].title)}</small>
        </button>
      </div>
    `;

    // Connect nav buttons
    document.querySelector('#article-prev-btn').onclick = () => openArticle(prevIndex);
    document.querySelector('#article-next-btn').onclick = () => openArticle(nextIndex);
    
    document.querySelector('#article-print-btn').onclick = () => {
      window.print();
    };

    document.querySelector('#article-citation-btn').onclick = e => {
      const cite = `Atelier Daoudi. (${a.date.slice(0,4)}). ${a.title}. Atelier Daoudi Architectural Review, Vol. 04. Retrieved from https://atelierdaoudi27.online/`;
      navigator.clipboard.writeText(cite).then(() => {
        e.target.innerText = '✓ Citation Copied';
        setTimeout(() => { e.target.innerText = 'Copy Citation (APA/Harvard)'; }, 2500);
      }).catch(() => {
        alert(cite);
      });
    };

    articleDialog.showModal();
    articleDialog.scrollTop = 0;
  }

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (articleDialog && articleDialog.open) {
      if (e.key === 'ArrowLeft') {
        const prev = (currentIndex - 1 + articles.length) % articles.length;
        openArticle(prev);
      } else if (e.key === 'ArrowRight') {
        const next = (currentIndex + 1) % articles.length;
        openArticle(next);
      }
    }
  });

  // Setup Topic Filters
  function setupFilters() {
    const filterButtons = document.querySelectorAll('.journal-filters [data-topic-filter]');
    filterButtons.forEach(btn => {
      btn.onclick = () => {
        filterButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentFilter = btn.dataset.topicFilter;
        renderGrid();
      };
    });
  }

  if (journalMore) {
    journalMore.onclick = () => {
      expanded = !expanded;
      renderGrid();
    };
  }

  // Fetch journal.json
  fetch('journal.json', { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error('Failed to load journal');
      return r.json();
    })
    .then(data => {
      articles = data.articles || [];
      if (journalDate) {
        journalDate.innerHTML = `<span>EDITORIAL REVIEW · VOL. 04</span> · <span>UPDATED ${esc(data.updatedAt)}</span>`;
      }
      renderSpotlight();
      setupFilters();
      renderGrid();
    })
    .catch(err => {
      console.error(err);
      if (list) {
        list.innerHTML = `<p class="journal-error">The architecture journal is temporarily unavailable. Please reload or check back shortly.</p>`;
      }
    });
})();
