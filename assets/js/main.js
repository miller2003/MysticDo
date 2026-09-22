/* ============================================================
   MysticDo shared JS — v0.3 "Apple Edition"
   - Injects header + footer (single source of truth)
   - Dropdown nav, mobile toggle
   - Multi-quiz engine with Apple-grade interactions
   - SVG icon system for quiz options
   - Enhanced result page with layered cards
   - Email capture (POST /api/subscribe → MailerLite via Worker)
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
    // Love signal-check (does-he-love-me) — relationship status
    together:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></svg>',
    dating:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19.5C6.5 15.8 3 12.2 3 8.5A4.5 4.5 0 0 1 7.5 4c1.9 0 3.5 1 4.5 2.6A4.5 4.5 0 0 1 16.5 4 4.5 4.5 0 0 1 21 8.5c0 3.7-3.5 7.3-9 11z"/></svg>',
    talking:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    friends:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 21c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M15.5 14.7c.6-.2 1.3-.3 2-.3 2.5 0 4.5 2 4.5 4.6"/></svg>',
    separated:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12H2m0 0l3-3m-3 3l3 3"/><path d="M15 12h7m0 0l-3-3m3 3l-3 3"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>',
    exes:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19.5C6.5 15.8 3 12.2 3 8.5A4.5 4.5 0 0 1 9.5 4L12 6l2.5-2A4.5 4.5 0 0 1 21 8.5c0 3.7-3.5 7.3-9 11z"/><path d="M12 6l-1.5 4L12 14l-1 4.5"/></svg>',
    complicated:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8.5 9.5c-3 0-3 5 0 5s4-5 7-5 3 5 0 5-4-5-7-5z"/></svg>',
    // Love signal-check — what made you wonder
    distant:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h11"/><path d="M15 12l-3-3m3 3l-3 3"/><circle cx="20" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>',
    inconsistent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15l4-6 4 6 5-8 5 8"/></svg>',
    words:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 11h10M4 16h13"/></svg>',
    conflict:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
    stalled:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 5v14M15 5v14"/></svg>',
    changed:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l4-4 4 4M8 17l4 4 4-4"/><path d="M12 3v18"/></svg>',
    // Love signal-check — communication
    consistent:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 12h12"/><circle cx="3" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="21" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>',
    frequent:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 18v-2M10 18v-5M15 18v-8M20 18V5"/></svg>',
    reactive:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v5"/></svg>',
    hotcold:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 4a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 10v5"/></svg>',
    convenient:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    quieter:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>',
    barely:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12h2m3 0h2m3 0h2m3 0h2"/></svg>',
    // Love signal-check — who takes the lead
    him:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7" r="4"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>',
    equal:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 10h14M5 14h14"/></svg>',
    me:           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>',
    variable:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h5l8 10h5"/><path d="M3 17h5l8-10h5"/><path d="M18 4l3 3-3 3"/><path d="M18 14l3 3-3 3"/></svg>',
    rarely:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z"/></svg>',
    hard:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
    // Love signal-check — what happens with space
    notices:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    stays:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7L12 5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19"/></svg>',
    nothing:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M5.5 5.5l13 13"/></svg>',
    worse:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5l14 14"/><path d="M19 12v7h-7"/></svg>',
    returns:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h11a5 5 0 0 1 0 10h-4"/><path d="M8 5L4 9l4 4"/></svg>',
    notell:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
    // Love signal-check — words vs actions
    very:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
    usually:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11"/></svg>',
    sometimes:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>',
    notvery:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
    contradict:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10m0 0l-3-3m3 3l-3 3"/><path d="M17 17H7m0 0l3-3m-3 3l3 3"/></svg>',
    dontknow:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 1 1 4.5 2.6c-.8.5-1.5 1.2-1.5 2.4"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/></svg>',
    // Love signal-check — what you want to know
    feelings:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19.5C6.5 15.8 3 12.2 3 8.5A4.5 4.5 0 0 1 7.5 4c1.9 0 3.5 1 4.5 2.6A4.5 4.5 0 0 1 16.5 4 4.5 4.5 0 0 1 21 8.5c0 3.7-3.5 7.3-9 11z"/></svg>',
    why:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    going:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 21c2.5-5 2.5-13 0-18M19 21c-2.5-5-2.5-13 0-18"/><path d="M12 8v2m0 4v2"/></svg>',
    commit:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><path d="M9 5.5L10.5 3h3L15 5.5 12 9z"/></svg>',
    still:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19.5C6.5 15.8 3 12.2 3 8.5A4.5 4.5 0 0 1 7.5 4c1.9 0 3.5 1 4.5 2.6A4.5 4.5 0 0 1 16.5 4 4.5 4.5 0 0 1 21 8.5c0 3.7-3.5 7.3-9 11z"/><path d="M17 3a4 4 0 0 1 4 4"/><path d="M21 3v4h-4"/></svg>',
    wait:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 21V9"/><path d="M12 9c0-3 3-4 3-7"/><path d="M12 9c0-3-3-4-3-7"/></svg>',
    beneath:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    justclarity:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1.4 1.5 1.6 2.5h4.8c.2-1 .8-1.8 1.6-2.5A6 6 0 0 0 12 3z"/></svg>',
    // Love signal-check — what would help
    interpret:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
    insight:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    heading:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M12 6h5l3 2-3 2h-5"/><path d="M12 12H8l-2 2 2 2h4"/></svg>',
    guidance:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
    deeper:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 19h16"/></svg>',
    // ---- High-intent quiz icons (added 2026-09-21) ----
    married: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l3 4-3 3-3-3z"/><circle cx="12" cy="15" r="5.5"/></svg>',
    longdistance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="12" r="1.8"/><circle cx="19.5" cy="12" r="1.8"/><path d="M7.5 12h9" stroke-dasharray="2 2"/></svg>',
    found: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.5-4.5"/><path d="M8 10.5h5M10.5 8v5"/></svg>',
    heard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4z"/><path d="M9 9.5c0-1.4 1.3-2.3 3-2.3s3 0.9 3 2.3-1.3 2.2-3 2.2" opacity="0.6"/></svg>',
    intuition: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.8-6.5"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></svg>',
    dream: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/><circle cx="16.5" cy="7" r="0.9" fill="currentColor" stroke="none"/></svg>',
    gradual: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-5 4 2 3-5 6-3"/><path d="M3 21h18"/></svg>',
    opened: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.6-1.7"/></svg>',
    guarded: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.2-3 7.2-7 9-4-1.8-7-4.8-7-9V6z"/></svg>',
    hides: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.7 10.7a3 3 0 0 0 4.2 4.2"/><path d="M9.5 5.6A9.4 9.4 0 0 1 12 5.2C18 5.2 22 12 22 12a17 17 0 0 1-2.9 3.5M6.3 6.4A16.8 16.8 0 0 0 2 12s4 6.8 10 6.8a9.6 9.6 0 0 0 2.9-.45"/></svg>',
    steady: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>',
    thinner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 12h7M7 15h4"/></svg>',
    gaps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h3M13 9h4M7 13h2M12 13h5M7 17h4M14 17h3"/></svg>',
    repeated: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h12a4 4 0 0 1 4 4v1"/><path d="M7 6L4 9l3 3"/><path d="M20 15H8a4 4 0 0 1-4-4v-1"/><path d="M17 18l3-3-3-3"/></svg>',
    warm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/></svg>',
    warmrough: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    oversweet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19.5C6.5 15.8 3 12.2 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5c0 3.7-3.5 7.3-9 11z"/><path d="M6 12h3l1.5-2.5L13 15l1.5-3H18"/></svg>',
    unchanged: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9h14M5 15h14"/></svg>',
    relaxed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c-8.5 0-14 5-14 12v4"/><path d="M20 4c0 8-5 12.5-12 12.5"/></svg>',
    attached: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></svg>',
    private: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2"/><rect x="9.6" y="12" width="4.8" height="4" rx="1" fill="currentColor" stroke="none"/></svg>',
    locked: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="9.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/><circle cx="12" cy="15.2" r="1.2" fill="currentColor" stroke="none"/></svg>',
    verify: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/><path d="M8.5 11l1.8 1.8L15 9"/></svg>',
    distance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h6M14 12h6"/><path d="M13 9l-3 3 3 3"/><path d="M11 9l3 3-3 3"/></svg>',
    paranoid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/><path d="M3 3l18 18"/></svg>',
    trust: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l2 3 5-6"/><path d="M12 5h8M12 9h6M12 13h8M12 17h6"/></svg>',
    stayleave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6"/><path d="M12 9l-4 9M12 9l4 9"/></svg>',
    certainly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4.5"/></svg>',
    dynamic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    brokenup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C6.5 16.8 3 13.2 3 9.5A4.5 4.5 0 0 1 9.5 5.2L12 7.5"/><path d="M12 20.5C17.5 16.8 21 13.2 21 9.5A4.5 4.5 0 0 0 14.5 5.2L12 7.5"/><path d="M12 7.5l-1.6 4 3 3-1.4 6"/></svg>',
    nogo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18V6"/><path d="M8 8h9M13 8l3 4-3 4H8"/></svg>',
    onoff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    uncertain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    framework: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    separation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18" stroke-dasharray="2 3"/><path d="M8 12H2m0 0l3-3m-3 3l3 3"/><path d="M16 12h6m0 0l-3-3m3 3l-3 3"/></svg>',
    runner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="5.5" r="2.2"/><path d="M14 8l-3 4.5 3 3V21M14 11l3 1.8 3-1.2M11 12.5L7 15"/></svg>',
    signs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2 5 5 .5-4 3.5 1.5 5L12 13.5 7.5 16 9 11 5 7.5 10 7z"/><path d="M5 20h14"/></svg>',
    pain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z"/><path d="M12 8v4M10 12h4"/></svg>',
    dreams: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/><path d="M3 3l1.5 1.5M2.5 8H5M8 2.5V5"/></svg>',
    helping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19.5C6.5 15.8 3 12.2 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5c0 3.7-3.5 7.3-9 11z"/><path d="M8.5 11.5l2 2 4-4.5"/></svg>',
    mostly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>',
    mixed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="12" r="6"/><circle cx="16" cy="12" r="6"/></svg>',
    waiting: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10M7 21h10"/><path d="M8 3v3.2l4 4 4-4V3M8 21v-3.2l4-4 4 4V21"/></svg>',
    trapped: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><circle cx="12" cy="10" r="2.4"/><path d="M8.5 17c0-2 1.6-3.4 3.5-3.4s3.5 1.4 3.5 3.4"/></svg>',
    rare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    daily: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h14M3 12h10M3 6h18"/><circle cx="19" cy="18" r="2" fill="currentColor" stroke="none"/></svg>',
    constant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 18h18" opacity="0.4"/><path d="M3 12h18" stroke-dasharray="2 2"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>',
    mutual: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/></svg>',
    'mostly-mutual': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="6"/><path d="M12 7a6 6 0 0 1 0 10"/></svg>',
    unclear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 10c0-1.7 1.3-2.8 3-2.8s3 1.1 3 2.6c0 2-3 2-3 4"/><circle cx="12" cy="18" r="0.9" fill="currentColor" stroke="none"/></svg>',
    'one-sided': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="12" r="5"/><path d="M16 12h5m0 0l-2.5-2.5M21 12l-2.5 2.5"/></svg>',
    'runner-chaser': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="6" r="2.2"/><path d="M15 8.5l-3 5 3 3V21M15 11.5l3 1.5M12 13.5L8 16"/><path d="M3 7h4M3 11h3"/></svg>',
    processing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9"/><path d="M15.5 12.5L13 15l-2-2"/></svg>',
    ebbing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8c3 0 3 3 6 3s3-3 6-3 3 3 6 3"/><path d="M3 15c3 0 3 3 6 3s3-3 6-3 3 3 6 3" opacity="0.5"/></svg>',
    flat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
    cycling: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5A8.5 8.5 0 0 1 20 8"/><path d="M20 5v3h-3"/></svg>',
    return: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4-4 4-4"/><path d="M5 10h10a5 5 0 0 1 0 10h-3"/></svg>',
    label: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12.5V5a2 2 0 0 1 2-2h7.5L21 11.5 12.5 20z"/><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none"/></svg>',
    moveon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    'he-ended': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    'i-ended': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    drift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    silence: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    feel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    clean: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    ambiguous: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    cycle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    pulled: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    always: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    first: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    never: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    predict: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="6"/><path d="M9 19h6M10.5 21h3"/><path d="M12 6v4M10 8h4"/></svg>',
    bringback: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4-4 4-4"/><path d="M5 10h10a5 5 0 0 1 0 10h-3"/></svg>',
    cantstop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 8 8"/><circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
    streak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z"/><path d="M12 9v6M9 12h6"/></svg>',
    chaos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h4l3 8h4l3-8h2"/><path d="M4 16h4l2-5"/></svg>',
    breakup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C6.5 16.8 3 13.2 3 9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5c0 3.7-3.5 7.3-9 11z"/><path d="M12 6l-1.3 3.5L12 13l-1 5"/></svg>',
    'reader-told': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 4h-4a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z"/><path d="M12 9v4M12 15h.01"/></svg>',
    'not-sure': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 10c0-1.7 1.3-2.8 3-2.8s3 1.1 3 2.6c0 2-3 2-3 4"/><circle cx="12" cy="18" r="0.9" fill="currentColor" stroke="none"/></svg>',
    breakage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    focused: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>',
    scattered: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="9.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="18.5" cy="5.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="7" cy="14.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="16.5" cy="17" r="1.3" fill="currentColor" stroke="none"/><circle cx="10.5" cy="19" r="1.3" fill="currentColor" stroke="none"/></svg>',
    widespread: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18"/><path d="M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/></svg>',
    accelerating: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17h4M4 12h7M4 7h10"/><path d="M16 17l4-5-4-5"/></svg>',
    everything: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></svg>',
    manageable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14l5-5 4 4 7-7"/><path d="M20 6h-4M20 6v4"/></svg>',
    slipping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l5 5 4-4 7 7"/><path d="M20 18h-4M20 18v-4"/></svg>',
    overwhelmed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 9h8M7 12h10M8.5 15h7"/></svg>',
    'out-of-control': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><path d="M12 7v5l3 2"/></svg>',
    'own-observation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/></svg>',
    'a-friend': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.7-5 6-5M16 6h5M16 10h3"/></svg>',
    online: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></svg>',
    'a-reader': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 4h-4a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z"/><circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/></svg>',
    resolving: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    worsening: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9l5 5 4-3 7 6"/><path d="M20 17h-4M20 17v-4"/></svg>',
    remove: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
    who: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="8.5" r="3.5"/><path d="M4 20c0-3.3 2.7-6 6-6 1.3 0 2.5.4 3.5 1.1"/><path d="M15 17.5a2 2 0 1 0 4 0c0-1.5-2-3-2-3s-2 1.5-2 3z"/></svg>',
    'what-do': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>',
    applied: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13l2 2 4-4"/></svg>',
    interview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 21c0-3.5 2.7-6 6-6s6 2.5 6 6"/></svg>',
    final: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v6a6 6 0 0 1-12 0z"/><path d="M6 5H4v2a3 3 0 0 0 3 3M18 5h2v2a3 3 0 0 1-3 3"/><path d="M9 21h6M12 17v4"/></svg>',
    offered: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13h18M12 9v11"/><path d="M8 9a2.5 2.5 0 0 1 0-5c2 0 4 5 4 5M16 9a2.5 2.5 0 0 0 0-5c-2 0-4 5-4 5"/></svg>',
    rejected: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
    searching: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/><path d="M8.5 11h5M11 8.5v5"/></svg>',
    references: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8a2 2 0 0 1 2 2v14l-5-3-5 3V6a2 2 0 0 1 2-2z"/><path d="M9 9h6M9 12h4"/></svg>',
    referral: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.7-5 6-5M15 7h5m0 0l-2.5-2.5M20 7l-2.5 2.5"/></svg>',
    gut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z"/><path d="M12 8.5v4M10 10.5h4"/></svg>',
    straining: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h3l2-5 3 10 2-5h4"/></svg>',
    consuming: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M18 4l2 2"/></svg>',
    unbearable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/></svg>',
    realistic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M7 12l3-5M17 12l-3 5"/><circle cx="7" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="17" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>',
    'roughly-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l5 5 3-3 8 8"/><path d="M4 16l5-5 3 3" opacity="0.5"/></svg>',
    'too-slow': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/><path d="M2 12h3M19 12h3"/></svg>',
    'lost-track': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/><path d="M12 8v5M12 16h.01"/></svg>',
    'clear-fit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
    'mostly-clear': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" opacity="0.3"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
    "haven't-thought": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    'one-of-several': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="3"/><circle cx="14" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></svg>',
    'important-but-one-of': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="12" r="4"/><circle cx="15" cy="8" r="3" opacity="0.6"/><circle cx="16" cy="16" r="3" opacity="0.6"/></svg>',
    'this-or-bust-somewhat': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><circle cx="12" cy="14" r="4"/><path d="M12 18v3"/></svg>',
    'banking-heavily': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 9l9-5 9 5M8 13v4M12 13v4M16 13v4"/></svg>',
    'all-on-this': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>',
    'how-long': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/><path d="M19 5l2 2-2 2"/></svg>',
    fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3.5V8M12 16v4.5M3.5 12H8M16 12h4.5"/></svg>',
    'what-if': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>',
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
    + '      <a href="/methodology" class="nav-link" data-nav="methodology">Methodology</a>'
    + '      <a href="/about" class="nav-link" data-nav="about">About</a>'
    + '    </nav>'
    + '    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">'
    + '      <span></span><span></span><span></span>'
    + '    </button>'
    + '    <a href="/do-what-fits" class="btn btn-primary btn-sm nav-cta-header">Do What Fits</a>'
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
    + '        <li><a href="/do-what-fits">Do What Fits quiz</a></li>'
    + '        <li><a href="/guides/">Decision guides</a></li>'
    + '        <li><a href="/tools/daily-card">Free tools</a></li>'
    + '        <li><a href="/methodology">Methodology</a></li>'
    + '        <li><a href="/about">About</a></li>'
    + '      </ul></div>'
    + '    </div>'
    + '    <div class="footer-disclosure">'
    + '      <strong style="color:var(--accent-link)">Affiliate disclosure:</strong> As provider reviews publish, some outbound links will be affiliate links \u2014 meaning we may earn a commission if you sign up through them, at no extra cost to you. That never affects what we recommend or how it ranks. No affiliate links exist on MysticDo today. See <a href="/methodology" style="color:var(--accent-link)">methodology</a>.'
    + '    </div>'
    + '    <div class="footer-bottom mt-5">'
    + '      <span>&copy; 2026 MysticDo \u2014 an intent-driven spiritual decision platform.</span>'
    + '      <span>Not professional advice. See <a href="/about">disclaimers</a>.</span>'
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
      /* PC fix: overflow:hidden removes the classic scrollbar and the
         whole page reflows ~17px wider — the visible jump when the quiz
         opens/closes on desktop. Equal padding on body and the sticky
         header holds the layout still while locked. Overlay-scrollbar
         platforms (macOS, mobile) measure 0 and skip this entirely. */
      var sbw = window.innerWidth - de.clientWidth;
      if (sbw > 0) {
        document.body.style.paddingRight = sbw + 'px';
        var hd = document.querySelector('.site-header');
        if (hd) hd.style.paddingRight = sbw + 'px';
      }
      de.classList.add('nav-open');
      document.body.classList.add('nav-open');
    } else {
      document.body.style.paddingRight = '';
      var hd = document.querySelector('.site-header');
      if (hd) hd.style.paddingRight = '';
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
      mobileCta.href = '/do-what-fits';
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
      /* Escape closes the drawer; and leaving the mobile breakpoint
         (window resize / device-emulation toggle) must release the page
         scroll lock — an orphaned html.nav-open freezes scrolling with
         no visible way back, which reads as the whole site hanging. */
      var closeDrawer = function () {
        if (!toggle.classList.contains('open')) return;
        toggle.classList.remove('open');
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        setPageScrollLock(false);
      };
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeDrawer();
      });
      var mqMobile = window.matchMedia('(max-width: 760px)');
      var onMqChange = function (e) { if (!e.matches) closeDrawer(); };
      if (mqMobile.addEventListener) mqMobile.addEventListener('change', onMqChange);
      else if (mqMobile.addListener) mqMobile.addListener(onMqChange);
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
    else if (top === 'methodology') key = 'methodology';
    else if (top === 'about')   key = 'about';
    if (key) {
      document.querySelectorAll('.nav-link[data-nav="' + key + '"]').forEach(function (a) { a.classList.add('active'); });
      var parentLink = document.querySelector('.nav-link[data-nav="' + key + '"]');
      if (parentLink && parentLink.closest('.nav-item')) parentLink.closest('.nav-item').classList.add('is-current');
    }
  }

  /* ---------- Multi-quiz engine (Apple-grade) ----------
     Two hosts:
     - inline (default): the quiz renders inside #quiz on the page
       (standalone /quiz/ pages, Do What Fits).
     - modal (data-quiz-modal on #quiz, used by article question
       pages): the article shows a quiet invitation card; the check
       runs in a full-screen frosted-glass overlay that blurs the page
       behind it. Closing the overlay preserves state — the launcher
       switches Begin → Resume → See your pattern. */
  function initQuiz() {
    var root = document.getElementById('quiz');
    if (!root || !window.MYSTICDO_QUIZZES) return;
    var key = root.getAttribute('data-quiz') || 'general';
    var Q   = window.MYSTICDO_QUIZZES[key];
    if (!Q) return;

    var modalMode = root.hasAttribute('data-quiz-modal');

    var answers = {};
    var current = 0;
    var total   = Q.questions.length;
    var lock    = false;
    var phase   = 'idle';        /* idle | running | done */

    /* ===== Modal scaffolding (built once, on first open) ===== */
    var overlay = null, modalCard = null, modalBody = null;
    var modalOpen = false, lastFocused = null;

    function capture(evt, props) {
      try {
        if (window.posthog && typeof window.posthog.capture === 'function') {
          window.posthog.capture(evt, props);
        }
      } catch (e) {}
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', evt, props || {});
        }
      } catch (e) {}
    }

    function modalSkeleton() {
      overlay = document.createElement('div');
      overlay.className = 'quiz-modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', (Q.title || 'Pattern check') + ' \u2014 MysticDo');
      overlay.innerHTML =
        '<div class="quiz-modal-scrim" data-quiz-close></div>'
        + '<div class="quiz-modal-card" data-phase="questions">'
        +   '<div class="quiz-modal-handle" aria-hidden="true"></div>'
        +   '<div class="quiz-modal-topbar">'
        +     '<span class="quiz-modal-brand">' + glyphStar() + 'Pattern check</span>'
        +     '<button type="button" class="quiz-modal-close" data-quiz-close aria-label="Close the check">'
        +       '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>'
        +     '</button>'
        +   '</div>'
        +   '<div class="quiz-modal-progress">'
        +     '<div class="quiz-progress-row"><div class="quiz-progress"></div><span class="quiz-counter"></span></div>'
        +   '</div>'
        +   '<div class="quiz-body quiz-modal-body"></div>'
        + '</div>';
      document.body.appendChild(overlay);
      modalCard = overlay.querySelector('.quiz-modal-card');
      modalBody = overlay.querySelector('.quiz-modal-body');
      overlay.querySelectorAll('[data-quiz-close]').forEach(function (el) {
        el.addEventListener('click', function () { closeModal(); });
      });
    }

    function getBody() {
      return modalMode ? modalBody : root.querySelector('.quiz-body');
    }
    function getProgressRow() {
      return modalMode
        ? (modalCard ? modalCard.querySelector('.quiz-progress-row') : null)
        : root.querySelector('.quiz-progress-row');
    }
    function setCardPhase(p) {
      if (modalCard) modalCard.setAttribute('data-phase', p);
    }

    function openModal(restart) {
      if (!overlay) modalSkeleton();
      if (modalOpen) { if (restart) startQuiz(); return; }
      modalOpen = true;
      lastFocused = document.activeElement;
      setPageScrollLock(true);
      document.addEventListener('keydown', onModalKey);
      window.addEventListener('popstate', onModalPop);
      try { history.pushState({ quizModal: true }, ''); } catch (e) {}
      overlay.classList.add('preopen');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { overlay.classList.add('open'); });
      });
      if (phase === 'idle' || restart) {
        startQuiz();
        capture('quiz_started', { quiz: key });
      } else if (phase === 'running') {
        setCardPhase('questions');
        renderProgress();
        renderStep(current, 'forward');
      }
      /* phase === 'done': the result is still in modalBody — just reveal it. */
      setTimeout(focusStepQuestion, 140);
    }

    function closeModal(viaPop) {
      if (!modalOpen) return;
      cancelCalculating();
      modalOpen = false;
      overlay.classList.remove('open');
      overlay.classList.add('closing');
      document.removeEventListener('keydown', onModalKey);
      window.removeEventListener('popstate', onModalPop);
      setPageScrollLock(false);
      if (!viaPop && history.state && history.state.quizModal) {
        try { history.back(); } catch (e) {}
      }
      setTimeout(function () {
        overlay.classList.remove('closing', 'preopen');
        if (lastFocused && typeof lastFocused.focus === 'function') {
          try { lastFocused.focus(); } catch (e) {}
        }
      }, 320);
      updateLauncher();
    }
    function onModalPop() { if (modalOpen) closeModal(true); }

    function onModalKey(e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        var focusables = overlay.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        var list = Array.prototype.filter.call(focusables, function (el) {
          return el.offsetParent !== null;
        });
        if (!list.length) return;
        var first = list[0], last = list[list.length - 1];
        var active = document.activeElement;
        if (e.shiftKey && (active === first || !overlay.contains(active))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (active === last || !overlay.contains(active))) {
          e.preventDefault(); first.focus();
        }
        return;
      }
      /* number keys select an option — the quiet power-user path */
      if (phase === 'running' && e.key >= '1' && e.key <= '9') {
        var opts = modalBody.querySelectorAll('.quiz-step.active .quiz-option');
        var target = opts[parseInt(e.key, 10) - 1];
        if (target) { e.preventDefault(); target.click(); }
      }
    }

    function focusStepQuestion() {
      if (!modalBody) return;
      var q = modalBody.querySelector('.quiz-step.active .quiz-question');
      if (q) {
        q.setAttribute('tabindex', '-1');
        try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); }
      } else {
        var close = overlay.querySelector('.quiz-modal-close');
        if (close) close.focus();
      }
    }

    /* ===== Launcher — the invitation card inside the article ===== */
    function updateLauncher() {
      if (!modalMode) return;
      var card = root.querySelector('.quiz-launch');
      if (!card) {
        card = document.createElement('div');
        card.className = 'quiz-launch';
        root.insertBefore(card, root.firstChild);
      }
      var btnText = phase === 'done' ? 'See your pattern'
                  : phase === 'running' ? 'Resume the check'
                  : 'Begin the check';
      card.innerHTML =
        '<span class="quiz-launch-flag">Free &middot; 2 minutes</span>'
        + '<div class="quiz-launch-icon">' + glyphStar() + '</div>'
        + '<h3 class="quiz-launch-title">' + escapeHTML(Q.title || 'Read the pattern') + '</h3>'
        + '<p class="quiz-launch-sub">'
        +   escapeHTML(Q.launchSub || 'Eight questions, about two minutes \u2014 a personalized read of what the pattern suggests, what it doesn\u2019t, and what to watch next.')
        + '</p>'
        + '<div class="quiz-launch-meta">'
        +   '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>About 2 minutes</span>'
        +   '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-3z"/></svg>Private \u2014 stays in your browser</span>'
        +   '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.5l5 5 10-11"/></svg>Free, no signup</span>'
        + '</div>'
        + '<button type="button" class="btn btn-gold btn-lg" data-quiz-begin>' + btnText + ' &rarr;</button>'
        + (phase === 'done'
            ? '<p class="quiz-launch-resume">Want a clean read? <button type="button" data-quiz-retake>Start over</button></p>'
            : '');
      var beginBtn = card.querySelector('[data-quiz-begin]');
      if (beginBtn) beginBtn.addEventListener('click', function () { openModal(); });
      var retakeBtn = card.querySelector('[data-quiz-retake]');
      if (retakeBtn) retakeBtn.addEventListener('click', function () { openModal(true); });
    }

    /* Progress bar */
    function renderProgress() {
      var row = getProgressRow();
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
      var body   = getBody();
      var stepEl = body.querySelector('[data-step="' + idx + '"]');
      if (!stepEl) {
        stepEl = document.createElement('div');
        stepEl.className = 'quiz-step';
        stepEl.setAttribute('data-step', idx);
        body.appendChild(stepEl);
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

      var stageEyebrow = '';
      if (total >= 7) {
        var sNum = idx < 2 ? 1 : (idx < 5 ? 2 : (idx < 7 ? 3 : 4));
        var sTitles = [
          'Stage 1 · Current Dynamic & Setting',
          'Stage 2 · Observable Behavioral Patterns',
          'Stage 3 · Emotional Friction & Tension',
          'Stage 4 · Core Intent & Next Step'
        ];
        stageEyebrow = '<div class="quiz-stage-eyebrow">' + sTitles[sNum - 1] + '</div>';
      }

      stepEl.innerHTML =
        stageEyebrow
        + '<div class="quiz-question">' + step.q + '</div>'
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
      if (modalMode) return;
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
      var el = getBody().querySelector('[data-step="' + idx + '"]');
      if (!el) return;
      el.classList.remove('active');
      el.classList.add('leaving');
      setTimeout(function () { el.classList.remove('leaving'); }, 220);
    }

    /* The "Analyzing your pattern" ceremony runs on timers. They must be
       cancellable: closing the overlay or restarting the check mid-ceremony
       used to leave the old timer alive, so the previous session's result
       was written into the new one and `phase` was corrupted. */
    var calcTimers = [];
    function cancelCalculating() {
      for (var i = 0; i < calcTimers.length; i++) clearTimeout(calcTimers[i]);
      calcTimers = [];
    }

    function showCalculatingCeremony(doneCb) {
      cancelCalculating();
      phase = 'calculating';
      if (modalMode) setCardPhase('calculating');
      var body = getBody();
      body.innerHTML =
        '<div class="quiz-calc-wrap">'
        + '<div class="quiz-calc-orb">'
        +   '<div class="quiz-calc-pulse"></div>'
        +   '<div class="quiz-calc-ring"></div>'
        +   '<div class="quiz-calc-icon">' + glyphStar() + '</div>'
        + '</div>'
        + '<h3 class="quiz-calc-title">Analyzing Your Pattern</h3>'
        + '<p class="quiz-calc-status" id="quiz-calc-status">Aligning situation coordinates &amp; timeline...</p>'
        + '<div class="quiz-calc-bar-track"><div class="quiz-calc-bar" id="quiz-calc-bar"></div></div>'
        + '<div class="quiz-calc-meta"><span id="quiz-calc-pct">28%</span><span>Structured Diagnostic</span></div>'
        + '</div>';

      var statusEl = body.querySelector('#quiz-calc-status');
      var barEl = body.querySelector('#quiz-calc-bar');
      var pctEl = body.querySelector('#quiz-calc-pct');

      var phases = [
        { at: 0, pct: '28%', text: 'Aligning situation coordinates &amp; timeline...' },
        { at: 750, pct: '62%', text: 'Detecting cognitive tension &amp; behavioral gaps...' },
        { at: 1600, pct: '88%', text: 'Synthesizing situation profile &amp; blockage patterns...' },
        { at: 2400, pct: '100%', text: 'Finalizing personalized diagnosis &amp; specialist matching...' }
      ];

      phases.forEach(function (p) {
        calcTimers.push(setTimeout(function () {
          if (statusEl) statusEl.innerHTML = p.text;
          if (barEl) barEl.style.width = p.pct;
          if (pctEl) pctEl.textContent = p.pct;
        }, p.at));
      });

      calcTimers.push(setTimeout(function () {
        calcTimers = [];
        doneCb();
      }, 3000));
    }

    function nextStep(idx) {
      leaveStep(idx);
      if (idx + 1 < total) {
        current = idx + 1;
        renderProgress();
        renderStep(current, 'forward');
        if (modalMode && modalBody) { modalBody.scrollTop = 0; focusStepQuestion(); }
      } else {
        showCalculatingCeremony(function () {
          renderResult();
        });
      }
      keepShellInView();
    }

    function goBack(idx) {
      if (idx === 0) return;
      leaveStep(idx);
      current = idx - 1;
      renderProgress();
      renderStep(current, 'back');
      if (modalMode && modalBody) { modalBody.scrollTop = 0; focusStepQuestion(); }
      keepShellInView();
    }

    /* Result page */
    function renderResult() {
      phase = 'done';
      if (modalMode) setCardPhase('result');
      /* A quiz may define customResult(ctx) to render its own, richer result
         page (used by the love signal-check). ctx carries everything the
         renderer needs, so quiz code never touches engine internals. */
      var body = getBody();
      if (typeof Q.customResult === 'function') {
        /* The custom renderer writes into `body`. Two failure modes must
           never leave the user stranded on the "Analyzing your pattern"
           screen: (1) it throws (a malformed results shape), (2) it
           returns without writing anything (a legacy no-op signature).
           Detect both and show an honest failure state with a way out. */
        var beforeHTML = body.innerHTML;
        var rendered = false;
        try {
          Q.customResult({
            answers: answers,
            body: body,
            emailFormHTML: emailFormHTML,
            bindEmailForms: bindEmailForms,
            restart: startQuiz
          });
          rendered = body.innerHTML !== beforeHTML;
        } catch (err) {
          try {
            if (window.console && console.error) {
              console.error('[quiz] result render failed for "' + key + '"', err);
            }
          } catch (e2) {}
        }
        if (!rendered) {
          body.innerHTML =
            '<div class="quiz-result">'
            + '<div class="love-result-head">'
            + '<div class="result-path-badge">' + glyphStar() + ' Something went wrong</div>'
            + '<h2>We could not build your result page</h2>'
            + '<p class="love-summary">Your answers were not sent anywhere. Start the check again, or read the framework further up this page.</p>'
            + '</div>'
            + '<p class="text-center" style="margin-top:var(--s6)">'
            + '<button type="button" class="btn btn-ghost btn-sm" data-love-retake>Start over</button></p>'
            + '</div>';
          var retakeEl = body.querySelector('[data-love-retake]');
          if (retakeEl) retakeEl.addEventListener('click', function () { startQuiz(); });
        }
        if (modalMode) {
          if (modalBody) modalBody.scrollTop = 0;
        } else {
          setTimeout(function () {
            body.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 60);
        }
        updateLauncher();
        return;
      }
      var resultKey = Q.resolve(answers);
      var r         = Q.results[resultKey];

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
        /* Email capture removed from the result tail (2026-09-20 user
           decision): it interrupted the path from result to the guide /
           practice links — the conversion the site runs on. */
        + '</div>';
      if (modalMode) {
        if (modalBody) modalBody.scrollTop = 0;
      } else {
        /* Smooth scroll to result top */
        setTimeout(function () {
          body.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);
      }
      updateLauncher();
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

    /* Init — extracted so a custom result page can offer a retake */
    function startQuiz() {
      cancelCalculating();
      answers = {};
      current = 0;
      phase = 'running';
      if (modalMode) {
        setCardPhase('questions');
        modalBody.innerHTML = '';
        renderProgress();
        renderStep(0, 'forward');
        modalBody.scrollTop = 0;
      } else {
        root.innerHTML = '<div class="quiz-progress-row"><div class="quiz-progress"></div><span class="quiz-counter"></span></div>';
        var bodyEl = document.createElement('div');
        bodyEl.className = 'quiz-body';
        root.appendChild(bodyEl);
        renderProgress();
        renderStep(0, 'forward');
      }
      updateLauncher();
    }

    if (modalMode) {
      /* High-intent page: the global nav CTAs become this page's own
         check — one gold action with the same meaning as the hero and
         launcher buttons. Runs before the [data-quiz-open] binding
         below so the swapped buttons get wired to the overlay too. */
      var navCta = document.querySelector('.nav-cta-header');
      if (navCta) {
        navCta.className = 'btn btn-gold btn-sm nav-cta-header';
        navCta.setAttribute('href', '#pattern-check');
        navCta.setAttribute('data-quiz-open', '');
        navCta.textContent = 'Begin the check';
      }
      var drawerCta = document.querySelector('.nav-cta-mobile .btn');
      if (drawerCta) {
        drawerCta.className = 'btn btn-gold btn-block';
        drawerCta.setAttribute('href', '#pattern-check');
        drawerCta.setAttribute('data-quiz-open', '');
        drawerCta.textContent = 'Begin the check';
      }
      /* The invitation card replaces the inline quiz; hero CTAs marked
         data-quiz-open jump straight into the overlay. The href anchor
         keeps working as a no-JS fallback. */
      updateLauncher();
      document.querySelectorAll('[data-quiz-open]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          openModal();
        });
      });
      /* Pre-build the overlay while the browser is idle so the first
         open doesn't pay DOM construction + first-blur-init cost in the
         same frame (visible as a hitch on slower desktop GPUs). */
      var warm = window.requestIdleCallback
        || function (f) { setTimeout(f, 1500); };
      warm(function () { if (!overlay) modalSkeleton(); });
    } else {
      startQuiz();
    }
  }

  /* ---------- Email capture ----------
     Delivery model: the form POSTs to /api/subscribe on our own origin; the
     Cloudflare Worker forwards it to MailerLite with a server-side key that
     never reaches the browser. The address is also kept in this browser as a
     silent backup. Only a confirmed upstream signup shows "subscribed" — any
     other outcome shows an honest "didn't go through" state and asks the user
     to retry; it never pretends a failed signup succeeded.
     window.MYSTICDO_EMAIL_ENDPOINT can override the path if ever needed. */
  function submitToEmailEndpoint(payload) {
    if (typeof fetch !== 'function') return Promise.resolve(false);
    var ep = window.MYSTICDO_EMAIL_ENDPOINT || '/api/subscribe';
    return fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (data) { return !!(data && data.ok && data.subscribed !== false); });
  }

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
        submitToEmailEndpoint({ email: email, source: 'email-form' }).then(function (sent) {
          if (!sent) {
            /* Honest failure state: keep the form so the user can retry. */
            form.innerHTML =
              '<div class="flex items-center gap-3" style="color:var(--gold-600)">'
              + '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>'
              + '<strong style="font-size:1.15rem;letter-spacing:-0.01em">That didn\u2019t go through.</strong>'
              + '</div>'
              + '<p class="form-note" style="margin-top:0.6rem">Your signup didn\u2019t reach us \u2014 nothing was sent. Please try again in a moment, or email <a href="mailto:contact@mysticdo.com" style="color:var(--gold-600)">contact@mysticdo.com</a> and we\u2019ll add you manually.</p>';
            return;
          }
          form.innerHTML =
            '<div class="flex items-center gap-3" style="color:var(--accent-link)">'
            + '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
            + '<strong style="font-size:1.15rem;letter-spacing:-0.01em">You\u2019re subscribed.</strong>'
            + '</div>'
            + '<p class="form-note" style="margin-top:0.6rem">Check your inbox for a welcome note.</p>';
        });
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
            path: { type: 'string', description: 'Site-relative path, e.g. "/guides/psychic-vs-tarot".' }
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
          // Published URLs are extension-less; accept legacy ".html" paths too.
          if (normalized.slice(-5) === '.html') normalized = normalized.slice(0, -5);

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
          location.assign('/do-what-fits');
          return webmcpResult('Opening the Do What Fits matcher.', { navigatedTo: location.origin + '/do-what-fits' });
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
