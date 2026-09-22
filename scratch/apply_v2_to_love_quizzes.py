import re

with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. does-he-think-about-me
old_dhtam = """    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-he-think-about-me', {
        negativePatternTip: {
          pattern: 'one-sided',
          text: 'when the reaching is this one-sided, a reading about what he\\u2019s thinking can quietly become a more expensive way of holding the connection together. If you book one, frame it on the dynamic between you \\u2014 not on his mind.'
        }
      });
    }"""

new_dhtam = """    matchAha: function (a, pattern) {
      if (a.want === 'wait') return 'choice_friction';
      if ((a.status === 'exes' || a.status === 'separated') &&
          (a.trigger === 'distant' || a.trigger === 'changed' || a.trigger === 'conflict' || a.want === 'still')) {
        return 'sudden_loss';
      }
      if (pattern === 'one-sided') return 'boundary_invasion';
      if (a.status === 'complicated' && (pattern === 'gap-dependent' || pattern === 'contextually-connected')) {
        return 'toxic_loop';
      }
      if (pattern === 'unclear') return 'illusion_fixation';
      if (a.trigger === 'unknown' && (pattern === 'actively-reaching' || pattern === 'contextually-connected')) {
        return 'scarcity_panic';
      }
      if (a.want === 'beneath' || a.trigger === 'unknown') return 'illusion_fixation';
      return 'scarcity_panic';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-he-think-about-me', {
        resultV2: true,
        canTell: [
          'Which kind of mental presence is observable across gaps \\u2014 unprompted recall, reactive warmth, or one-sided effort',
          'Whether your uncertainty is driven by changed behavior or your own internal attachment loop',
          'Which type of guidance actually resolves what you are carrying'
        ],
        edgeBridge: 'A quiz can organize your observations \\u2014 it can\\u2019t determine what another person privately thinks when they are alone at night. That takes either direct conversation, or a deeper reading focused on your specific situation.',
        ctaText: {
          'feelings:psychic': 'Get personal insight into his feelings',
          'why:psychic': 'Get insight into what changed',
          'still:closure': 'Get a reading focused on closure',
          'wait:tarot_decision': 'Get guidance on your next step',
          'going:tarot_relationship': 'Get a reading on where this is heading',
          'beneath:tarot_deep': 'Get a deeper read on the connection',
          '*:psychic': 'Get a reading for this question',
          '*:tarot_relationship': 'Get a reading on where this is heading',
          '*:tarot_decision': 'Get guidance on your next step',
          '*:tarot_deep': 'Get a deeper read on the connection',
          '*:closure': 'Get a reading focused on closure'
        },
        negativePatternTip: {
          pattern: 'one-sided',
          text: 'when the reaching is this one-sided, a reading about what he\\u2019s thinking can quietly become a more expensive way of holding the connection together. If you book one, frame it on the dynamic between you \\u2014 not on his mind.'
        }
      });
    }"""

# 2. does-my-crush-like-me-back
old_crush = """    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-my-crush-like-me-back', {
        negativePatternTip: {
          pattern: 'unclear-direction',
          text: 'when signals are this conflicting, a reading about whether he likes you can quietly become a more expensive way of staying in the uncertainty. If you book one, frame it on your own clarity \\u2014 not on his feelings.'
        }
      });
    }"""

new_crush = """    matchAha: function (a, pattern) {
      if (a.want === 'wait') return 'choice_friction';
      if ((a.status === 'exes' || a.status === 'separated') &&
          (a.trigger === 'distant' || a.trigger === 'changed' || a.trigger === 'conflict' || a.want === 'still')) {
        return 'sudden_loss';
      }
      if (pattern === 'friendly-no-direction') return 'boundary_invasion';
      if (a.status === 'complicated') return 'toxic_loop';
      if (pattern === 'not-enough-data') return 'illusion_fixation';
      if (a.trigger === 'unknown' && (pattern === 'clear-mutual' || pattern === 'promising-unconfirmed')) {
        return 'scarcity_panic';
      }
      if (a.want === 'beneath' || a.trigger === 'unknown') return 'illusion_fixation';
      return 'scarcity_panic';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-my-crush-like-me-back', {
        resultV2: true,
        canTell: [
          'Whether the early signals show genuine mutual curiosity or merely polite responsiveness',
          'Which pattern of initiative is shaping the connection right now',
          'Which practical move tests interest without risking unnecessary vulnerability'
        ],
        edgeBridge: 'A quiz can map the signals visible so far \\u2014 it can\\u2019t verify what he feels behind his guard. That part takes a real-world opening, or an outside perspective on his side of the dynamic.',
        ctaText: {
          'feelings:psychic': 'Get personal insight into his feelings',
          'why:psychic': 'Get insight into what changed',
          'still:closure': 'Get a reading focused on closure',
          'wait:tarot_decision': 'Get guidance on your next step',
          'going:tarot_relationship': 'Get a reading on where this is heading',
          'beneath:tarot_deep': 'Get a deeper read on the connection',
          '*:psychic': 'Get a reading for this question',
          '*:tarot_relationship': 'Get a reading on where this is heading',
          '*:tarot_decision': 'Get guidance on your next step',
          '*:tarot_deep': 'Get a deeper read on the connection',
          '*:closure': 'Get a reading focused on closure'
        },
        negativePatternTip: {
          pattern: 'unclear-direction',
          text: 'when signals are this conflicting, a reading about whether he likes you can quietly become a more expensive way of staying in the uncertainty. If you book one, frame it on your own clarity \\u2014 not on his feelings.'
        }
      });
    }"""

# 3. is-he-the-one
old_theone = """    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'is-he-the-one', {
        negativePatternTip: {
          pattern: 'identity-hesitation',
          text: 'when the hesitation runs this deep, a reading about whether he\\u2019s \\u201Cthe one\\u201D can quietly become a way of outsourcing a decision that belongs to you. If you book one, frame it on your own clarity \\u2014 not on a verdict about him.'
        }
      });
    }"""

new_theone = """    matchAha: function (a, pattern) {
      if (a.want === 'wait') return 'choice_friction';
      if ((a.status === 'exes' || a.status === 'separated') &&
          (a.trigger === 'distant' || a.trigger === 'changed' || a.trigger === 'conflict' || a.want === 'still')) {
        return 'sudden_loss';
      }
      if (pattern === 'identity-hesitation') return 'identity_crisis';
      if (a.status === 'complicated') return 'toxic_loop';
      if (pattern === 'not-enough-evidence') return 'illusion_fixation';
      if (a.trigger === 'unknown' && (pattern === 'strong-foundation' || pattern === 'genuine-open-questions')) {
        return 'scarcity_panic';
      }
      if (a.want === 'beneath' || a.trigger === 'unknown') return 'illusion_fixation';
      return 'scarcity_panic';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'is-he-the-one', {
        resultV2: true,
        canTell: [
          'Whether your doubts come from real character misalignment or fear of commitment',
          'How consistent his investment and future planning actually are across time',
          'Which kind of reflection helps you decide whether to build or step back'
        ],
        edgeBridge: 'A quiz can evaluate foundation and alignment \\u2014 it cannot declare someone your soulmate or hand you certainty about a shared future. That decision remains grounded in real-world compatibility and choice.',
        ctaText: {
          'feelings:psychic': 'Get personal insight into his feelings',
          'why:psychic': 'Get insight into what changed',
          'still:closure': 'Get a reading focused on closure',
          'wait:tarot_decision': 'Get guidance on your next step',
          'going:tarot_relationship': 'Get a reading on where this is heading',
          'beneath:tarot_deep': 'Get a deeper read on the connection',
          '*:psychic': 'Get a reading for this question',
          '*:tarot_relationship': 'Get a reading on where this is heading',
          '*:tarot_decision': 'Get guidance on your next step',
          '*:tarot_deep': 'Get a deeper read on the connection',
          '*:closure': 'Get a reading focused on closure'
        },
        negativePatternTip: {
          pattern: 'identity-hesitation',
          text: 'when the hesitation runs this deep, a reading about whether he\\u2019s \\u201Cthe one\\u201D can quietly become a way of outsourcing a decision that belongs to you. If you book one, frame it on your own clarity \\u2014 not on a verdict about him.'
        }
      });
    }"""

# 4. does-he-miss-me
old_miss = """    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-he-miss-me', {
        negativePatternTip: {
          pattern: 'suppressed-avoidant',
          text: 'when the reaching has thinned this much, a reading about whether he misses you can quietly become a more expensive way of staying attached to someone who isn\\u2019t reaching back. If you book one, frame it on your own situation \\u2014 not on his feelings.'
        }
      });
    }"""

new_miss = """    matchAha: function (a, pattern) {
      if (a.want === 'wait') return 'choice_friction';
      if ((a.status === 'exes' || a.status === 'separated') &&
          (a.trigger === 'distant' || a.trigger === 'changed' || a.trigger === 'conflict' || a.want === 'still')) {
        return 'sudden_loss';
      }
      if (pattern === 'suppressed-avoidant') return 'boundary_invasion';
      if (a.status === 'complicated') return 'toxic_loop';
      if (pattern === 'not-enough-evidence') return 'illusion_fixation';
      if (a.trigger === 'unknown' && (pattern === 'actively-reaching-back' || pattern === 'connection-continuity')) {
        return 'scarcity_panic';
      }
      if (a.want === 'beneath' || a.trigger === 'unknown') return 'illusion_fixation';
      return 'scarcity_panic';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-he-miss-me', {
        resultV2: true,
        canTell: [
          'Whether his silence is protective space, emotional detachment, or avoidant pull-back',
          'Whether the urge to know is about him or about your own grief process',
          'Which step helps you find emotional grounding rather than waiting in limbo'
        ],
        edgeBridge: 'A quiz can evaluate how silence and gaps behave \\u2014 it cannot verify private longing in another person\\u2019s heart. That requires either his honest admission, or an intuitive reading focused on the connection.',
        ctaText: {
          'feelings:psychic': 'Get personal insight into his feelings',
          'why:psychic': 'Get insight into what changed',
          'still:closure': 'Get a reading focused on closure',
          'wait:tarot_decision': 'Get guidance on your next step',
          'going:tarot_relationship': 'Get a reading on where this is heading',
          'beneath:tarot_deep': 'Get a deeper read on the connection',
          '*:psychic': 'Get a reading for this question',
          '*:tarot_relationship': 'Get a reading on where this is heading',
          '*:tarot_decision': 'Get guidance on your next step',
          '*:tarot_deep': 'Get a deeper read on the connection',
          '*:closure': 'Get a reading focused on closure'
        },
        negativePatternTip: {
          pattern: 'suppressed-avoidant',
          text: 'when the reaching has thinned this much, a reading about whether he misses you can quietly become a more expensive way of staying attached to someone who isn\\u2019t reaching back. If you book one, frame it on your own situation \\u2014 not on his feelings.'
        }
      });
    }"""

# 5. is-he-serious-about-me
old_serious = """    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'is-he-serious-about-me', {
        negativePatternTip: {
          pattern: 'avoidant-uncertainty',
          text: 'when the engagement thins this much under depth, a reading about whether he\\u2019s \\u201Cserious\\u201D can quietly become a more expensive way of staying in a relationship that isn\\u2019t building. If you book one, frame it on your own direction \\u2014 not on his intention.'
        }
      });
    }"""

new_serious = """    matchAha: function (a, pattern) {
      if (a.want === 'wait') return 'choice_friction';
      if ((a.status === 'exes' || a.status === 'separated') &&
          (a.trigger === 'distant' || a.trigger === 'changed' || a.trigger === 'conflict' || a.want === 'still')) {
        return 'sudden_loss';
      }
      if (pattern === 'comfortable-holding') return 'stagnation_void';
      if (pattern === 'avoidant-uncertainty') return 'boundary_invasion';
      if (a.status === 'complicated') return 'toxic_loop';
      if (pattern === 'not-enough-time') return 'illusion_fixation';
      if (a.trigger === 'unknown' && (pattern === 'clear-intention' || pattern === 'building-undefined')) {
        return 'scarcity_panic';
      }
      if (a.want === 'beneath' || a.trigger === 'unknown') return 'illusion_fixation';
      return 'scarcity_panic';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'is-he-serious-about-me', {
        resultV2: true,
        canTell: [
          'Whether his behavior represents a genuine building intention or comfortable stagnation',
          'Where the word-action gap lives in his promises versus tangible effort',
          'Which practice helps you clarify your timeline before investing more emotional capital'
        ],
        edgeBridge: 'A quiz can reveal whether his actions build toward commitment or protect comfortable ambiguity \\u2014 it cannot make the commitment for him. A direct conversation or a situation reading is the honest next step.',
        ctaText: {
          'feelings:psychic': 'Get personal insight into his feelings',
          'why:psychic': 'Get insight into what changed',
          'still:closure': 'Get a reading focused on closure',
          'wait:tarot_decision': 'Get guidance on your next step',
          'going:tarot_relationship': 'Get a reading on where this is heading',
          'beneath:tarot_deep': 'Get a deeper read on the connection',
          '*:psychic': 'Get a reading for this question',
          '*:tarot_relationship': 'Get a reading on where this is heading',
          '*:tarot_decision': 'Get guidance on your next step',
          '*:tarot_deep': 'Get a deeper read on the connection',
          '*:closure': 'Get a reading focused on closure'
        },
        negativePatternTip: {
          pattern: 'avoidant-uncertainty',
          text: 'when the engagement thins this much under depth, a reading about whether he\\u2019s \\u201Cserious\\u201D can quietly become a more expensive way of staying in a relationship that isn\\u2019t building. If you book one, frame it on your own direction \\u2014 not on his intention.'
        }
      });
    }"""

replacements = [
    (old_dhtam, new_dhtam, 'does-he-think-about-me'),
    (old_crush, new_crush, 'does-my-crush-like-me-back'),
    (old_theone, new_theone, 'is-he-the-one'),
    (old_miss, new_miss, 'does-he-miss-me'),
    (old_serious, new_serious, 'is-he-serious-about-me')
]

for old, new, slug in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        print(f"Successfully replaced {slug}")
    else:
        print(f"FAILED to find {slug}")

with open('assets/js/quizzes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved assets/js/quizzes.js")
