/* ============================================================
   MysticDo shared JS — v0.3 "Apple Edition"
   - Injects header + footer (single source of truth)
   - Dropdown nav, mobile toggle
   - Multi-quiz engine with Apple-grade interactions
   - SVG icon system for quiz options
   - Enhanced result page with layered cards
   - Email capture (localStorage)
   - Daily card (/tools/daily-card.html)
   - Scroll-aware header + iOS safe-area handling
   Pages need: <div id="site-header">, <div id="site-footer">,
   optionally <div id="quiz" data-quiz="general">, plus this script.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- SVG icon library for quiz options ---------- */
  var ICONS = {
    // Relationship / emotions
    love:         '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.5C6 17.5 2 13.5 2 9a5 5 0 0 1 10 0 5 5 0 0 1 10 0c0 4.5-4 8.5-10 12.5z"/></svg>',
    relationship: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 19.5C6 15.5 2 11.5 2 7.5a4 4 0 0 1 7-2.7A4 4 0 0 1 16 5.2a4 4 0 0 1 6 2.3c0 4-4 8-10 12z"/></svg>',
    // Career / direction
    career:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l9-18 9 18"/><path d="M6 15h12"/></svg>',
    direction:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12l10-10 10 10"/></svg>',
    // Money
    money:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 6v2m0 8v2m-3-6h6m-6 0a3 3 0 0 0 0 4h6a3 3 0 0 0 0-4h-6z"/></svg>',
    // Life / spiritual
    life:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    spiritual:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2l2.5 7.5H22l-6 4.4 2.3 7.1L12 17l-6.3 4 2.3-7.1-6-4.4h7.5z"/></svg>',
    // Loss
    loss:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>',
    // Decision
    decision:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6l.01 0M3 12l.01 0M3 18l.01 0"/></svg>',
    // Generic / fallback
    default:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    // Mode
    understand:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    decide:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>',
    both:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="12" r="6"/><circle cx="16" cy="12" r="6"/></svg>',
    // Time
    now:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    year:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    long:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>',
    none:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>',
    // Practice
    psychic:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="6"/><circle cx="12" cy="8" r="2" fill="currentColor" stroke="none"/><path d="M5 21c0-4 3-6 7-6s7 2 7 6"/></svg>',
    tarot:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="12" height="18" rx="2"/><rect x="8" y="6" width="12" height="18" rx="2" fill="var(--bg-elevated)"/><path d="M14 10l1.5 3 3 .4-2.2 2.2.5 3-2.8-1.5-2.8 1.5.5-3-2.2-2.2 3-.4z" fill="currentColor" stroke="none"/></svg>',
    astrology:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
    medium:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 9c0 0 2 1.5 4 1.5S16 9 16 9"/></svg>',
    unknown:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 1 1 4.5 2.6c-.8.5-1.5 1.2-1.5 2.4"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/></svg>',
    // Experience
    new:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    casual:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h12M3 18h8"/></svg>',
    some:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h18"/></svg>',
    experienced:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" fill="rgba(94,92,230,0.12)"/></svg>',
    // Value
    action:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    perspective:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    seen:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    reassurance:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>',
    // Budget
    low:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v2m0 6v2m-2-4h4"/></svg>',
    mid:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9 12h6"/></svg>',
    high:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8m-3-3l3 3 3-3"/></svg>',
    flex:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
    // Quiz-specific
    yes:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    rough:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12h18M12 3v18" stroke-dasharray="2 2"/></svg>',
    no:           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    self:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>',
    timing:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    situation:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>',
    live:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M6 6a9 9 0 0 0 0 12M18 6a9 9 0 0 1 0 12"/></svg>',
    report:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
    app:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>',
    specific:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    vague:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 1 1 4.5 2.6c-.8.5-1.5 1.4-1.5 2.4v1"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/></svg>',
    multi:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="8" r="4"/><circle cx="16" cy="16" r="4"/></svg>',
    person:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7" r="4"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>',
    patterns:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l7.07 7.07M21 3l-7.07 7.07M3 21l7.07-7.07M21 21l-7.07-7.07M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0"/></svg>',
    chat:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    phone:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 20 20 0 0 1-8.7-3.1 20 20 0 0 1-6-6 20 20 0 0 1-3.1-8.7A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 17z"/></svg>',
    video:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
    inperson:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    one:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M10 8h4"/></svg>',
    explore:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2 6.3-6.3 2 2-6.3z"/></svg>',
    pattern:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>',
    use:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    clarity:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v4l3 3"/></svg>',
    single:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M12 10v6M9 13h6"/></svg>',
    small:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="7" width="7" height="10" rx="1.5"/><rect x="10" y="7" width="5" height="10" rx="1.5"/><rect x="17" y="7" width="5" height="10" rx="1.5"/></svg>',
    full:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20M2 14h20M7 4v16M12 4v16M17 4v16"/></svg>',
    who_self:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>',
    reader:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    // Medium-specific
    early:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v10l6 3"/><circle cx="12" cy="12" r="10"/></svg>',
    mid_grief:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12h18M12 3v18" opacity="0.3"/><path d="M12 8v8M8 12h8"/></svg>',
    meaning:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" opacity="0.4"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>',
    evidence:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    presence:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    closure:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" opacity="0.4"/><circle cx="12" cy="12" r="9"/></svg>',
    general:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8.5 14.5s1 2 3.5 2 3.5-2 3.5-2"/><line x1="9" y1="9" x2="9.01" y2="9" stroke-width="3"/><line x1="15" y1="9" x2="15.01" y2="9" stroke-width="3"/></svg>',
    unsure:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 1 1 4.5 2.6c-.8.5-1.5 1.2-1.5 2.4"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/></svg>',
  };

  function getIcon(score) {
    return ICONS[score] || ICONS.default;
  }

  function glyphStar() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z"/></svg>';
  }

  /* ---------- Shared header HTML ---------- */
  var HEADER_HTML = ''
    + '<header class="site-header">'
    + '  <div class="container header-inner">'
    + '    <a href="/" class="brand" aria-label="MysticDo home">'
    + '      <span class="brand-word">MysticDo</span>'
    + '    </a>'
    + '    <nav class="nav" aria-label="Primary">'
    + '      <div class="nav-item has-dropdown">'
    + '        <button class="nav-link" type="button" data-nav="practices">Practices <svg class="nav-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>'
    + '        <div class="nav-dropdown">'
    + '          <a href="/astrology/"><strong>Astrology</strong><span>timing, patterns, natal charts</span></a>'
    + '          <a href="/psychic/"><strong>Psychic readings</strong><span>direct read on a specific question</span></a>'
    + '          <a href="/medium/"><strong>Medium readings</strong><span>connection, closure, loss</span></a>'
    + '          <a href="/tarot/"><strong>Tarot</strong><span>structured reflection, spreads</span></a>'
    + '          <a href="/numerology/" class="is-placeholder"><strong>Numerology</strong><span>coming soon</span></a>'
    + '          <a href="/manifestation/" class="is-placeholder"><strong>Manifestation</strong><span>coming soon</span></a>'
    + '          <a href="/feng-shui/" class="is-placeholder"><strong>Feng Shui &amp; Bazi</strong><span>coming soon</span></a>'
    + '        </div>'
    + '      </div>'
    + '      <div class="nav-item has-dropdown">'
    + '        <button class="nav-link" type="button" data-nav="questions">Questions <svg class="nav-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>'
    + '        <div class="nav-dropdown">'
    + '          <a href="/questions/love-relationships/"><strong>Love &amp; Relationships</strong><span>breakups, ex, uncertainty, new</span></a>'
    + '          <a href="/questions/career-work/"><strong>Career &amp; Work</strong><span>job, move, offer, direction</span></a>'
    + '          <a href="/questions/money-wealth/"><strong>Money &amp; Wealth</strong><span>income, debt, financial decisions</span></a>'
    + '          <a href="/questions/life-direction/"><strong>Life Direction</strong><span>purpose, crossroads, transitions</span></a>'
    + '          <a href="/questions/loss-closure/"><strong>Loss &amp; Closure</strong><span>grief, connection, endings</span></a>'
    + '          <a href="/questions/spiritual-growth/"><strong>Spiritual Growth</strong><span>intuition, patterns, meaning</span></a>'
    + '        </div>'
    + '      </div>'
    + '      <a href="/guides/" class="nav-link" data-nav="guides">Guides</a>'
    + '      <a href="/methodology.html" class="nav-link" data-nav="methodology">Methodology</a>'
    + '      <a href="/about.html" class="nav-link" data-nav="about">About</a>'
    + '    </nav>'
    + '    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">'
    + '      <span></span><span></span><span></span>'
    + '    </button>'
    + '    <a href="/do-what-fits.html" class="btn btn-primary btn-sm nav-cta-header">Do What Fits</a>'
    + '  </div>'
    + '</header>';

  /* ---------- Shared footer HTML ---------- */
  var FOOTER_HTML = ''
    + '<footer class="site-footer">'
    + '  <div class="container">'
    + '    <div class="footer-grid">'
    + '      <div>'
    + '        <div class="footer-brand">'
    + '          <img src="/assets/brand/mysticdo-mark-64.png" width="24" height="24" alt="" loading="lazy" decoding="async"> MysticDo'
    + '        </div>'
    + '        <p class="footer-tag">Match your spiritual needs. Choose what to do next \u2014 before you pay.</p>'
    + '        <div class="tag-list mt-4">'
    + '          <span class="badge badge-ghost">Psychic</span>'
    + '          <span class="badge badge-ghost">Tarot</span>'
    + '          <span class="badge badge-ghost">Astrology</span>'
    + '          <span class="badge badge-ghost">Medium</span>'
    + '          <span class="badge badge-ghost">Numerology</span>'
    + '          <span class="badge badge-ghost">Manifestation</span>'
    + '        </div>'
    + '      </div>'
    + '      <div class="footer-col"><h4>Practices</h4><ul>'
    + '        <li><a href="/astrology/">Astrology</a></li>'
    + '        <li><a href="/psychic/">Psychic</a></li>'
    + '        <li><a href="/tarot/">Tarot</a></li>'
    + '        <li><a href="/medium/">Medium</a></li>'
    + '      </ul></div>'
    + '      <div class="footer-col"><h4>Questions</h4><ul>'
    + '        <li><a href="/questions/love-relationships/">Love &amp; Relationships</a></li>'
    + '        <li><a href="/questions/career-work/">Career &amp; Work</a></li>'
    + '        <li><a href="/questions/money-wealth/">Money &amp; Wealth</a></li>'
    + '        <li><a href="/questions/">All questions</a></li>'
    + '      </ul></div>'
    + '      <div class="footer-col"><h4>Decide</h4><ul>'
    + '        <li><a href="/do-what-fits.html">Do What Fits quiz</a></li>'
    + '        <li><a href="/guides/">Decision guides</a></li>'
    + '        <li><a href="/tools/daily-card.html">Free tools</a></li>'
    + '        <li><a href="/methodology.html">Methodology</a></li>'
    + '        <li><a href="/about.html">About</a></li>'
    + '      </ul></div>'
    + '    </div>'
    + '    <div class="footer-disclosure">'
    + '      <strong style="color:var(--accent-link)">Affiliate disclosure:</strong> Some links on MysticDo are affiliate links, meaning we may earn a commission if you sign up through them, at no extra cost to you. This never affects our ranking or recommendations. Provider recommendations follow a fixed review framework. See <a href="/methodology.html" style="color:var(--accent-link)">methodology</a>.'
    + '    </div>'
    + '    <div class="footer-bottom mt-5">'
    + '      <span>&copy; 2026 MysticDo \u2014 an intent-driven spiritual decision platform.</span>'
    + '      <span>Not professional advice. See <a href="/about.html">disclaimers</a>.</span>'
    + '    </div>'
    + '  </div>'
    + '</footer>';

  /* ---------- Inject layout ---------- */
  function injectLayout() {
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) h.innerHTML = HEADER_HTML;
    if (f) f.innerHTML = FOOTER_HTML;
  }

  /* ---------- Scroll-aware header ---------- */
  function initScrollHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 12) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- iOS-safe page scroll lock ----------
     `overflow:hidden` on <html> is what actually stops the page behind
     an open drawer from scrolling in Safari. The scroll offset is
     captured and restored afterwards so closing the drawer never
     leaves the reader back at the top of the page. */
  var lockedScrollY = 0;
  function setPageScrollLock(lock) {
    var de = document.documentElement;
    if (lock) {
      lockedScrollY = window.scrollY || window.pageYOffset || 0;
      de.classList.add('nav-open');
      document.body.classList.add('nav-open');
    } else {
      if (!de.classList.contains('nav-open')) return;
      de.classList.remove('nav-open');
      document.body.classList.remove('nav-open');
      if (Math.abs((window.scrollY || 0) - lockedScrollY) > 1) {
        var prev = de.style.scrollBehavior;
        de.style.scrollBehavior = 'auto';
        window.scrollTo(0, lockedScrollY);
        de.style.scrollBehavior = prev;
      }
    }
  }

  /* ---------- Nav behavior ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav    = document.querySelector('.nav');
    if (toggle && nav) {
      /* Full-width CTA closing the drawer. It lives inside a wrapper so
         the stylesheet can draw a hairline separator above it. */
      var ctaWrap = document.createElement('div');
      ctaWrap.className = 'nav-cta-mobile';
      var mobileCta = document.createElement('a');
      mobileCta.href = '/do-what-fits.html';
      mobileCta.className = 'btn btn-primary btn-block';
      mobileCta.textContent = 'Do What Fits';
      ctaWrap.appendChild(mobileCta);
      nav.appendChild(ctaWrap);

      toggle.addEventListener('click', function () {
        var open = toggle.classList.toggle('open');
        nav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        if (window.matchMedia('(max-width: 760px)').matches) setPageScrollLock(open);
      });
      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          if (toggle.classList.contains('open')) {
            toggle.classList.remove('open');
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            setPageScrollLock(false);
          }
        });
      });
    }
    // Mobile: click toggles dropdown
    document.querySelectorAll('.nav-item.has-dropdown > .nav-link').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (window.matchMedia('(max-width: 760px)').matches) {
          e.preventDefault();
          var item   = btn.closest('.nav-item');
          var wasOpen = item.classList.contains('dropdown-open');
          document.querySelectorAll('.nav-item.has-dropdown').forEach(function (i) { i.classList.remove('dropdown-open'); });
          if (!wasOpen) item.classList.add('dropdown-open');
        }
      });
    });
    // Placeholder nav items (pages not built yet) must not dead-end into a 404
    document.querySelectorAll('.nav-dropdown a.is-placeholder').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); });
    });
    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item.has-dropdown')) {
        document.querySelectorAll('.nav-item.has-dropdown').forEach(function (i) { i.classList.remove('dropdown-open'); });
      }
    });
  }

  /* ---------- Active nav highlight ---------- */
  function highlightNav() {
    var path = window.location.pathname.replace(/\/+$/, '');
    var seg  = path.split('/').filter(Boolean);
    var top  = seg[0] || 'index';
    var key  = null;
    if      (['psychic','tarot','astrology','medium','numerology','manifestation','feng-shui'].indexOf(top) > -1) key = 'practices';
    else if (top === 'questions')    key = 'questions';
    else if (top === 'guides')       key = 'guides';
    else if (top === 'methodology.html') key = 'methodology';
    else if (top === 'about.html')   key = 'about';
    if (key) {
      document.querySelectorAll('.nav-link[data-nav="' + key + '"]').forEach(function (a) { a.classList.add('active'); });
      var parentLink = document.querySelector('.nav-link[data-nav="' + key + '"]');
      if (parentLink && parentLink.closest('.nav-item')) parentLink.closest('.nav-item').classList.add('is-current');
    }
  }

  /* ---------- Multi-quiz engine (Apple-grade) ---------- */
  function initQuiz() {
    var root = document.getElementById('quiz');
    if (!root || !window.MYSTICDO_QUIZZES) return;
    var key = root.getAttribute('data-quiz') || 'general';
    var Q   = window.MYSTICDO_QUIZZES[key];
    if (!Q) return;

    var answers = {};
    var current = 0;
    var total   = Q.questions.length;
    var lock    = false;

    /* Progress bar */
    function renderProgress() {
      var row = root.querySelector('.quiz-progress-row');
      if (!row) return;
      var bar = row.querySelector('.quiz-progress');
      bar.innerHTML = '';
      for (var i = 0; i < total; i++) {
        var s = document.createElement('span');
        if (i < current)  s.classList.add('filled');
        if (i === current) s.classList.add('active');
        bar.appendChild(s);
      }
      var counter = row.querySelector('.quiz-counter');
      if (counter) counter.textContent = (current + 1) + '\u2009/\u2009' + total;
    }

    /* Build one step */
    function renderStep(idx, dir) {
      var step   = Q.questions[idx];
      var stepEl = root.querySelector('[data-step="' + idx + '"]');
      if (!stepEl) {
        stepEl = document.createElement('div');
        stepEl.className = 'quiz-step';
        stepEl.setAttribute('data-step', idx);
        root.querySelector('.quiz-body').appendChild(stepEl);
      }
      stepEl.classList.remove('leaving', 'back-active');
      if (dir === 'back') stepEl.classList.add('back-active');
      stepEl.classList.add('active');

      /* Build option buttons with SVG icons */
      var opts = step.options.map(function (o, i) {
        var icon = getIcon(o.score);
        return '<button class="quiz-option" data-score="' + o.score + '" data-idx="' + i + '" aria-label="' + o.text + '">'
          + '<span class="opt-icon" aria-hidden="true">' + icon + '</span>'
          + '<span class="opt-text"><strong>' + o.text + '</strong><span>' + o.detail + '</span></span>'
          + '<svg class="opt-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12.5l5 5 10-11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</button>';
      }).join('');

      var backBtn = idx > 0
        ? '<button class="btn btn-ghost btn-sm" data-back aria-label="Go back">'
          + '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M13 4l-6 6 6 6"/></svg>'
          + ' Back</button>'
        : '<span></span>';

      stepEl.innerHTML =
        '<div class="quiz-question">' + step.q + '</div>'
        + (step.hint ? '<div class="quiz-hint">' + step.hint + '</div>' : '')
        + '<div class="quiz-options">' + opts + '</div>'
        + '<div class="quiz-nav">'
        + backBtn
        + '<span class="quiz-nav-hint">' + (idx + 1) + ' of ' + total + '</span>'
        + '</div>';

      /* Bind option clicks */
      stepEl.querySelectorAll('.quiz-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (lock) return;
          lock = true;
          var allOpts = Array.from(stepEl.querySelectorAll('.quiz-option'));
          allOpts.forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          answers[step.id] = btn.getAttribute('data-score');

          /* Haptic feedback */
          if (navigator.vibrate) { try { navigator.vibrate(10); } catch (e) {} }

          /* Dim non-selected after brief moment */
          setTimeout(function () {
            allOpts.forEach(function (b) {
              if (!b.classList.contains('selected')) b.classList.add('dimmed');
            });
          }, 80);

          setTimeout(function () { lock = false; nextStep(idx); }, 360);
        });
      });

      var back = stepEl.querySelector('[data-back]');
      if (back) back.addEventListener('click', function () { if (!lock) goBack(idx); });
    }

    function keepShellInView() {
      // Only scroll UP to reveal quiz if it's hidden behind the sticky header.
      // Never force-scroll DOWN — that's the annoying behavior after each answer.
      var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      var rect = root.getBoundingClientRect();
      if (rect.top < headerH - 4) {
        var targetY = window.scrollY + rect.top - headerH - 4;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    }

    function leaveStep(idx) {
      var el = root.querySelector('[data-step="' + idx + '"]');
      if (!el) return;
      el.classList.remove('active');
      el.classList.add('leaving');
      setTimeout(function () { el.classList.remove('leaving'); }, 220);
    }

    function nextStep(idx) {
      leaveStep(idx);
      if (idx + 1 < total) {
        current = idx + 1;
        renderProgress();
        renderStep(current, 'forward');
      } else {
        renderResult();
      }
      keepShellInView();
    }

    function goBack(idx) {
      if (idx === 0) return;
      leaveStep(idx);
      current = idx - 1;
      renderProgress();
      renderStep(current, 'back');
      keepShellInView();
    }

    /* Result page */
    function renderResult() {
      var resultKey = Q.resolve(answers);
      var r         = Q.results[resultKey];
      var body      = root.querySelector('.quiz-body');

      var primaryHTML   = r.primary   ? primaryCardHTML(r.primary)   : '';
      var secondaryHTML = r.secondary ? secondaryCardHTML(r.secondary) : '';
      var budgetHTML    = r.budget
        ? '<div class="result-tip mt-4"><strong>Typical investment:</strong> ' + escapeHTML(r.budget) + '</div>'
        : '';
      /* Only print the tip when "before" is a human sentence.
         When it is a site path (general quiz), the CTA button
         below already links there — printing the raw path is noise. */
      var tipHTML = (r.before && r.before.charAt(0) !== '/')
        ? '<div class="result-tip mt-3"><strong>Before you pay:</strong> ' + escapeHTML(r.before) + '</div>'
        : '';
      var beforeBtn = r.before
        ? '<a class="btn btn-primary btn-lg" href="' + (r.before.startsWith('/') ? r.before : '/guides/') + '">Read the decision guide &rarr;</a>'
        : '';
      /* If "before" is a full path, use it; otherwise link to guides */
      if (r.before && r.before.startsWith('/guides/')) {
        beforeBtn = '<a class="btn btn-primary btn-lg" href="' + r.before + '">Read the decision guide &rarr;</a>';
      } else if (r.before && r.before.startsWith('/')) {
        beforeBtn = '<a class="btn btn-primary btn-lg" href="' + r.before + '">Explore more &rarr;</a>';
      }

      body.innerHTML =
        '<div class="quiz-result">'
        + '<div class="result-path-badge">' + glyphStar() + ' ' + escapeHTML(r.path) + '</div>'
        + '<h2 style="font-size:clamp(1.7rem,3.5vw,2.2rem);margin-bottom:0.5rem">Your best fit</h2>'
        + '<p class="lead" style="max-width:54ch;margin:0 auto var(--s6)">' + escapeHTML(r.archetype) + '</p>'
        + '<div style="max-width:580px;margin:0 auto">'
        + primaryHTML
        + secondaryHTML
        + budgetHTML
        + tipHTML
        + '</div>'
        + '<div class="divider-mystic mt-6">' + glyphStar() + '</div>'
        + '<div class="text-center mt-4">'
        + '<p class="text-muted mb-5">Before you pay, read the matching decision guide.</p>'
        + beforeBtn
        + '</div>'
        + '<div class="email-capture mt-7" style="text-align:left">'
        + '<h3 style="margin-bottom:0.45rem;font-size:1.6rem">Get a personalized path by email</h3>'
        + '<p style="color:var(--text-muted);margin-bottom:var(--s5);font-size:0.95rem;max-width:42ch">One weekly note tuned to your situation. No spam, unsubscribe anytime.</p>'
        + emailFormHTML()
        + '</div>'
        + '</div>';

      bindEmailForms();
      /* Smooth scroll to result top */
      setTimeout(function () {
        body.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }

    function primaryCardHTML(s) {
      return '<div class="result-primary-card">'
        + '<span class="badge badge-gold" style="margin-bottom:0.75rem">Best fit</span>'
        + '<div style="font-family:var(--font-display);font-size:1.5rem;font-weight:600;color:var(--ink-900);margin-bottom:0.35rem">' + escapeHTML(s.name) + '</div>'
        + '<p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:var(--s4)">' + escapeHTML(s.fit) + '</p>'
        + '<a class="btn btn-outline-gold btn-sm" href="' + s.href + '">Explore this practice &rarr;</a>'
        + '</div>';
    }
    function secondaryCardHTML(s) {
      return '<div class="result-secondary-card">'
        + '<span class="badge badge-violet" style="margin-bottom:0.6rem">Also consider</span>'
        + '<div style="font-weight:600;color:var(--ink-900);margin-bottom:0.25rem">' + escapeHTML(s.name) + '</div>'
        + '<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:var(--s3)">' + escapeHTML(s.fit) + '</p>'
        + '<a style="font-size:0.88rem;color:var(--accent-link);font-weight:600" href="' + s.href + '">Learn more &rarr;</a>'
        + '</div>';
    }

    function escapeHTML(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    /* Init */
    var bodyEl = document.createElement('div');
    bodyEl.className = 'quiz-body';
    root.innerHTML = '<div class="quiz-progress-row"><div class="quiz-progress"></div><span class="quiz-counter"></span></div>';
    root.appendChild(bodyEl);
    renderProgress();
    renderStep(0, 'forward');
  }

  /* ---------- Email capture ---------- */
  function emailFormHTML() {
    return '<form class="email-form" style="display:flex;gap:0.5rem;flex-wrap:wrap">'
      + '<input type="email" class="input" name="email" placeholder="you@example.com" required autocomplete="email" style="flex:1;min-width:200px">'
      + '<button type="submit" class="btn btn-primary">Join MysticDo</button>'
      + '</form>'
      + '<p class="form-note mt-2">Free. Unsubscribe anytime. We never sell your data.</p>';
  }
  function bindEmailForms() {
    document.querySelectorAll('.email-form').forEach(function (form) {
      if (form.dataset.bound) return;
      form.dataset.bound = '1';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var email = (input && input.value || '').trim();
        if (!email) return;
        try {
          var list = JSON.parse(localStorage.getItem('mysticdo_signups') || '[]');
          if (list.indexOf(email) === -1) list.push(email);
          localStorage.setItem('mysticdo_signups', JSON.stringify(list));
        } catch (err) {}
        form.innerHTML =
          '<div class="flex items-center gap-3" style="color:var(--accent-link)">'
          + '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
          + '<strong style="font-size:1.15rem;letter-spacing:-0.01em">You\'re on the list.</strong>'
          + '</div>'
          + '<p class="form-note" style="margin-top:0.6rem">Check your inbox for a welcome note.</p>';
      });
    });
  }

  /* ---------- Daily card ---------- */
  function initDailyCard() {
    var back = document.getElementById('card-back');
    if (!back) return;
    var CARDS = window.MYSTICDO_ARCANA || [];
    if (!CARDS.length) return;
    var area       = document.getElementById('reveal-area');
    var promptBox  = document.getElementById('card-prompt');
    var promptText = document.getElementById('prompt-text');
    var hint       = document.getElementById('pull-hint');
    var again      = document.getElementById('pull-again');

    function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function loadToday() {
      try { var s = JSON.parse(localStorage.getItem('mysticdo_daily_card') || '{}'); if (s.date === todayKey() && CARDS[s.idx]) return s; } catch (e) {}
      return null;
    }
    function saveToday(idx) { try { localStorage.setItem('mysticdo_daily_card', JSON.stringify({ date: todayKey(), idx: idx })); } catch (e) {} }
    function renderCard(card, animate) {
      var el = document.createElement('div');
      el.className = 'tarot-card';
      if (animate) el.classList.add('flipping');
      el.innerHTML =
        '<div class="card-frame"><div class="roman">' + card.n + '</div>'
        + '<div class="card-glyph"><svg viewBox="0 0 60 60" fill="none"><path d="' + card.glyph + '" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></div>'
        + '<div class="card-name">' + card.name + '</div><div class="card-suit">Major Arcana</div></div>';
      area.innerHTML = ''; area.appendChild(el);
      if (animate) setTimeout(function () { el.classList.remove('flipping'); }, 50);
      promptText.textContent = card.prompt;
      promptBox.classList.remove('hidden');
      hint.textContent = "Today\u2019s card. Come back tomorrow for a new one, or pull again to explore.";
      again.classList.remove('hidden');
    }
    function pull(animate) {
      var existing = loadToday();
      var idx = (existing && !animate) ? existing.idx : Math.floor(Math.random() * CARDS.length);
      if (!existing || animate) saveToday(idx);
      renderCard(CARDS[idx], animate);
    }
    back.addEventListener('click', function () { pull(true); });
    back.addEventListener('keypress', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pull(true); } });
    if (again) again.addEventListener('click', function () { pull(true); });
    var existing = loadToday();
    if (existing) pull(false);
  }

  /* ---------- iOS form ergonomics ----------
     `type="email"` alone still lets iOS smart-capitalise, autocorrect
     and show the wrong keyboard. These attributes are what keep the
     input sane — applied centrally so no page can get it wrong. */
  function initInputAttrs() {
    document.querySelectorAll('input[type="email"]').forEach(function (inp) {
      inp.setAttribute('autocapitalize', 'off');
      inp.setAttribute('autocorrect', 'off');
      inp.setAttribute('spellcheck', 'false');
      inp.setAttribute('inputmode', 'email');
      if (!inp.getAttribute('autocomplete')) inp.setAttribute('autocomplete', 'email');
    });
    document.querySelectorAll('input[type="tel"]').forEach(function (inp) {
      inp.setAttribute('inputmode', 'tel');
      if (!inp.getAttribute('autocomplete')) inp.setAttribute('autocomplete', 'tel');
    });
    document.querySelectorAll('input[type="text"], input:not([type])').forEach(function (inp) {
      var n = (inp.getAttribute('name') || inp.id || '').toLowerCase();
      if (n.indexOf('name') > -1) inp.setAttribute('autocomplete', inp.getAttribute('autocomplete') || 'name');
    });
    document.querySelectorAll('textarea').forEach(function (t) {
      if (!t.getAttribute('rows')) t.setAttribute('rows', '5');
    });
  }

  /* ---------- WebMCP — expose site tools to browser AI agents ----------
   * Spec: https://webmachinelearning.github.io/webmcp/
   *
   * Why here: WebMCP tools only exist while a page is loaded, and the detector
   * loads the page and looks for tools registered on load — so registration has
   * to happen from the site's own script, not from a lazy widget.
   *
   * Both API generations are supported, because the spec is still moving:
   *   · registerTool(tool, { signal })  — current draft
   *   · provideContext({ tools })       — earlier Chrome EPP
   *
   * The tools mirror the server-side MCP server (worker/_lib/mcp.js) so an agent
   * gets the same answers whether it runs in the browser or over HTTP. Search
   * runs entirely client-side against /assets/data/content-index.json — no
   * network round trip beyond the index itself, and no data leaves the page.
   * ---------------------------------------------------------------- */

  var webmcpIndexPromise = null;

  function loadWebmcpIndex() {
    if (!webmcpIndexPromise) {
      webmcpIndexPromise = fetch('/assets/data/content-index.json', { credentials: 'omit' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }
    return webmcpIndexPromise;
  }

  var WEBMCP_STOPWORDS = {
    a: 1, an: 1, and: 1, are: 1, as: 1, at: 1, be: 1, but: 1, by: 1, can: 1, do: 1,
    does: 1, for: 1, from: 1, get: 1, how: 1, i: 1, if: 1, in: 1, is: 1, it: 1,
    its: 1, me: 1, my: 1, of: 1, on: 1, or: 1, should: 1, so: 1, that: 1, the: 1,
    their: 1, them: 1, then: 1, there: 1, these: 1, they: 1, this: 1, to: 1,
    was: 1, we: 1, what: 1, when: 1, where: 1, which: 1, who: 1, why: 1, will: 1,
    with: 1, you: 1, your: 1
  };

  function webmcpTerms(query) {
    var raw = String(query || '').toLowerCase().match(/[a-z0-9']+/g) || [];
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var t = raw[i];
      if (t.length > 1 && !WEBMCP_STOPWORDS[t] && out.indexOf(t) === -1) out.push(t);
    }
    return out;
  }

  function webmcpCount(haystack, needle) {
    if (!haystack) return 0;
    var n = 0;
    var at = haystack.indexOf(needle);
    while (at !== -1 && n < 5) { n++; at = haystack.indexOf(needle, at + needle.length); }
    return n;
  }

  function webmcpSearch(doc, query, limit) {
    var terms = webmcpTerms(query);
    if (!terms.length) return [];
    var scored = [];

    for (var i = 0; i < doc.pages.length; i++) {
      var page = doc.pages[i];
      var title = String(page.title || '').toLowerCase();
      var h1 = String(page.h1 || '').toLowerCase();
      var desc = String(page.description || '').toLowerCase();
      var heads = (page.headings || []).join(' ').toLowerCase();
      var faq = (page.faqQuestions || []).join(' ').toLowerCase();
      var text = String(page.text || '').toLowerCase();

      var score = 0;
      var matched = 0;
      for (var j = 0; j < terms.length; j++) {
        var term = terms[j];
        var hit = webmcpCount(title, term) * 6 + webmcpCount(h1, term) * 5 +
                  webmcpCount(desc, term) * 4 + webmcpCount(heads, term) * 3 +
                  webmcpCount(faq, term) * 3 + webmcpCount(text, term);
        if (hit > 0) matched++;
        score += hit;
      }
      if (!score) continue;
      score *= 0.4 + 0.6 * (matched / terms.length);
      scored.push({ page: page, score: Math.round(score * 10) / 10 });
    }

    scored.sort(function (a, b) {
      return b.score - a.score || (a.page.url < b.page.url ? -1 : 1);
    });

    return scored.slice(0, limit).map(function (entry) {
      var p = entry.page;
      return {
        url: location.origin + p.url,
        path: p.url,
        title: p.title,
        kind: p.kind,
        description: p.description,
        excerpt: String(p.text || '').slice(0, 400)
      };
    });
  }

  function webmcpResult(text, structured) {
    return { content: [{ type: 'text', text: text }], structuredContent: structured };
  }

  function webmcpJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function buildWebmcpTools() {
    return [
      {
        name: 'search_mysticdo',
        description: 'Search MysticDo for decision guidance on psychic, tarot, astrology and ' +
          'medium readings — costs, comparisons, whether a reader is legit, and which practice ' +
          'fits a situation. Use this before navigating anywhere.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Natural-language query.' },
            limit: { type: 'integer', minimum: 1, maximum: 10, description: 'Max results. Defaults to 5.' }
          },
          required: ['query']
        },
        execute: function (args) {
          args = args || {};
          var query = String(args.query || '').trim();
          if (!query) return { error: 'The `query` argument is required.' };
          return loadWebmcpIndex().then(function (doc) {
            if (!doc) return { error: 'The MysticDo content index could not be loaded.' };
            var limit = Math.min(Math.max(parseInt(args.limit, 10) || 5, 1), 10);
            var results = webmcpSearch(doc, query, limit);
            if (!results.length) {
              return webmcpResult('No MysticDo page matched "' + query + '". Browse /llms.txt for the full catalogue.', { query: query, resultCount: 0, results: [] });
            }
            var lines = ['MysticDo results for "' + query + '":', ''];
            results.forEach(function (r, i) {
              lines.push((i + 1) + '. ' + r.title);
              lines.push('   ' + r.url);
              if (r.description) lines.push('   ' + r.description);
              lines.push('');
            });
            return webmcpResult(lines.join('\n').trim(), { query: query, resultCount: results.length, results: results });
          });
        }
      },
      {
        name: 'open_mysticdo_page',
        description: 'Navigate the current tab to a MysticDo page. Only paths that exist in the ' +
          'site index are accepted, so this cannot be used to leave the site.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Site-relative path, e.g. "/guides/psychic-vs-tarot.html".' }
          },
          required: ['path']
        },
        execute: function (args) {
          args = args || {};
          var raw = String(args.path || '').trim();
          if (!raw) return { error: 'The `path` argument is required.' };
          var normalized = raw.indexOf('http') === 0 ? raw.replace(location.origin, '') : raw;
          if (normalized.charAt(0) !== '/') normalized = '/' + normalized;
          if (normalized.indexOf('..') !== -1) return { error: 'Invalid path.' };

          return loadWebmcpIndex().then(function (doc) {
            if (!doc) return { error: 'The MysticDo content index could not be loaded.' };
            var known = doc.pages.some(function (p) { return p.url === normalized; });
            var isRoot = normalized === '/' && doc.pages.some(function (p) { return p.url === '/'; });
            if (!known && !isRoot) {
              return { error: 'No MysticDo page at ' + normalized + '. Use search_mysticdo to find one.' };
            }
            location.assign(normalized);
            return webmcpResult('Navigating to ' + normalized, { navigatedTo: location.origin + normalized });
          });
        }
      },
      {
        name: 'start_need_matcher',
        description: 'Open MysticDo\'s 7-question matcher, which maps a described spiritual need to ' +
          'the practice that fits it. The best first step when the user is unsure which kind of ' +
          'reading to book.',
        inputSchema: { type: 'object', properties: {} },
        execute: function () {
          location.assign('/do-what-fits.html');
          return webmcpResult('Opening the Do What Fits matcher.', { navigatedTo: location.origin + '/do-what-fits.html' });
        }
      },
      {
        name: 'get_current_page_summary',
        description: 'Return the title, URL, meta description and opening text of the page the user ' +
          'is currently viewing, so the agent can reason about on-screen context without scraping DOM.',
        inputSchema: { type: 'object', properties: {} },
        execute: function () {
          function meta(name) {
            var el = document.querySelector('meta[name="' + name + '"], meta[property="' + name + '"]');
            return el ? el.getAttribute('content') || '' : '';
          }
          var body = document.querySelector('.direct-answer, .article-body, main, .container');
          var opening = body ? String(body.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 600) : '';
          var summary = {
            url: location.href,
            title: document.title,
            description: meta('description'),
            h1: (document.querySelector('h1') || {}).textContent || '',
            opening: opening
          };
          return webmcpResult(webmcpJson(summary), summary);
        }
      }
    ];
  }

  function initWebMcp() {
    try {
      var nav = typeof navigator !== 'undefined' ? navigator : null;
      if (!nav || !nav.modelContext) return;

      var mc = nav.modelContext;
      var tools = buildWebmcpTools();
      var controller = typeof AbortController === 'function' ? new AbortController() : null;
      var registered = 0;

      if (typeof mc.registerTool === 'function') {
        for (var i = 0; i < tools.length; i++) {
          try {
            if (controller) mc.registerTool(tools[i], { signal: controller.signal });
            else mc.registerTool(tools[i]);
            registered++;
          } catch (err) {
            /* One rejected tool must not stop the others. */
          }
        }
      } else if (typeof mc.provideContext === 'function') {
        mc.provideContext({ tools: tools });
        registered = tools.length;
      }

      // Exposed so a host can tear the tools down when it navigates away, and so
      // the registration can be asserted from a test.
      window.__mysticdoWebMcp = {
        registered: registered,
        tools: tools.map(function (t) { return t.name; }),
        unregister: function () { if (controller) controller.abort(); }
      };
    } catch (err) {
      /* WebMCP is experimental: a failure here must never break the page. */
    }
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    injectLayout();
    initNav();
    highlightNav();
    initScrollHeader();
    initQuiz();
    initInputAttrs();
    bindEmailForms();
    initDailyCard();
    initWebMcp();
  });
})();
