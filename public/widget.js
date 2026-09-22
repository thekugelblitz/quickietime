(function() {
  const script = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const user = script ? script.getAttribute('data-user') || '' : '';
  const project = script ? script.getAttribute('data-project') || '' : '';
  const theme = script ? script.getAttribute('data-theme') || 'auto' : 'auto';
  const position = script ? script.getAttribute('data-position') || 'bottom-right' : 'bottom-right';

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const container = document.createElement('div');
  container.className = 'qt-widget-container';
  container.setAttribute('role', 'complementary');
  container.setAttribute('aria-label', 'QuickieTime Quote Widget');

  const css = `
    .qt-widget-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      z-index: 999999;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .qt-widget-floating {
      position: fixed;
      ${position.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
      ${position.includes('left') ? 'left: 20px;' : 'right: 20px;'}
      max-width: 380px;
    }
    .qt-widget-card {
      background: ${isDark ? 'rgba(18, 18, 22, 0.85)' : 'rgba(255, 255, 255, 0.9)'};
      color: ${isDark ? '#f4f4f5' : '#18181b'};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
      border-radius: 12px;
      padding: 10px 14px;
      box-shadow: 0 8px 30px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'};
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .qt-widget-text {
      flex: 1;
      font-weight: 500;
      transition: opacity 0.25s ease;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .qt-widget-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: ${isDark ? '#a1a1aa' : '#71717a'};
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: color 0.2s, background 0.2s;
    }
    .qt-widget-btn:hover {
      color: ${isDark ? '#fff' : '#000'};
      background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
    }
    .qt-widget-brand {
      color: #3b82f6;
      text-decoration: none;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      opacity: 0.8;
      display: block;
    }
    .qt-widget-brand:hover {
      opacity: 1;
      text-decoration: underline;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  container.className = 'qt-widget-container qt-widget-floating';
  container.innerHTML = `
    <div class="qt-widget-card">
      <span style="font-size: 16px; user-select: none;">⚡</span>
      <div style="flex: 1; min-width: 0;">
        <div class="qt-widget-text" id="qt-text">Finding something brilliant…</div>
        <a class="qt-widget-brand" href="https://qtai.click" target="_blank" rel="noopener">⚡ QuickieTime</a>
      </div>
      <button class="qt-widget-btn" id="qt-next" title="Next Quickie" aria-label="Next snippet">↻</button>
    </div>
  `;

  document.body.appendChild(container);

  let snippets = [];
  let currentIndex = 0;

  const textEl = container.querySelector('#qt-text');
  const nextBtn = container.querySelector('#qt-next');

  function showSnippet(index) {
    if (!snippets.length) return;
    textEl.style.opacity = '0';
    setTimeout(() => {
      currentIndex = index % snippets.length;
      textEl.textContent = snippets[currentIndex].text;
      textEl.title = snippets[currentIndex].text;
      textEl.style.opacity = '1';
    }, 200);
  }

  const origin = script && script.src ? new URL(script.src).origin : '';
  const apiUrl = (origin || '') + '/api/v1/widget?format=json' + (user ? '&user=' + encodeURIComponent(user) : '') + (project ? '&project=' + encodeURIComponent(project) : '');

  fetch(apiUrl)
    .then(r => r.json())
    .then(data => {
      if (data.allSnippets && data.allSnippets.length) {
        snippets = data.allSnippets;
      } else if (data.snippet) {
        snippets = [data.snippet];
      }
      if (snippets.length) {
        showSnippet(0);
      }
    })
    .catch(() => {
      textEl.textContent = 'Small effort. Better words.';
      textEl.style.opacity = '1';
    });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSnippet(currentIndex + 1);
    });
  }

  // Rotate every 12 seconds if not hovered
  let interval = setInterval(() => {
    if (snippets.length > 1) {
      showSnippet(currentIndex + 1);
    }
  }, 12000);

  container.addEventListener('mouseenter', () => clearInterval(interval));
  container.addEventListener('mouseleave', () => {
    clearInterval(interval);
    interval = setInterval(() => {
      if (snippets.length > 1) {
        showSnippet(currentIndex + 1);
      }
    }, 12000);
  });
})();
