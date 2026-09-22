import re

with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    content = f.read()

slugs = [
  'signs-from-deceased-loved-ones', 'dream-about-deceased-loved-one', 'is-my-loved-one-watching-over-me',
  'why-am-i-always-broke', 'will-i-be-rich', '444-meaning', '333-meaning', '777-meaning', '555-meaning',
  '888-meaning', 'tower-card-meaning', 'lovers-card-meaning', 'tarot-yes-or-no', 'dream-about-being-chased',
  'dream-about-your-ex'
]

upgraded = 0
for s in slugs:
    # find slug definition
    idx = content.find(f"'{s}': {{")
    if idx == -1:
        print(f"Could not find '{s}'")
        continue
    next_idx = content.find("\n  '", idx + 10)
    if next_idx == -1:
        next_idx = len(content)
    chunk = content[idx:next_idx]
    
    # Check if matchAha is already in chunk
    new_chunk = chunk
    if 'matchAha:' not in new_chunk:
        # insert before customResult
        cr_pos = new_chunk.find('customResult:')
        if cr_pos != -1:
            new_chunk = new_chunk[:cr_pos] + "matchAha: window.topicMatchAha,\n\n    " + new_chunk[cr_pos:]

    # Check if resultV2: true is in customResult
    cr_pos = new_chunk.find('customResult:')
    if cr_pos != -1:
        call_pos = new_chunk.find(f"window.mysticdoPatternResult(ctx, '{s}', {{", cr_pos)
        if call_pos != -1:
            brace_pos = call_pos + len(f"window.mysticdoPatternResult(ctx, '{s}', {{")
            new_chunk = new_chunk[:brace_pos] + "\n        resultV2: true," + new_chunk[brace_pos:]
            upgraded += 1
            content = content[:idx] + new_chunk + content[next_idx:]
            print(f"Upgraded {s} to V2")
        else:
            print(f"Could not find mysticdoPatternResult call in {s}")
    else:
        print(f"Could not find customResult in {s}")

with open('assets/js/quizzes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nDone! Upgraded {upgraded} quizzes to V2.")
