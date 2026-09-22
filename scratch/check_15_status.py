with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

slugs = [
  'signs-from-deceased-loved-ones', 'dream-about-deceased-loved-one', 'is-my-loved-one-watching-over-me',
  'why-am-i-always-broke', 'will-i-be-rich', '444-meaning', '333-meaning', '777-meaning', '555-meaning',
  '888-meaning', 'tower-card-meaning', 'lovers-card-meaning', 'tarot-yes-or-no', 'dream-about-being-chased',
  'dream-about-your-ex'
]

for s in slugs:
    idx = src.find(f"'{s}': {{")
    next_idx = src.find("\n  '", idx + 10)
    chunk = src[idx:next_idx]
    has_aha = 'matchAha' in chunk
    has_canTell = 'canTell' in chunk
    print(f"{s:35} | has_matchAha: {has_aha} | has_canTell: {has_canTell}")
