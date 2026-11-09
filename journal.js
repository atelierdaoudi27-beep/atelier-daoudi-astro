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

    // Lead Article
    const lead = articles[0];
    if (lead && leadTitle) {
      if (leadImg) {
        leadImg.src = lead.image;
        leadImg.alt = lead.imageAlt || lead.title;
      }
      if (leadCategory) leadCategory.textContent = lead.category.toUpperCase();
      if (leadTime) leadTime.textContent = `${lead.readingTime || '8 MIN READ'} · 📸 REAL PHOTOGRAPHY & INTERIORS · 📐 ${(lead.drawings || []).length} BLUEPRINTS`;
      if (leadTitle) leadTitle.textContent = lead.title;
      if (leadSummary) leadSummary.textContent = lead.summary;
      if (leadReadBtn) {
        leadReadBtn.onclick = () => openArticle(0);
      }
    }

    // Side Articles
    if (sideContainer && articles.length > 2) {
      const sideArticles = articles.slice(1, 3);
      sideContainer.innerHTML = sideArticles.map((a, idx) => `
        <article class="spotlight-side-card" data-article-index="${idx + 1}">
          <div class="side-card-img-wrap">
            <img src="${esc(a.image)}" alt="${esc(a.imageAlt)}" loading="lazy">
            <span class="side-badge">${esc(a.category.toUpperCase())}</span>
            <span class="side-drawings-pill">📸 Photos &amp; 📐 ${(a.drawings || []).length} Plans</span>
          </div>
          <div class="side-card-body">
            <div class="side-meta">
              <span class="eyebrow">${esc(a.dossierNumber || 'GLOBAL DOSSIER')}</span>
              <span class="side-time">${esc(a.readingTime || '6 min')}</span>
            </div>
            <h3>${esc(a.title)}</h3>
            <p>${esc(a.summary)}</p>
            <button class="side-read-btn" data-article-index="${idx + 1}">
              Read Architectural Dossier ↗
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
      dossierCountDisplay.textContent = `${String(filtered.length).padStart(2, '0')} PEER-INDEXED RESEARCH PAPERS`;
    }

    if (filtered.length === 0) {
      list.innerHTML = `<div class="journal-empty"><p>No articles found in this specialization.</p></div>`;
      if (journalMore) journalMore.hidden = true;
      return;
    }

    list.innerHTML = visible.map((a, i) => {
      const globalIndex = articles.findIndex(x => x.id === a.id);
      const drawingsCount = (a.drawings || []).length;

      return `
        <article class="journal-card" data-topic="${esc(a.topic || '')}">
          <div class="journal-cover-wrap">
            <img class="journal-cover" src="${esc(a.image)}" alt="${esc(a.imageAlt)}" loading="lazy">
            <span class="journal-badge">${esc(a.dossierNumber || 'DOSSIER')}</span>
            <div class="journal-card-media-count">
              <span>📸 Real Photo · 📐 ${drawingsCount} Drawing${drawingsCount > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="journal-card-body">
            <div class="journal-card-meta">
              <span class="eyebrow">${esc(a.category)}</span>
              <span class="journal-time">${esc(a.readingTime || '6 min read')}</span>
            </div>
            <h3>${esc(a.title)}</h3>
            <p class="journal-summary">${esc(a.summary)}</p>
            <div class="journal-card-footer">
              <span class="journal-date">${esc(a.date)}</span>
              <button class="journal-btn" data-global-index="${globalIndex}" aria-label="Explore research paper and drawings: ${esc(a.title)}">
                Read Dossier &amp; Plans <span>↗</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click events
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

    // Render article reader
    articleBody.innerHTML = `
      <!-- Masthead -->
      <div class="article-masthead">
        <div class="article-meta-bar">
          <span class="article-dossier-tag">${esc(a.dossierNumber || 'RESEARCH DOSSIER')}</span>
          <span class="article-category-tag">${esc(a.category)}</span>
          <span class="article-read-time">${esc(a.readingTime || '6 min read')} · PEER REVIEWED</span>
        </div>
        <h2>${esc(a.title)}</h2>
        <div class="article-byline">
          <span>ATELIER DAOUDI ARCHITECTURAL REVIEW &amp; RESEARCH</span>
          <span>PUBLISHED: ${esc(a.date)}</span>
          <span class="article-issn">ISSN ARCH-2026-DZ</span>
        </div>
      </div>

      <!-- Project Specification Fact Sheet (ArchDaily Style) -->
      ${a.specs ? `
        <div class="article-fact-sheet">
          <div class="fact-sheet-title">INTERNATIONAL RESEARCH SPECIFICATION &amp; METHODOLOGY</div>
          <div class="fact-sheet-grid">
            ${Object.entries(a.specs).map(([k, v]) => `
              <div class="fact-item">
                <span class="fact-label">${esc(k)}</span>
                <strong class="fact-value">${esc(v)}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Interactive Tab Bar -->
      <div class="article-tabs" role="tablist">
        <button class="article-tab active" data-tab-target="#tab-narrative">Overview &amp; Analysis</button>
        ${a.gallery && a.gallery.length ? `
          <button class="article-tab" data-tab-target="#tab-gallery">
            Project &amp; Interior Decor (${a.gallery.length})
          </button>
        ` : ''}
        ${a.drawings && a.drawings.length ? `
          <button class="article-tab" data-tab-target="#tab-drawings">
            Architectural Drawings &amp; Diagrams (${a.drawings.length})
          </button>
        ` : ''}
      </div>

      <!-- TAB 1: NARRATIVE & OVERVIEW -->
      <div id="tab-narrative" class="article-tab-panel active">
        ${a.keyTakeaways && a.keyTakeaways.length ? `
          <div class="article-takeaways">
            <div class="takeaways-header">
              <span class="takeaways-icon">◈</span>
              <strong>EXECUTIVE SUMMARY &amp; ARCHITECTURAL PRINCIPLES</strong>
            </div>
            <ul>
              ${a.keyTakeaways.map(t => `<li>${esc(t)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Primary Featured Figure -->
        <figure class="article-diagram-figure">
          <div class="diagram-container">
            <img class="article-diagram-img" id="active-hero-diagram" src="${esc(a.image)}" alt="${esc(a.imageAlt)}">
          </div>
          <figcaption>
            <strong>FIGURE 1.0:</strong> ${esc(a.imageCredit)}
            <br><small>${esc(a.imageAlt)}</small>
          </figcaption>
        </figure>

        <!-- Article Prose Paragraphs -->
        <div class="article-prose">
          ${a.paragraphs.map((p, idx) => `
            <p class="${idx === 0 ? 'lead-paragraph' : ''}">${esc(p)}</p>
          `).join('')}
        </div>

        <!-- Featured Interior Decor & Architecture Gallery -->
        ${a.gallery && a.gallery.length ? `
          <div class="article-featured-gallery">
            <div class="takeaways-header" style="margin-top:35px;margin-bottom:15px">
              <span class="takeaways-icon">📸</span>
              <strong>BUILT ARCHITECTURE &amp; INTERIOR DECOR SPACES</strong>
            </div>
            <div class="article-gallery-grid">
              ${a.gallery.map(g => `
                <figure class="gallery-photo-item">
                  <img src="${esc(g.url)}" alt="${esc(g.title || '')}" loading="lazy">
                  <figcaption>
                    <strong>${esc(g.title || '')}</strong>
                    <br><small>${esc(g.caption || '')}</small>
                  </figcaption>
                </figure>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${a.practiceImplications ? `
          <div class="article-practice-box">
            <div class="practice-header">
              <strong>IMPLICATIONS FOR ARCHITECTURAL PRACTICE &amp; EXECUTION</strong>
            </div>
            <p>${esc(a.practiceImplications)}</p>
          </div>
        ` : ''}
      </div>

      <!-- TAB: PROJECT & INTERIOR DECOR GALLERY -->
      ${a.gallery && a.gallery.length ? `
        <div id="tab-gallery" class="article-tab-panel">
          <div class="drawings-section-header">
            <h3>Real Project Photography &amp; Interior Design Gallery</h3>
            <p>Photographic exploration documenting exterior volumes, structural joinery, daylighting ambiance, and refined interior decor.</p>
          </div>
          <div class="article-gallery-grid">
            ${a.gallery.map(g => `
              <figure class="gallery-photo-item">
                <img src="${esc(g.url)}" alt="${esc(g.title || '')}" loading="lazy">
                <figcaption>
                  <strong>${esc(g.title || '')}</strong>
                  <br><small>${esc(g.caption || '')}</small>
                </figcaption>
              </figure>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- TAB 2: ARCHITECTURAL DRAWINGS & PLANS -->
      ${a.drawings && a.drawings.length ? `
        <div id="tab-drawings" class="article-tab-panel">
          <div class="drawings-section-header">
            <h3>Architectural Drawings, Blueprints &amp; Technical Diagrams</h3>
            <p>Explore orthographic projections, environmental sections, and isometric details for this research topic.</p>
          </div>

          <div class="drawings-viewer">
            <div class="active-drawing-frame">
              <img id="viewer-drawing-img" src="${esc(a.drawings[0].url)}" alt="${esc(a.drawings[0].title)}">
              <div class="drawing-caption-overlay" id="viewer-drawing-caption">
                <strong>${esc(a.drawings[0].title)}</strong> — ${esc(a.drawings[0].caption)}
              </div>
            </div>

            <div class="drawings-thumbnails-strip">
              ${a.drawings.map((d, dIdx) => `
                <button class="drawing-thumb-btn ${dIdx === 0 ? 'active' : ''}" data-drawing-index="${dIdx}">
                  <span class="thumb-type">${esc(d.type)}</span>
                  <img src="${esc(d.url)}" alt="${esc(d.title)}">
                  <small>${esc(d.title)}</small>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Sources Block -->
      <div class="article-sources-block">
        <h3>Primary Institutional Citations &amp; Technical Standards</h3>
        <p class="sources-note">Claims and engineering calculations in this dossier are directly referenced from peer-reviewed institutional publications:</p>
        <ul class="sources-list">
          ${a.sources.map(s => `
            <li>
              <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">
                <span class="source-title">${esc(s.title)}</span>
                <span class="source-link">Institutional Reference ↗</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Navigation & Action Bar -->
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

    // Connect Tab Switching
    articleBody.querySelectorAll('.article-tab').forEach(tab => {
      tab.onclick = () => {
        articleBody.querySelectorAll('.article-tab').forEach(t => t.classList.remove('active'));
        articleBody.querySelectorAll('.article-tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = articleBody.querySelector(tab.dataset.tabTarget);
        if (target) target.classList.add('active');
      };
    });

    // Connect Drawings Selector
    if (a.drawings && a.drawings.length) {
      const viewerImg = articleBody.querySelector('#viewer-drawing-img');
      const viewerCaption = articleBody.querySelector('#viewer-drawing-caption');
      articleBody.querySelectorAll('.drawing-thumb-btn').forEach(btn => {
        btn.onclick = () => {
          articleBody.querySelectorAll('.drawing-thumb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const d = a.drawings[parseInt(btn.dataset.drawingIndex, 10)];
          if (d && viewerImg) {
            viewerImg.src = d.url;
            viewerImg.alt = d.title;
            if (viewerCaption) {
              viewerCaption.innerHTML = `<strong>${esc(d.title)}</strong> (${esc(d.type)}) — ${esc(d.caption)}`;
            }
          }
        };
      });
    }

    // Connect Navigation & Actions
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
