/* ============================================================
   MysticDo Tarot Arcana — 22 Major Arcana data
   Used by /tools/daily-card.html via main.js initDailyCard().
   Each card: { n (roman), name, glyph (SVG path d), prompt }
   ============================================================ */
window.MYSTICDO_ARCANA = [
  { n: '0', name: 'The Fool', glyph: 'M30 8 L52 26 L30 44 L8 26 Z', prompt: "What would you start today if you didn't need a plan? The Fool isn't recklessness \u2014 it's the willingness to begin without certainty." },
  { n: 'I', name: 'The Magician', glyph: 'M30 8 L30 52 M14 20 L46 40 M46 20 L14 40', prompt: "You have what you need. What's one resource \u2014 internal or external \u2014 you're failing to use right now?" },
  { n: 'II', name: 'The High Priestess', glyph: 'M18 10 L18 50 M30 6 L30 54 M42 10 L42 50', prompt: "There's something you already know but haven't said. What is it?" },
  { n: 'III', name: 'The Empress', glyph: 'M30 12 C18 12 18 30 30 30 C42 30 42 12 30 12 M30 30 C18 30 18 48 30 48 C42 48 42 30 30 30', prompt: "What in your life right now is asking to be nurtured rather than pushed?" },
  { n: 'IV', name: 'The Emperor', glyph: 'M14 12 L14 50 M46 12 L46 50 M14 12 L46 12 M14 30 L46 30', prompt: "Where are you abdicating responsibility that's actually yours? Structure isn't the enemy of freedom \u2014 it's the prerequisite." },
  { n: 'V', name: 'The Hierophant', glyph: 'M18 50 L18 24 L30 12 L42 24 L42 50 M22 36 L38 36', prompt: "Whose tradition are you following without examining it? Conformity is cheap when it's unchosen." },
  { n: 'VI', name: 'The Lovers', glyph: 'M30 12 L40 6 L46 18 L40 30 L30 24 L20 30 L14 18 L20 6 Z', prompt: "What choice are you avoiding by calling it a feeling? Love is also a decision, repeatedly made." },
  { n: 'VII', name: 'The Chariot', glyph: 'M14 14 L46 14 L40 30 L20 30 Z M18 30 L14 50 M42 30 L46 50', prompt: "What are two opposing forces in your life that you're treating as mutually exclusive? The Chariot moves when both pull." },
  { n: 'VIII', name: 'Strength', glyph: 'M14 14 L46 14 M14 46 L46 46 M14 14 L14 46 M46 14 L46 46 M24 30 L36 30', prompt: "Where is the soft, patient kind of strength needed right now \u2014 not the loud kind?" },
  { n: 'IX', name: 'The Hermit', glyph: 'M22 8 L22 20 L30 16 L30 54 M22 8 L14 16', prompt: "What would you see if you stopped asking other people what to do for one full day?" },
  { n: 'X', name: 'Wheel of Fortune', glyph: 'M30 6 L54 30 L30 54 L6 30 Z M30 18 L42 30 L30 42 L18 30 Z', prompt: "What feels like bad luck that might actually be a turn of the wheel? Not everything you resist is working against you." },
  { n: 'XI', name: 'Justice', glyph: 'M14 12 L46 12 M14 12 L14 50 M46 12 L46 50 M14 30 L46 30 M22 22 L38 22 M22 38 L38 38', prompt: "What's out of balance that you've been blaming on circumstance? Justice isn't about punishment \u2014 it's about accounts." },
  { n: 'XII', name: 'The Hanged Man', glyph: 'M30 8 L30 40 M20 40 L40 40 M30 40 L24 52 M30 40 L36 52', prompt: "What would change if you saw this situation upside down \u2014 from the other party's view, or from five years out?" },
  { n: 'XIII', name: 'Death', glyph: 'M14 14 L46 14 L40 22 L46 30 L40 38 L46 46 L14 46 L20 38 L14 30 L20 22 Z', prompt: "What is ending in your life that you're refusing to grieve? Death in tarot is transformation, not loss \u2014 but it still asks to be felt." },
  { n: 'XIV', name: 'Temperance', glyph: 'M14 14 L46 46 M14 46 L46 14 M30 8 L34 14 L30 20 L26 14 Z', prompt: "Where are you overcorrecting in one direction? Temperance isn't moderation for its own sake \u2014 it's the right mix." },
  { n: 'XV', name: 'The Devil', glyph: 'M14 14 L46 14 L40 30 L46 46 L14 46 L20 30 Z M22 22 L38 38 M38 22 L22 38', prompt: "What chain have you been calling a choice? The Devil is what you're attached to that costs you freedom." },
  { n: 'XVI', name: 'The Tower', glyph: 'M22 8 L38 8 L42 30 L36 30 L36 54 L24 54 L24 30 L18 30 Z', prompt: "What false structure in your life is already cracking? The Tower is sudden \u2014 but the cracks were there." },
  { n: 'XVII', name: 'The Star', glyph: 'M30 8 L32 22 L46 24 L34 32 L38 46 L30 38 L22 46 L26 32 L14 24 L28 22 Z', prompt: "After the tower, what hope are you refusing to feel because it might hurt? The Star asks you to hope anyway." },
  { n: 'XVIII', name: 'The Moon', glyph: 'M30 8 A22 22 0 1 0 30 52 A16 16 0 1 1 30 8 Z', prompt: "What are you afraid to look at directly? The Moon illuminates what hides in the dark \u2014 including your own evasions." },
  { n: 'XIX', name: 'The Sun', glyph: 'M30 30 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M30 6 L30 12 M54 30 L48 30 M30 54 L30 48 M6 30 L12 30 M14 14 L18 18 M46 14 L42 18 M46 46 L42 42 M14 46 L18 42', prompt: "What's actually good right now that you're minimizing? The Sun is unambiguous joy \u2014 don't talk yourself out of it." },
  { n: 'XX', name: 'Judgement', glyph: 'M14 14 L46 14 M30 14 L30 26 M18 26 L42 26 L42 50 L18 50 Z M24 38 L36 38', prompt: "What calling have you been ignoring? Judgement isn't about being judged \u2014 it's about answering." },
  { n: 'XXI', name: 'The World', glyph: 'M14 14 L46 14 L46 46 L14 46 Z M14 14 C24 24 24 36 14 46 M46 14 C36 24 36 36 46 46 M30 14 L30 46', prompt: "What chapter is closing for you? The World is completion \u2014 and the door it opens is the next beginning." }
];
