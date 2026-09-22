import re
import json

with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's inspect how quiz objects are structured in quizzes.js
# We can find each '<slug>': { ... }
# Let's extract slug and its questions and pattern keys

# Let's write a node script to inspect MYSTICDO_QUIZZES directly using node!
# That is 100% accurate because node executes/evaluates JS objects.
