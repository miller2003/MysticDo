# -*- coding: utf-8 -*-
"""Replace the legacy customResult(pKey,rKey,answers){return null;} in the
5 batch-B quizzes with the canonical ctx delegate. Anchor each replacement
on the nearest preceding top-level quiz key so the right slug is used."""
import io, re, sys

P = 'assets/js/quizzes.js'
src = io.open(P, encoding='utf-8').read()
lines = src.split('\n')

LEGACY = {'what-is-my-moon-sign', 'what-is-my-saturn-return', 'am-i-in-the-right-career',
          'dream-about-someone-dying', 'feeling-lost-in-life'}

OLD = ["    customResult: function(pKey, rKey, answers) {",
       "      return null;",
       "    }"]

changed = []
i = 0
while i < len(lines) - 2:
    if lines[i] == OLD[0] and lines[i + 1] == OLD[1] and lines[i + 2] == OLD[2]:
        # walk back to nearest top-level quiz key
        slug = None
        for j in range(i, -1, -1):
            m = re.match(r"^  '([a-z0-9-]+)': \{$", lines[j])
            if m:
                slug = m.group(1)
                break
        if slug not in LEGACY:
            print('REFUSING: block at line %d is inside %r, not in the batch-B set' % (i + 1, slug))
            sys.exit(1)
        lines[i] = "    customResult: function (ctx) {"
        lines[i + 1] = "      window.mysticdoPatternResult(ctx, '%s', { resultV2: true });" % slug
        lines[i + 2] = "    }"
        changed.append((i + 1, slug))
        i += 3
        continue
    i += 1

if len(changed) != 5:
    print('REFUSING: expected 5 replacements, found %d -> %s' % (len(changed), changed))
    sys.exit(1)

io.open(P, 'w', encoding='utf-8', newline='').write('\n'.join(lines))
print('replaced %d legacy customResult blocks:' % len(changed))
for ln, slug in changed:
    print('  line %-6d %s' % (ln, slug))
