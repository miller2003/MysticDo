import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const quizzesPath = path.resolve(__dirname, '../assets/js/quizzes.js');
let content = readFileSync(quizzesPath, 'utf8');

const batch3Quizzes = `
  /* ----------------------------------------------------------
     56. TOWER CARD MEANING — Collapse, Illusions & Bedrock
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'tower-card-meaning': {
    id: 'tower-card-meaning',
    title: 'Why Is the Tower on Your Mind?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are navigating a necessary demolition, experiencing catastrophic dread, resisting the inevitable, or rebuilding from trauma aftermath.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your Tower card inquiry — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'crisis_context',
        q: 'What situation in your life prompted you to look up the Tower card?',
        hint: 'Context defines whether this is active crisis or anticipatory anxiety.',
        options: [
          { text: 'A sudden, shocking disruption — a breakup, firing, or betrayal', detail: 'sitting in the immediate rubble of an event', score: 'recent_shock' },
          { text: 'Drawn the card in a personal reading and felt a wave of terror', detail: 'fear triggered by the card’s dramatic imagery', score: 'card_draw_fear' },
          { text: 'A lingering sense that my current life arrangement is unsustainable', detail: 'anticipating an inevitable collapse', score: 'unsustainable' },
          { text: 'Recovering from a major crisis that happened weeks or months ago', detail: 'evaluating the rebuilding process', score: 'recovery' },
          { text: 'Studying tarot archetypes out of intellectual or creative curiosity', detail: 'general symbolic study', score: 'study' }
        ]
      },
      {
        id: 'reaction_feeling',
        q: 'When you look at the Tower’s falling figures and lightning, what is your gut emotional reaction?',
        hint: 'Your visceral reaction reveals your current emotional threshold.',
        options: [
          { text: 'Deep dread and panic — waiting for an unavoidable disaster', detail: 'acute catastrophic thinking', score: 'dread' },
          { text: 'Anger and grief — mourning something I loved that broke apart', detail: 'acute grieving process', score: 'grief' },
          { text: 'A quiet, strange sense of relief that the pretense is over', detail: 'liberation from denial', score: 'relief' },
          { text: 'Defiance — determined to glue the pieces back together at all costs', detail: 'active resistance to ending', score: 'resistance' },
          { text: 'Curiosity — wondering what bedrock remains underneath', detail: 'contemplative inquiry', score: 'curiosity' }
        ]
      },
      {
        id: 'denial_level',
        q: 'Looking back with honest eyes, were there signs that this foundation was fragile?',
        hint: 'The Tower rarely strikes without preexisting structural stress.',
        options: [
          { text: 'None — it felt like completely unprovoked, random cruelty', detail: 'total surprise', score: 2 },
          { text: 'A few red flags, but I actively suppressed them to keep the peace', detail: 'deliberate avoidance', score: 1 },
          { text: 'I knew it was shaky, but didn’t expect it to fall so fast', detail: 'moderate awareness', score: 0 },
          { text: 'I saw the collapse coming for months — it was only a matter of time', detail: 'clear pre-existing recognition', score: -1 },
          { text: 'I initiated the demolition myself because the foundation was rotten', detail: 'intentional voluntary disruption', score: -2 }
        ]
      },
      {
        id: 'catastrophic_thinking',
        q: 'How much are you catastrophizing that your entire future is permanently ruined?',
        hint: 'Measures cognitive distortion in crisis.',
        options: [
          { text: 'Completely — I feel my life is over and I will never recover', detail: 'acute hopelessness', score: 2 },
          { text: 'Frequently — oscillating between despair and brief moments of calm', detail: 'high emotional turbulence', score: 1 },
          { text: 'Occasionally — I know I will survive, but the disruption is exhausting', detail: 'normal human crisis fatigue', score: 0 },
          { text: 'Rarely — I recognize this as a painful but necessary clearing of the slate', detail: 'grounded resilience', score: -1 },
          { text: 'Not at all — I am already excited to build something authentic on bedrock', detail: 'exemplary post-traumatic growth', score: -2 }
        ]
      },
      {
        id: 'bargaining_behavior',
        q: 'Are you expending energy trying to revive or patch up the collapsed situation?',
        hint: 'Examines whether you are accepting reality or bargaining with rubble.',
        options: [
          { text: 'Desperately — pleading, begging, or working overtime to restore the past', detail: 'intense bargaining', score: 2 },
          { text: 'Tempted to — struggling to let go of familiar comforts', detail: 'reluctant acceptance', score: 1 },
          { text: 'Processing the loss, but holding a clear boundary against going back', detail: 'active boundary maintenance', score: 0 },
          { text: 'Walking away cleanly — I know the old structure is completely dead', detail: 'sovereign departure', score: -1 },
          { text: 'Actively clearing the rubble and laying new blueprints', detail: 'total forward focus', score: -2 }
        ]
      },
      {
        id: 'grounding_status',
        q: 'What does your physical and emotional support system look like right now?',
        hint: 'Bedrock determines recovery speed.',
        options: [
          { text: 'Completely isolated — feeling completely alone with zero support', detail: 'dangerous vulnerability', score: 2 },
          { text: 'Fragile — a couple of acquaintances, but hesitant to be vulnerable', detail: 'limited connection', score: 1 },
          { text: 'Adequate — one or two trusted friends who listen without judging', detail: 'basic social safety net', score: 0 },
          { text: 'Solid — loving community, physical shelter, and professional help', detail: 'strong resilient safety net', score: -1 },
          { text: 'Deeply anchored — unshakable spiritual, emotional, and practical foundation', detail: 'complete internal & external grounding', score: -2 }
        ]
      },
      {
        id: 'core_need',
        q: 'What would bring you the greatest comfort or clarity right now?',
        hint: 'Reveals the honest next step for your healing.',
        options: [
          { text: 'Reassurance that I am safe and this collapse will not kill me', detail: 'safety stabilization', score: 'safety' },
          { text: 'Practical guidance on how to survive the logistical aftermath', detail: 'logistical strategy', score: 'logistics' },
          { text: 'Understanding why this happened so I stop blaming myself', detail: 'cognitive meaning-making', score: 'meaning' },
          { text: 'A clear blueprint for building a resilient, honest new life', detail: 'reconstruction roadmap', score: 'reconstruction' },
          { text: 'Releasing the terror that tarot cards can curse my destiny', detail: 'superstition de-escalation', score: 'superstition_relief' }
        ]
      },
      {
        id: 'guidance_fit',
        q: 'If you sought guidance, what format would honor your current state best?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A tarot reading exploring The Star (healing, hope, and renewal after collapse)', detail: 'healing tarot', score: 'tarot' },
          { text: 'An astrology reading analyzing Uranus or Mars transits for timing', detail: 'astrological timing', score: 'astrology' },
          { text: 'An intuitive psychic reading to explore unspoken dynamics', detail: 'intuitive perspective', score: 'psychic' },
          { text: 'A licensed crisis counselor or therapist to process acute shock and grief', detail: 'clinical crisis support', score: 'therapy' },
          { text: 'Quiet solitary journaling, physical rest, and zero paid readings', detail: 'self-directed restoration', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.denial_level || 0) + (a.catastrophic_thinking || 0) + (a.bargaining_behavior || 0) + (a.grounding_status || 0);
      if (a.crisis_context === 'card_draw_fear' && a.catastrophic_thinking >= 1) {
        return 'catastrophic_dread';
      }
      if (a.bargaining_behavior >= 1 || a.reaction_feeling === 'resistance') {
        return 'resistance_to_inevitable';
      }
      if (a.grounding_status >= 1 && a.catastrophic_thinking >= 1) {
        return 'trauma_aftermath';
      }
      if (s <= -1 && a.denial_level <= -1) {
        return 'necessary_demolition';
      }
      return 'illusion_collapse';
    },

    results: {
      'necessary_demolition': {
        title: 'Necessary Demolition',
        summary: 'Recognizing that an unsustainable, rotten structure had to fall to allow real life to begin.',
        whatAnswersSuggest: [
          'You hold a remarkably mature perspective on the Tower archetype. While the disruption was painful, you recognize that the structure that collapsed was built on compromise, denial, or artificial pretenses.',
          'You understand that the lightning strike was not an act of cruelty, but an act of liberation. It broke open a prison you were afraid to leave voluntarily. You are ready to build on genuine bedrock.'
        ],
        whatItCannotProve: 'That the rebuilding process will happen overnight without hard emotional labor.',
        whatToWatchNext: [
          'Refuse to salvage rotten materials: do not invite back the habits, lies, or dynamic that caused the fragility.',
          'Turn your gaze toward Major Arcana XVII (The Star): focus on gentle healing, quiet authenticity, and self-care.'
        ]
      },
      'catastrophic_dread': {
        title: 'Catastrophic Dread',
        summary: 'Projecting visceral terror onto a dramatic tarot image rather than facing an actual disaster.',
        whatAnswersSuggest: [
          'Your anxiety has been triggered by the violent imagery of the Tower card. Pop culture and superstitious readers have convinced you that drawing this card causes illness, accidents, or cosmic punishment.',
          'Tarot cards have no magical power to harm your physical life. A piece of printed cardboard cannot strike down your career. Breathe deeply, ground your body, and release superstitious panic.'
        ],
        whatItCannotProve: 'That your life is cursed or that an unavoidable physical disaster is destined to strike.',
        whatToWatchNext: [
          'Put the tarot deck away for 72 hours. Reconnect with physical reality: go for a walk, cook a nourishing meal, and stretch.',
          'Notice how your mind generates worst-case scenarios when presented with ambiguous or dramatic symbols.'
        ]
      },
      'resistance_to_inevitable': {
        title: 'Resistance to the Inevitable',
        summary: 'Clinging desperately to the rubble of an expired arrangement out of terror of the unknown.',
        whatAnswersSuggest: [
          'You are spending precious emotional energy trying to bargain, patch up, or resurrect a situation that has already broken beyond repair. You are sleeping in the rubble because the open air feels too vast.',
          'Prolonging the inevitable only multiplies your suffering. The Tower fell because its time had come. Honoring reality with dignity allows the real healing to begin.'
        ],
        whatItCannotProve: 'That you can force another person or an expired job to return to how it was in the beginning.',
        whatToWatchNext: [
          'Stop calling, texting, or pleading. Drop your hands and let the pieces lie where they fell.',
          'Acknowledge that letting go of a broken structure is not failure; it is the prerequisite for self-respect.'
        ]
      },
      'trauma_aftermath': {
        title: 'Trauma Aftermath',
        summary: 'Navigating acute shock and isolation following a sudden, genuine life rupture.',
        whatAnswersSuggest: [
          'You are experiencing the genuine physiological shock of a major life betrayal, sudden ending, or financial blow. Your nervous system is flooded with adrenaline and grief, and your support system feels thin.',
          'In this state, you do not need esoteric readings; you need physical safety, hydration, emotional warmth, and practical crisis support. Be extraordinarily gentle with yourself.'
        ],
        whatItCannotProve: 'That you are permanently broken or that you will never feel joyful and secure again.',
        whatToWatchNext: [
          'Reach out to one compassionate, grounded person or a licensed counselor. Do not carry acute shock in solitary silence.',
          'Focus strictly on the next 24 hours: food, sleep, safety, and basic hygiene. Long-term planning can wait.'
        ]
      },
      'illusion_collapse': {
        title: 'Illusion Collapse',
        summary: 'The painful but liberating moment where unvarnished truth shatters prolonged denial.',
        whatAnswersSuggest: [
          'A truth has been revealed that you can no longer pretend not to see. Whether it was discovering a secret, confronting a financial deficit, or admitting a relationship is hollow, the illusion is gone.',
          'The pain you feel right now is not the pain of destruction; it is the friction of your illusions breaking against reality. Reality always wins, and in the end, reality is the only place worth living.'
        ],
        whatItCannotProve: 'That you were foolish for believing the illusion in the first place. You did the best with what you knew.',
        whatToWatchNext: [
          'Forgive yourself for not seeing the cracks sooner. Denial is a natural human protective mechanism.',
          'Step forward into unvarnished honesty: communicate directly, face the metrics, and live in the light.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'resistance_to_inevitable' || a.bargaining_behavior >= 1) {
        return {
          key: 'fear_of_the_rubble',
          label: 'The terror of standing empty-handed without an identity',
          text: 'When our fortress falls, we feel naked and unmoored. We cling to broken pieces because even a painful, toxic identity feels safer than the terrifying void of starting over. Trust that the empty space is not a cemetery; it is an open construction site.'
        };
      }
      if (p === 'trauma_aftermath' || a.grounding_status >= 1) {
        return {
          key: 'crisis_shock',
          label: 'The profound disorientation of a shattered world-assumptions',
          text: 'A true Tower event shatters your fundamental assumptions: “I thought I was safe,” “I thought they loved me,” “I thought hard work guaranteed security.” Grieving the loss of your worldview takes time. Rebuilding trust begins with trusting your own resilience.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'crisis recovery, structural transitions, and rebuilding', cluster: 'tarot' }),

    matchPractice: function (a) {
      if (a.guidance_fit === 'tarot' || a.reaction_feeling === 'relief') {
        return 'tarot_deep';
      }
      if (a.guidance_fit === 'astrology') {
        return 'tarot_decision';
      }
      if (a.guidance_fit === 'psychic') {
        return 'psychic';
      }
      if (a.guidance_fit === 'therapy' || a.crisis_context === 'recent_shock') {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'tower-card-meaning', {
        negativePatternTip: {
          pattern: 'catastrophic_dread',
          text: 'when a reader gasps and tells you the Tower means you are cursed or that tragedy is guaranteed, they are using cheap carnival tactics. An ethical reader helps you find the bedrock underneath.'
        }
      });
    }
  },

  /* ----------------------------------------------------------
     57. LOVERS CARD MEANING — Choice, Values & Soulmate Fantasy
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'lovers-card-meaning': {
    id: 'lovers-card-meaning',
    title: 'Why Is the Lovers Card on Your Mind?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are navigating a conscious choice, caught in soulmate projection, facing a values dilemma, or at a threshold of authentic vulnerability.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your Lovers card inquiry — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'relational_context',
        q: 'What relationship dynamic prompted you to look up the Lovers card?',
        hint: 'Sets the emotional stage for the card’s archetypal inquiry.',
        options: [
          { text: 'A thrilling new romance or intense infatuation with a crush', detail: 'early-stage butterflies and attraction', score: 'infatuation' },
          { text: 'A painful crossroads between two suitors or two different life paths', detail: 'genuine dilemma of choice', score: 'crossroads' },
          { text: 'A committed relationship navigating values friction or growing distance', detail: 'evaluating long-term sustainability', score: 'long_term' },
          { text: 'Longing for an ex and wondering if we are destined soulmates', detail: 'post-breakup reconciliation hope', score: 'ex_hope' },
          { text: 'Single and wondering when my soulmate or twin flame will arrive', detail: 'seeking future romantic timing', score: 'solo' }
        ]
      },
      {
        id: 'projection_check',
        q: 'How much of your feelings are based on who this person ACTUALLY is vs who you hope they become?',
        hint: 'Distinguishes genuine love from projective fantasy.',
        options: [
          { text: 'Mostly fantasy — projecting an idealized vision and ignoring obvious flaws', detail: 'intense romantic projection', score: 2 },
          { text: 'Somewhat idealized — hoping their potential will eventually shine through', detail: 'potential-attachment', score: 1 },
          { text: 'A balanced mix — I see their flaws, but still feel strongly drawn', detail: 'realistic affection', score: 0 },
          { text: 'Grounded reality — I know their true character, flaws, and habits thoroughly', detail: 'deep observational realism', score: -1 },
          { text: 'Radical clarity — zero illusions; loving them exactly as they are right now', detail: 'mature consummate love', score: -2 }
        ]
      },
      {
        id: 'values_alignment',
        q: 'How well do your core values, ethics, and long-term life visions align with this person?',
        hint: 'The Lovers is fundamentally about values compatibility.',
        options: [
          { text: 'Completely incompatible — clashing on finances, ethics, family, or honesty', detail: 'severe structural values mismatch', score: 2 },
          { text: 'Significant friction — major compromises required on non-negotiables', detail: 'uncomfortable friction', score: 1 },
          { text: 'Moderately aligned — some differences, but shared core integrity', detail: 'workable compromise', score: 0 },
          { text: 'Highly compatible — sharing identical life principles and mutual respect', detail: 'deep values synergy', score: -1 },
          { text: 'Flawlessly united — complete shared vision, ethics, and mutual honor', detail: 'seamless alignment', score: -2 }
        ]
      },
      {
        id: 'vulnerability_exposure',
        q: 'How safe do you feel showing up naked (raw, honest, and unarmored) with this person?',
        hint: 'The Lovers stand naked before Raphael with zero masks.',
        options: [
          { text: 'Terrified — wearing a heavy mask to avoid being rejected or abandoned', detail: 'complete emotional self-protection', score: 2 },
          { text: 'Guarded — sharing surface feelings while hiding my true needs and boundaries', detail: 'guarded compliance', score: 1 },
          { text: 'Cautiously opening up as trust is earned over time', detail: 'healthy pacing', score: 0 },
          { text: 'Very safe — able to express tears, anger, and boundaries without panic', detail: 'high relational security', score: -1 },
          { text: 'Completely unarmored — radical mutual transparency and total acceptance', detail: 'consummate vulnerability', score: -2 }
        ]
      },
      {
        id: 'reciprocity_balance',
        q: 'Is this connection an active mutual choice, or a one-sided chase?',
        hint: 'True Lovers energy requires two people consciously choosing each other.',
        options: [
          { text: 'Completely one-sided — I am doing 100% of the emotional labor and chasing', detail: 'unrequited pursuit', score: 2 },
          { text: 'Inconsistent — they pull close when lonely, then vanish into silence', detail: 'hot-and-cold ambivalence', score: 1 },
          { text: 'Mostly balanced, though one of us initiates slightly more', detail: 'functional everyday balance', score: 0 },
          { text: 'Equally chosen — both of us invest effort, time, and care consistently', detail: 'mutual active commitment', score: -1 },
          { text: 'Unshakably reciprocal — a sovereign partnership of equal devotion', detail: 'exemplary mutual dedication', score: -2 }
        ]
      },
      {
        id: 'fate_vs_agency',
        q: 'When you think of the Lovers card, what do you believe it promises?',
        hint: 'Checks locus of control and romantic fatalism.',
        options: [
          { text: '“Cosmic destiny guarantees we belong together regardless of behavior”', detail: 'toxic romantic fatalism', score: 2 },
          { text: '“A sign that our souls have an unbreakable spiritual contract”', detail: 'soul contract projection', score: 1 },
          { text: '“An invitation to choose commitment with full awareness of trade-offs”', detail: 'archetypal moral choice', score: 0 },
          { text: '“A call to align my actions with my highest personal values”', detail: 'self-sovereign ethics', score: -1 },
          { text: '“A psychological mirror reflecting my own capacity to love honestly”', detail: 'internal depth integration', score: -2 }
        ]
      },
      {
        id: 'core_need',
        q: 'What is the real underlying resolution you are seeking from this card?',
        hint: 'Points toward what actually brings resolution.',
        options: [
          { text: 'Proof that this person is my soulmate so I can stop feeling insecure', detail: 'destiny validation', score: 'soulmate_proof' },
          { text: 'Clarity on which path or suitor aligns with my long-term integrity', detail: 'crossroads decision', score: 'crossroads_choice' },
          { text: 'The courage to be completely honest about my boundaries and needs', detail: 'vulnerability courage', score: 'vulnerability_courage' },
          { text: 'Understanding whether staying in this relationship is healthy for me', detail: 'viability audit', score: 'viability_audit' },
          { text: 'How to cultivate deep self-worth before entering dating', detail: 'self-love integration', score: 'self_love' }
        ]
      },
      {
        id: 'preferred_support',
        q: 'If you sought outside counsel, what format would serve your integrity best?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A relationship tarot spread comparing mutual expectations and values', detail: 'values tarot', score: 'tarot' },
          { text: 'A synastry astrology reading examining Venus and Saturn relational cycles', detail: 'astrological compatibility', score: 'astrology' },
          { text: 'An intuitive psychic reading on unspoken interpersonal dynamics', detail: 'intuitive perspective', score: 'psychic' },
          { text: 'Couples therapy or individual attachment counseling with a licensed therapist', detail: 'clinical relationship therapy', score: 'therapy' },
          { text: 'Quiet reflection, honest journaling, and direct conversation with my partner', detail: 'independent communication', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.projection_check || 0) + (a.values_alignment || 0) + (a.vulnerability_exposure || 0) + (a.reciprocity_balance || 0);
      if (a.reciprocity_balance === 2 || (a.relational_context === 'ex_hope' && a.projection_check >= 1)) {
        return 'unrequited_idealization';
      }
      if (a.projection_check >= 1 && a.fate_vs_agency >= 1) {
        return 'soulmate_projection';
      }
      if (a.values_alignment >= 1 || a.relational_context === 'crossroads') {
        return 'values_dilemma';
      }
      if (a.vulnerability_exposure >= 1) {
        return 'vulnerability_threshold';
      }
      return 'conscious_choice';
    },

    results: {
      'conscious_choice': {
        title: 'Conscious Choice',
        summary: 'Approaching the Lovers as a deliberate, mature decision to commit with open eyes.',
        whatAnswersSuggest: [
          'You understand the true esoteric core of the Lovers (The Choice). Rather than floating in teenage soulmate fantasies, you recognize that enduring love is a daily practice of moral commitment, mutual respect, and shared values.',
          'You see your partner clearly — including their flaws — and choose them not because a deck of cards forced you, but because your principles align and you build each other up in the real world.'
        ],
        whatItCannotProve: 'That your relationship will never face painful challenges or that conflict is impossible.',
        whatToWatchNext: [
          'Continue nurturing open, transparent communication: remember that the angel Raphael is the patron of honest dialogue.',
          'Celebrate the quiet, ordinary moments of partnership over dramatic emotional fireworks.'
        ]
      },
      'soulmate_projection': {
        title: 'Soulmate Projection',
        summary: 'Projecting an idealized romantic fantasy onto a person whose real behavior doesn’t match.',
        whatAnswersSuggest: [
          'You are deeply intoxicated by the romance of the Lovers card, using concepts like “soulmates” or “twin flames” to explain intense chemistry. In doing so, you are in danger of falling in love with a fantasy rather than the actual human being.',
          'When you project your ideal partner onto someone, you ignore red flags, excuse emotional inconsistency, and set both of you up for bitter disappointment when reality inevitably intrudes.'
        ],
        whatItCannotProve: 'That intense romantic chemistry equals long-term character compatibility.',
        whatToWatchNext: [
          'List this person’s real-world behaviors over the past three months: do their actions match their poetic words?',
          'Stop asking if they are your soulmate. Ask: “Does this person treat me with consistent kindness, respect, and emotional safety?”'
        ]
      },
      'values_dilemma': {
        title: 'Values Dilemma',
        summary: 'Standing at a critical crossroads where passionate attraction clashes with personal integrity.',
        whatAnswersSuggest: [
          'You are experiencing the classical dilemma of the Lovers card: a choice between two paths, or between your romantic desires and your fundamental moral values. Chemistry is pulling you forward, but your conscience is waving a warning flag.',
          'Passionate attraction cannot survive a fundamental divergence on core life values (finances, honesty, family, ethics). Choosing partnership requires aligning your actions with your deepest integrity.'
        ],
        whatItCannotProve: 'Which choice holds zero emotional grief. Every real decision closes a door.',
        whatToWatchNext: [
          'Name the non-negotiable value that is currently being compromised or tested in this connection.',
          'Refuse to compromise your fundamental self-respect to keep someone else comfortable.'
        ]
      },
      'vulnerability_threshold': {
        title: 'Vulnerability Threshold',
        summary: 'Standing before real intimacy, wrestling with the terror of shedding your defensive armor.',
        whatAnswersSuggest: [
          'The Lovers stand completely naked in the Garden of Eden. Your primary challenge right now is the terror of emotional exposure: you crave deep intimacy, but fear that if you show your authentic, imperfect self, you will be rejected.',
          'You are hiding behind agreeable masks, people-pleasing, or emotional distance. Real intimacy cannot begin until you have the courage to show up without your armor.'
        ],
        whatItCannotProve: 'That being vulnerable guarantees the other person will treat you with total tenderness.',
        whatToWatchNext: [
          'Take one small, courageous risk in vulnerability: share an honest boundary, a secret fear, or a genuine desire.',
          'Notice that authentic love loves you for your imperfect humanity, not your polished facade.'
        ]
      },
      'unrequited_idealization': {
        title: 'Unrequited Idealization',
        summary: 'Clinging to the Lovers card to justify chasing someone who is emotionally unavailable or uncommitted.',
        whatAnswersSuggest: [
          'You are doing 100% of the emotional heavy lifting in this dynamic, using the hope that “we pulled the Lovers, so we are destined” to endure hot-and-cold treatment, breadcrumbing, or unfaithfulness.',
          'The Lovers represents a mutual union of equals standing together &mdash; not a hostage negotiation where one person begs for crumbs. Staying in an unreciprocated chase is self-abandonment.'
        ],
        whatItCannotProve: 'That an uncommitted ex or partner will suddenly change their character because of a tarot draw.',
        whatToWatchNext: [
          'Drop the rope. Stop initiating, stop chasing, and observe what happens when you hold your ground.',
          'Choose yourself. The highest expression of the Lovers is choosing your own self-respect over an addictive fantasy.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'soulmate_projection' || a.projection_check >= 1) {
        return {
          key: 'longing_for_completion',
          label: 'The ache to be completed and saved by another person',
          text: 'We project soulmate status onto people because we want someone to rescue us from the loneliness of existence. But no human being can complete you; expecting a partner to carry the weight of your spiritual wholeness crushes the relationship. Love begins when two whole beings choose to walk together.'
        };
      }
      if (p === 'unrequited_idealization' || a.reciprocity_balance >= 1) {
        return {
          key: 'worth_linked_to_chase',
          label: 'Conflating the anxiety of chasing with the depth of love',
          text: 'When childhood love was conditional or unpredictable, our nervous system confuses intermittent reinforcement and anxiety with “passionate romance.” True love feels calm, steady, and reciprocal. Healing means learning to tolerate the peace of being loved without a fight.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'relationship choices, values alignment, and partnership', cluster: 'tarot' }),

    matchPractice: function (a) {
      if (a.preferred_support === 'tarot' || a.relational_context === 'crossroads') {
        return 'tarot_relationship';
      }
      if (a.preferred_support === 'astrology') {
        return 'tarot_deep';
      }
      if (a.preferred_support === 'psychic') {
        return 'psychic';
      }
      if (a.preferred_support === 'therapy' || a.reciprocity_balance >= 1) {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'lovers-card-meaning', {
        negativePatternTip: {
          pattern: 'unrequited_idealization',
          text: 'when a reader tells you that the Lovers card proves an emotionally distant ex is your twin flame and you must wait for them indefinitely, walk away. They are keeping you trapped in heartache to sell follow-up readings.'
        }
      });
    }
  },

  /* ----------------------------------------------------------
     58. TAROT YES OR NO — Binary Collapse & Decision Sovereignty
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'tarot-yes-or-no': {
    id: 'tarot-yes-or-no',
    title: 'What Is Your Yes/No Question Actually Pointing At?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are seeking decision empowerment, caught in ambiguity panic, asking for permission, or avoiding accountability.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your yes/no tarot inquiry — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'decision_topic',
        q: 'What life domain is your yes/no question focused on?',
        hint: 'Context clarifies where the pressure is concentrating.',
        options: [
          { text: 'A romantic relationship — reconciliation, fidelity, or breakup', detail: 'high emotional vulnerability', score: 'love' },
          { text: 'Career, job offer, or major financial investment', detail: 'practical security and trajectory', score: 'career_finance' },
          { text: 'Relocation, home purchase, or moving to a new city', detail: 'physical living foundations', score: 'relocation' },
          { text: 'A health, legal, or medical question', detail: 'critical high-stakes domain', score: 'medical_legal' },
          { text: 'Everyday curiosity or testing whether tarot really works', detail: 'casual or skeptical exploration', score: 'curiosity' }
        ]
      },
      {
        id: 'urgency_level',
        q: 'How urgently do you feel you need an immediate answer?',
        hint: 'High urgency usually signals acute ambiguity panic.',
        options: [
          { text: 'Desperate — feeling completely overwhelmed and unable to function without an answer', detail: 'acute panic', score: 'desperate' },
          { text: 'Pressing — a deadline is approaching and I feel paralyzed', detail: 'approaching deadline', score: 'deadline' },
          { text: 'Moderate — I am weighing choices, but have a few days to reflect', detail: 'manageable timeline', score: 'moderate' },
          { text: 'Low — exploring my options thoughtfully before making a move', detail: 'spacious timeline', score: 'low' },
          { text: 'None — just playing with cards and curious about possibilities', detail: 'zero urgency', score: 'none' }
        ]
      },
      {
        id: 'ambiguity_tolerance',
        q: 'How comfortable are you holding space for uncertainty and gray areas?',
        hint: 'Low ambiguity tolerance forces complex issues into false binaries.',
        options: [
          { text: 'Completely unbearable — I would rather have a painful “No” than stay in ambiguity', detail: 'extreme ambiguity intolerance', score: 2 },
          { text: 'Very uncomfortable — overthinking constantly and unable to relax', detail: 'high rumination', score: 1 },
          { text: 'Somewhat uneasy, but able to sit with questions for a while', detail: 'moderate tolerance', score: 0 },
          { text: 'Comfortable — I know most important life decisions involve trade-offs', detail: 'mature nuance tolerance', score: -1 },
          { text: 'Completely at peace — I embrace ambiguity as the fertile ground of life', detail: 'masterful emotional resilience', score: -2 }
        ]
      },
      {
        id: 'permission_seeking',
        q: 'Are you using the tarot deck to give you permission to do something you already want to do?',
        hint: 'Examines whether the cards are being used as a shield against guilt.',
        options: [
          { text: 'Yes — I know what I want, but need an external sign so I don’t feel guilty', detail: 'conscious permission-seeking', score: 2 },
          { text: 'Probably — hoping the cards say “Yes” so I have an excuse to take the leap', detail: 'subconscious validation-seeking', score: 1 },
          { text: 'Partially — I have a slight preference, but genuinely unsure of the risks', detail: 'balanced exploration', score: 0 },
          { text: 'No — I am completely neutral and seeking an objective look at both paths', detail: 'impartial inquiry', score: -1 },
          { text: 'Never — I make my own choices and own the full responsibility for them', detail: 'complete internal authority', score: -2 }
        ]
      },
      {
        id: 'card_pulling_habits',
        q: 'How do you react when a card gives you an answer you didn’t want?',
        hint: 'Compulsive re-pulling indicates anxiety regulation loops.',
        options: [
          { text: 'Reshuffle immediately and keep pulling until I get a “Yes”', detail: 'compulsive confirmation loop', score: 2 },
          { text: 'Feel sick, consult multiple online yes/no cheat sheets, and ask friends', detail: 'reassurance-seeking spiral', score: 1 },
          { text: 'Feel disappointed, but pause to reflect on why that outcome stung', detail: 'self-reflective pause', score: 0 },
          { text: 'Examine what conditions or trade-offs the card is pointing out', detail: 'constructive narrative engagement', score: -1 },
          { text: 'I don’t do yes/no draws — I always lay out comparative multi-card spreads', detail: 'sophisticated decision spread practice', score: -2 }
        ]
      },
      {
        id: 'agency_ownership',
        q: 'If the outcome goes poorly, who will you hold responsible for the decision?',
        hint: 'Distinguishes sovereign adulthood from fatalistic outsourcing.',
        options: [
          { text: 'The cards or the psychic — “the reading told me to do it!”', detail: 'complete external blame', score: 2 },
          { text: 'Fate or bad luck — feeling like a victim of cosmic circumstances', detail: 'passive fatalism', score: 1 },
          { text: 'A shared mix of circumstance and my own imperfect judgment', detail: 'shared responsibility', score: 0 },
          { text: 'Myself — I gathered input, but the final choice was 100% mine', detail: 'sovereign ownership', score: -1 },
          { text: 'Myself completely — I embrace both the rewards and the failures of my agency', detail: 'uncompromising self-leadership', score: -2 }
        ]
      },
      {
        id: 'real_longing',
        q: 'What is the true underlying need fueling your desire for a yes or no?',
        hint: 'Points toward what actually brings resolution.',
        options: [
          { text: 'An end to the agonizing anxiety of second-guessing myself', detail: 'anxiety relief', score: 'anxiety_relief' },
          { text: 'Permission to leave a situation that drains my vitality', detail: 'permission_leave', score: 'permission_leave' },
          { text: 'A risk guarantee so I know I won’t look foolish or fail', detail: 'failure insurance', score: 'failure_insurance' },
          { text: 'A comparative framework to evaluate Option A vs Option B side by side', detail: 'comparative framework', score: 'comparative_analysis' },
          { text: 'To understand the deeper psychological reasons behind my hesitation', detail: 'self-inquiry', score: 'self_inquiry' }
        ]
      },
      {
        id: 'advisory_fit',
        q: 'If you consulted a reader about this choice, what standard would you insist on?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A structured Two-Path Decision Spread mapping both options side by side', detail: 'comparative decision spread', score: 'tarot' },
          { text: 'An astrological transit check to identify timing and momentum windows', detail: 'astrological timing', score: 'astrology' },
          { text: 'An intuitive psychic session to explore unspoken emotional undercurrents', detail: 'intuitive perspective', score: 'psychic' },
          { text: 'An executive coach or licensed therapist to overcome decision paralysis', detail: 'clinical decision coaching', score: 'therapy' },
          { text: 'Free self-inquiry writing prompts with zero external consultation', detail: 'independent self-work', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.ambiguity_tolerance || 0) + (a.permission_seeking || 0) + (a.card_pulling_habits || 0) + (a.agency_ownership || 0);
      if (a.ambiguity_tolerance >= 1 && (a.urgency_level === 'desperate' || a.real_longing === 'anxiety_relief')) {
        return 'ambiguity_panic';
      }
      if (a.permission_seeking >= 1 || a.real_longing === 'permission_leave') {
        return 'permission_seeking';
      }
      if (a.agency_ownership >= 1) {
        return 'outcome_evasion';
      }
      if (a.card_pulling_habits >= 1) {
        return 'binary_trap';
      }
      return 'decision_empowerment';
    },

    results: {
      'decision_empowerment': {
        title: 'Decision Empowerment',
        summary: 'Using tarot as an empowering mirror to evaluate trade-offs, conditions, and trajectories.',
        whatAnswersSuggest: [
          'You hold a healthy, sophisticated understanding of tarot. Rather than treating 78 complex archetypes like a cheap plastic coin-flip, you use the cards to illuminate the trade-offs and hidden costs of both options.',
          'You understand that adult decision-making is not about finding an option with zero friction; it is about choosing which set of challenges you are willing to embrace with full personal responsibility.'
        ],
        whatItCannotProve: 'Which choice holds a 100% guarantee of success or zero sorrow.',
        whatToWatchNext: [
          'Lay out a structured Two-Path Spread: draw three cards for Option A and three for Option B.',
          'Focus on comparing the conditions required to succeed in each path rather than looking for a binary verdict.'
        ]
      },
      'ambiguity_panic': {
        title: 'Ambiguity Panic',
        summary: 'Demanding a yes/no verdict to extinguish the acute physical pain of prolonged uncertainty.',
        whatAnswersSuggest: [
          'Your urge to get an immediate yes/no answer is driven by acute anxiety rather than rational planning. Your nervous system is flooded, and holding the discomfort of an unsettled crossroads feels unbearable.',
          'Demanding a binary answer from a deck of cards is a desperate attempt to stop the panic. But a false sense of certainty will only collapse later. Learn to regulate your nervous system first; decisions made in panic rarely hold.'
        ],
        whatItCannotProve: 'That forcing a quick choice right now will protect you from future regret.',
        whatToWatchNext: [
          'Stop pulling cards for 24 hours. Practice somatic grounding: cold water on your wrists, deep breathing, and physical rest.',
          'Separate the emotional discomfort of ambiguity from an actual emergency. Most choices can wait two days.'
        ]
      },
      'permission_seeking': {
        title: 'Permission Seeking',
        summary: 'Asking cards to grant you permission to do what you already know in your gut you need to do.',
        whatAnswersSuggest: [
          'Deep down, you already know the answer. You want to leave the relationship, quit the job, or take the leap &mdash; but you fear the guilt, criticism, or consequences that come with owning the choice.',
          'You are hoping the tarot deck will say “Yes, leave!” so you can point to the cards and say “the universe made me do it.” Reclaim your sovereignty: you do not need permission from cardboard to live an authentic life.'
        ],
        whatItCannotProve: 'That having external permission will exempt you from the uncomfortable emotions of setting boundaries.',
        whatToWatchNext: [
          'Say out loud: “I am an adult. I have the right to choose what is healthy for me without cosmic justification.”',
          'Notice how much lighter you feel when you own your desire rather than hiding behind signs.'
        ]
      },
      'binary_trap': {
        title: 'The Binary Bias Trap',
        summary: 'Forcing complex, multi-dimensional life realities into rigid black-and-white caricatures.',
        whatAnswersSuggest: [
          'You have fallen into the cognitive trap of the Binary Bias: assuming that an outcome is either 100% good or 100% bad, a total success or an utter failure. Yes/no tarot reinforces this black-and-white thinking.',
          'Reality is almost always nuanced and conditional. A job offer might be a “Yes for income, but a No for work-life balance.” A relationship might be a “Yes for attraction, but a No for shared values.” Look for the conditions.'
        ],
        whatItCannotProve: 'That any major life choice can be cleanly categorized as purely good or purely bad.',
        whatToWatchNext: [
          'Identify the “If/Then” conditions: under what specific circumstances does this choice become a Yes?',
          'Replace “Will it work?” with “What skills, boundaries, and resources do I need to bring to make it work?”'
        ]
      },
      'outcome_evasion': {
        title: 'Outcome Evasion',
        summary: 'Outsourcing the responsibility of adult choice to avoid bearing the sting of potential failure.',
        whatAnswersSuggest: [
          'Asking the cards to decide for you is a subtle psychological defense mechanism against accountability. If you choose on your own and fail, you must face your own regret; if you follow a card draw, you can blame fate.',
          'True personal power requires embracing the possibility of failure. Living boldly means making choices with imperfect information, bearing the consequences with dignity, and trusting yourself to adapt.'
        ],
        whatItCannotProve: 'That avoiding responsibility protects your self-esteem in the long run.',
        whatToWatchNext: [
          'Own your choice completely. Make a decision, write it in your journal, and date it.',
          'Remember that making an imperfect decision and learning from it builds more wisdom than waiting for signs.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'ambiguity_panic' || a.ambiguity_tolerance >= 1) {
        return {
          key: 'terror_of_the_in_between',
          label: 'The visceral panic of living without a map',
          text: 'Living in the gap between what was and what will be is one of the most agonizing human states. We crave a binary verdict because we want to know what ground we stand on. Cultivating ambiguity tolerance is the ultimate spiritual practice: learning to breathe while the clay is still being shaped.'
        };
      }
      if (p === 'permission_seeking' || a.permission_seeking >= 1) {
        return {
          key: 'fear_of_being_the_villain',
          label: 'The fear of being judged for choosing your own happiness',
          text: 'Many conscientious people were raised to believe that choosing their own needs makes them selfish or cruel. You seek a “Yes” from tarot because you want an angelic absolution for disappointing others. An authentic life requires tolerating being the villain in someone else’s story.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'decision clarity, comparative options, and choice ownership', cluster: 'tarot' }),

    matchPractice: function (a) {
      if (a.advisory_fit === 'tarot' || a.decision_topic === 'career_finance') {
        return 'tarot_decision';
      }
      if (a.advisory_fit === 'astrology') {
        return 'tarot_deep';
      }
      if (a.advisory_fit === 'psychic') {
        return 'psychic';
      }
      if (a.advisory_fit === 'therapy' || a.decision_topic === 'medical_legal') {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'tarot-yes-or-no', {
        negativePatternTip: {
          pattern: 'ambiguity_panic',
          text: 'when a reader offers to answer 10 yes/no questions in 5 minutes, they are running a slot machine on your anxiety. A wise advisor refuses binary coin-flips and helps you explore conditions.'
        }
      });
    }
  },

  /* ----------------------------------------------------------
     59. DREAM ABOUT BEING CHASED — Avoidance & Threat Simulation
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'dream-about-being-chased': {
    id: 'dream-about-being-chased',
    title: 'Why Did You Dream About Being Chased?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are navigating daytime avoidance, acute stress activation, trauma residue, sleep physiology, or shadow integration.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your chase dream — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'pursuer_identity',
        q: 'Who or what was pursuing you in the dream?',
        hint: 'The mask of the pursuer reveals the nature of the avoided waking issue.',
        options: [
          { text: 'An unknown shadowy figure, monster, or faceless presence', detail: 'unintegrated shadow or suppressed emotion', score: 'shadow' },
          { text: 'A wild predatory animal (wolf, bear, snake, tiger)', detail: 'primal survival threat or somatic burnout', score: 'animal' },
          { text: 'An authority figure (police, boss, teacher, parent)', detail: 'guilt, imposter syndrome, or perfectionism', score: 'authority' },
          { text: 'An ex-partner, estranged family member, or known acquaintance', detail: 'unresolved relational boundary violation', score: 'known_person' },
          { text: 'A generalized invisible force or shapeless panic', detail: 'diffuse free-floating anxiety', score: 'invisible' }
        ]
      },
      {
        id: 'body_sensation',
        q: 'What physical sensation dominated your body during the dream chase?',
        hint: 'Distinguishes sleep physiology (REM atonia) from psychological panic.',
        options: [
          { text: 'Heavy slow motion — legs felt like lead, running through mud or water', detail: 'classic REM muscle atonia', score: 'slow_motion' },
          { text: 'Paralyzed voice — trying desperately to scream or call for help, but muted', detail: 'vocal cord atonia', score: 'muted_voice' },
          { text: 'High-speed frantic running — heart racing, dodging obstacles in terror', detail: 'pure sympathetic nervous activation', score: 'frantic_speed' },
          { text: 'Hiding in a small confined space (closet, under bed) holding my breath', detail: 'experiential avoidance strategy', score: 'hiding' },
          { text: 'Turned around to fight, confront, or speak to the pursuer', detail: 'active shadow confrontation', score: 'confrontation' }
        ]
      },
      {
        id: 'daytime_avoidance',
        q: 'What major responsibility, uncomfortable truth, or difficult conversation are you avoiding while awake?',
        hint: 'Dreams simulate what the conscious mind evades during daylight.',
        options: [
          { text: 'A critical life issue — relationship breakup, financial debt, or job exit', detail: 'severe existential avoidance', score: 2 },
          { text: 'An uncomfortable conversation or boundary I keep postponing', detail: 'moderate interpersonal avoidance', score: 1 },
          { text: 'A few nagging errands or administrative deadlines', detail: 'minor routine procrastination', score: 0 },
          { text: 'Very little — I address conflicts and responsibilities directly as they arise', detail: 'proactive engagement', score: -1 },
          { text: 'Nothing — my conscience is clear and all major boundaries are communicated', detail: 'complete waking congruence', score: -2 }
        ]
      },
      {
        id: 'stress_arousal',
        q: 'How overwhelmed or chronically stressed has your nervous system felt recently?',
        hint: 'Chronic daytime cortisol triggers nocturnal amygdala hyperactivity.',
        options: [
          { text: 'Incapacitating burnout — panic attacks, insomnia, or physical exhaustion', detail: 'severe nervous system hyper-arousal', score: 2 },
          { text: 'High baseline stress — constant rushing, deadlines, or emotional friction', detail: 'frequent sympathetic activation', score: 1 },
          { text: 'Moderate stress — standard workday pressure, but functional', detail: 'normal modern baseline', score: 0 },
          { text: 'Mostly calm — balanced routine with adequate rest and leisure', detail: 'well-regulated parasympathetic state', score: -1 },
          { text: 'Completely serene — relaxed body, peaceful sleep, and minimal tension', detail: 'deep somatic equilibrium', score: -2 }
        ]
      },
      {
        id: 'recurrence_frequency',
        q: 'How often do you experience chase dreams or intense nightmares?',
        hint: 'Frequency indicates whether this is acute situational triage or chronic distress.',
        options: [
          { text: 'Multiple nights a week — waking up terrified and exhausted repeatedly', detail: 'chronic nightmare syndrome / possible PTSD', score: 2 },
          { text: 'A few times a month — usually coinciding with major stress spikes', detail: 'episodic stress response', score: 1 },
          { text: 'Once or twice a year — rare and isolated', detail: 'occasional memory triage', score: 0 },
          { text: 'This was the first chase dream I’ve had in years', detail: 'spontaneous isolated simulation', score: -1 },
          { text: 'Never had one before this — completely novel experience', detail: 'acute novel trigger', score: -2 }
        ]
      },
      {
        id: 'sleep_hygiene_factors',
        q: 'Were any physiological sleep disruptors present before you went to bed?',
        hint: 'Physical triggers frequently simulate nightmare panic.',
        options: [
          { text: 'Alcohol, heavy late-night meal, spicy food, or intense late-night screens', detail: 'high biological nightmare priming', score: 2 },
          { text: 'Room was overheated, noisy, or physically uncomfortable', detail: 'environmental sleep disturbance', score: 1 },
          { text: 'Mild fatigue or irregular bedtime schedule', detail: 'minor circadian disruption', score: 0 },
          { text: 'Clean sleep hygiene — dark, cool, quiet room, zero late screens', detail: 'optimal sleep architecture', score: -1 },
          { text: 'Perfect sleep environment with wind-down meditation', detail: 'exemplary physiological hygiene', score: -2 }
        ]
      },
      {
        id: 'core_longing',
        q: 'What is the deepest relief you are seeking after this dream?',
        hint: 'Reveals what will actually soothe your nervous system.',
        options: [
          { text: 'Reassurance that I am not in real physical danger or spiritually attacked', detail: 'safety normalization', score: 'safety' },
          { text: 'The courage to finally confront the waking situation I am fleeing', detail: 'confrontation courage', score: 'courage' },
          { text: 'Practical techniques to stop recurring nightmares and sleep peacefully', detail: 'sleep therapy tools', score: 'sleep_tools' },
          { text: 'Understanding the symbolic psychological meaning of the pursuer', detail: 'archetypal analysis', score: 'symbolic_meaning' },
          { text: 'To stop feeling exhausted and ungrounded during my waking day', detail: 'somatic regulation', score: 'somatic_regulation' }
        ]
      },
      {
        id: 'guidance_fit',
        q: 'If you sought outside perspective on this dream, what approach would you value most?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A depth tarot reading exploring the Nine of Swords or Strength (shadow integration)', detail: 'shadow tarot', score: 'tarot' },
          { text: 'An astrology reading analyzing Moon and 12th House transits for timing', detail: 'astrological psychology', score: 'astrology' },
          { text: 'An intuitive psychic reading on subconscious emotional blocks', detail: 'intuitive perspective', score: 'psychic' },
          { text: 'A sleep specialist or licensed therapist specializing in nightmare therapy (IRT)', detail: 'evidence-based dream therapy', score: 'therapy' },
          { text: 'Independent journaling, nightmare rescripting, and zero paid readings', detail: 'independent self-work', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.daytime_avoidance || 0) + (a.stress_arousal || 0) + (a.recurrence_frequency || 0) + (a.sleep_hygiene_factors || 0);
      if (a.body_sensation === 'slow_motion' && a.sleep_hygiene_factors >= 1) {
        return 'physiological_wake_rush';
      }
      if (a.recurrence_frequency === 2 || a.stress_arousal === 2) {
        return 'acute_stress_activation';
      }
      if (a.body_sensation === 'confrontation' || a.pursuer_identity === 'shadow') {
        return 'shadow_integration';
      }
      if (a.daytime_avoidance >= 1) {
        return 'avoidance_confrontation';
      }
      return 'trauma_residue';
    },

    results: {
      'avoidance_confrontation': {
        title: 'Avoidance Confrontation',
        summary: 'Your dream is holding up a mirror: what you flee in daylight pursues you at night.',
        whatAnswersSuggest: [
          'According to Threat Simulation Theory, your dream is not an omen of external danger; it is a primal simulation of your waking avoidance. You are putting off a difficult conversation, an overdue boundary, or a hard life choice.',
          'The pursuer represents the emotional consequence of that postponed reality. The longer you run from the truth during the day, the faster the pursuer sprints in your dreams. The only way to stop the chase is to turn around.'
        ],
        whatItCannotProve: 'That an outside person is actively plotting against you in physical reality.',
        whatToWatchNext: [
          'Identify the one conversation or task you have been delaying and commit to addressing it within 48 hours.',
          'Notice how confronting daytime challenges immediately softens nighttime nightmare intensity.'
        ]
      },
      'physiological_wake_rush': {
        title: 'Physiological Wake Rush',
        summary: 'Normal REM sleep muscle atonia combined with physical sleep disruption.',
        whatAnswersSuggest: [
          'Your sensation of running in slow motion or having heavy lead legs was caused by normal REM sleep muscle atonia &mdash; your brainstem disconnecting motor signals so you don’t leap out of bed.',
          'Combined with a late meal, alcohol, room overheating, or mild sleep apnea, your brain registered physical immobility as terrifying paralysis within the dream narrative. This is pure biological wiring, not a spiritual curse.'
        ],
        whatItCannotProve: 'That your spiritual energy is blocked or that you are paralyzed in waking life.',
        whatToWatchNext: [
          'Cool down your bedroom (optimal sleep temperature is 65°F / 18°C), avoid alcohol within 3 hours of bed, and sleep on your side.',
          'Remind yourself upon waking that heavy legs in dreams are proof that your biological safety mechanisms worked.'
        ]
      },
      'acute_stress_activation': {
        title: 'Acute Stress Activation',
        summary: 'Chronic daytime stress and burnout overflowing into nighttime emotional memory processing.',
        whatAnswersSuggest: [
          'Your nervous system is in a state of sympathetic hyper-arousal. When daytime deadlines, financial strain, or interpersonal conflict keep your cortisol elevated, your amygdala stays hyperactive during REM sleep.',
          'The chase dream is simply your brain’s exhausted effort to vent excess adrenaline. You do not need to decode a mystical message; you need deep, restorative rest and nervous system regulation.'
        ],
        whatItCannotProve: 'That you are doomed to stay exhausted or that an external disaster is pending.',
        whatToWatchNext: [
          'Institute a strict digital curfew 60 minutes before sleep: zero news, zero work email, zero stressful media.',
          'Practice slow, extended-exhale breathing (4 seconds in, 7 seconds out) before bed to activate the parasympathetic brake.'
        ]
      },
      'shadow_integration': {
        title: 'Shadow Integration',
        summary: 'A call from depth psychology to embrace suppressed emotions, vitality, and power.',
        whatAnswersSuggest: [
          'In Jungian dreamwork, the monster or shadowy pursuer often carries the gold of your disowned self: healthy anger, ambition, sexual desire, or boundaries that you repress to stay “nice.”',
          'The shadow pursues you not to destroy you, but to be integrated into your conscious life. When you stop running, turn around, and ask the pursuer what it wants, it frequently transforms into an ally.'
        ],
        whatItCannotProve: 'That your dark thoughts make you a bad or dangerous person.',
        whatToWatchNext: [
          'Write down the three scariest qualities of your dream pursuer and ask: “Where in my life do I need a little more of that assertiveness, fierceness, or power?”',
          'Reclaim your right to take up space and express healthy, protective anger.'
        ]
      },
      'trauma_residue': {
        title: 'Trauma Residue',
        summary: 'Past boundary violations or traumatic experiences echoing in subconscious defense alarms.',
        whatAnswersSuggest: [
          'Your chase dream reflects historical alarm bells: past relationships, childhood volatility, or betrayal trauma that trained your nervous system to stay permanently vigilant.',
          'When current life triggers old vulnerabilities, the brain re-runs familiar threat simulations to make sure you won’t be caught off guard again. Healing requires gently teaching your body that the past is over and you are safe now.'
        ],
        whatItCannotProve: 'That your current environment is as dangerous as your past was.',
        whatToWatchNext: [
          'Practice somatic orienting: open your eyes, look around your current room, name 5 blue objects, and feel the solid mattress supporting your weight.',
          'Consider working with a trauma-informed therapist using EMDR or Somatic Experiencing if nightmares are persistent.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'avoidance_confrontation' || a.daytime_avoidance >= 1) {
        return {
          key: 'fear_of_conflict',
          label: 'The dread of disappointing others by standing in your truth',
          text: 'Many people run in dreams because in waking life, they are terrified of confrontation. You swallow your words and smile while churning inside. The nightmare pursuer is your own suppressed voice demanding that you stop being agreeable at the expense of your soul.'
        };
      }
      if (p === 'acute_stress_activation' || a.stress_arousal >= 1) {
        return {
          key: 'survival_terror',
          label: 'The physical dread of chronic exhaustion and collapse',
          text: 'When you work without rest, your body perceives modern life as a predator hunting you to death. The chase dream is your biology screaming: “Slow down or we will collapse.” Honoring your body’s need for rest is an act of survival.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'dream exploration, fear integration, and stress management', cluster: 'dreams' }),

    matchPractice: function (a) {
      if (a.guidance_fit === 'tarot' || a.body_sensation === 'confrontation') {
        return 'tarot_deep';
      }
      if (a.guidance_fit === 'astrology') {
        return 'tarot_decision';
      }
      if (a.guidance_fit === 'psychic') {
        return 'psychic';
      }
      if (a.guidance_fit === 'therapy' || a.recurrence_frequency === 2) {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'dream-about-being-chased', {
        negativePatternTip: {
          pattern: 'acute_stress_activation',
          text: 'when a reader tells you that a chase dream means an astral entity is feeding on your aura, they are exploiting normal sleep biology to sell you expensive cleansings. Cool your bedroom and reduce daytime caffeine.'
        }
      });
    }
  },

  /* ----------------------------------------------------------
     60. DREAM ABOUT YOUR EX — Memory Triage & Attachment Closure
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'dream-about-your-ex': {
    id: 'dream-about-your-ex',
    title: 'Why Did You Dream About Your Ex?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether your dream is serving memory consolidation, wish-fulfillment fantasy, unresolved resentment, comparison with your current partner, or an anniversary cue.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your ex dream — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'breakup_timeline',
        q: 'How long has it been since you and this ex separated?',
        hint: 'Time elapsed contextualizes memory consolidation vs acute grief.',
        options: [
          { text: 'Very recent — within the last few weeks or months', detail: 'acute withdrawal and active grief phase', score: 'recent' },
          { text: 'Six months to two years ago — mostly moved on, but lingering residue', detail: 'secondary integration phase', score: 'mid_term' },
          { text: 'Several years ago (3 to 7+ years) — rarely think about them while awake', detail: 'deep historical memory storage', score: 'long_term' },
          { text: 'A first love or childhood romance from long ago', detail: 'formative developmental archetype', score: 'first_love' },
          { text: 'On-and-off dynamic with ongoing contact or boundary blur', detail: 'active unresolved attachment loop', score: 'on_off' }
        ]
      },
      {
        id: 'dream_scenario',
        q: 'What actually happened between you and your ex in the dream?',
        hint: 'The scenario reveals the emotional schema being processed.',
        options: [
          { text: 'We reconciled, embraced, kissed, or felt deeply loving and safe', detail: 'wish-fulfillment and intimacy recall', score: 'reconciliation' },
          { text: 'We fought, argued, or they betrayed/rejected me all over again', detail: 'trauma processing and anger venting', score: 'conflict' },
          { text: 'They ignored me, walked away, or were happily with someone else', detail: 'rejection and inadequacy schema', score: 'ignored' },
          { text: 'We had a calm, peaceful conversation or mutually said goodbye', detail: 'integrative closure schema', score: 'peaceful_closure' },
          { text: 'Bizarre, random everyday situation with zero romantic charge', detail: 'neutral memory fragment sorting', score: 'mundane' }
        ]
      },
      {
        id: 'current_relationship_status',
        q: 'What is your current romantic status while waking?',
        hint: 'Reveals whether the dream is comparison or solitary processing.',
        options: [
          { text: 'Happily partnered or married — felt intense guilt waking up from the dream', detail: 'partnered with guilt', score: 2 },
          { text: 'Dating someone new, but feeling ambivalent or hesitant', detail: 'comparison threshold', score: 1 },
          { text: 'Completely single and actively longing for connection or affection', detail: 'loneliness longing', score: 0 },
          { text: 'Single and content — focusing on my own healing and goals', detail: 'sovereign independence', score: -1 },
          { text: 'Currently communicating or texting with this ex in waking life', detail: 'active energetic entanglement', score: -2 }
        ]
      },
      {
        id: 'waking_attachment',
        q: 'How much do you find yourself thinking about or checking up on this ex during the day?',
        hint: 'Measures conscious vs subconscious preoccupation.',
        options: [
          { text: 'Constantly — checking their social media, mutual friends, or ruminating daily', detail: 'active obsessive attachment', score: 2 },
          { text: 'Frequently — feeling occasional waves of curiosity or longing', detail: 'moderate nostalgia', score: 1 },
          { text: 'Occasionally — they cross my mind when triggered by a song or memory', detail: 'spontaneous passive recall', score: 0 },
          { text: 'Almost never — I had completely forgotten about them until this dream', detail: 'subconscious surprise recall', score: -1 },
          { text: 'Zero — total indifference; no emotional charge whatsoever', detail: 'complete emotional neutrality', score: -2 }
        ]
      },
      {
        id: 'telepathic_projection',
        q: 'How strongly do you believe this dream means your ex is thinking of you or calling you back?',
        hint: 'Checks magical projection vs cognitive reality.',
        options: [
          { text: 'Certain — I feel in my bones that they miss me and want to reconcile', detail: 'telepathic conviction', score: 2 },
          { text: 'Hoping so — wondering if this is a cosmic sign to break No-Contact', detail: 'tempted outreach impulse', score: 1 },
          { text: 'Confused — curious if there is any spiritual link, but skeptical', detail: 'open skepticism', score: 0 },
          { text: 'Doubtful — I recognize dreams are generated inside my own head', detail: 'cognitive self-awareness', score: -1 },
          { text: 'Not at all — this is my brain sorting emotional files; it has nothing to do with them', detail: 'pure neuroscience clarity', score: -2 }
        ]
      },
      {
        id: 'anniversary_trigger',
        q: 'Did a sensory, seasonal, or calendar trigger recently occur?',
        hint: 'Sensory cues naturally activate hippocampal memory retrieval.',
        options: [
          { text: 'Yes — an anniversary, their birthday, our old vacation spot, or a familiar song', detail: 'conscious sensory/calendar cue', score: 2 },
          { text: 'A mutual friend mentioned them, or saw an old photo recently', detail: 'social media / peer prompt', score: 1 },
          { text: 'Seasonal shift — weather or holiday that felt reminiscent of our time', detail: 'seasonal mood memory', score: 0 },
          { text: 'No conscious triggers that I can identify', detail: 'isolated subconscious activation', score: -1 },
          { text: 'Nothing whatsoever — completely out of the blue', detail: 'random memory triage', score: -2 }
        ]
      },
      {
        id: 'core_longing',
        q: 'What is the deepest emotional ache this dream stirred up in you?',
        hint: 'Points toward what your soul is actually asking for.',
        options: [
          { text: 'The desire to be held, loved, and known deeply by someone again', detail: 'intimacy hunger', score: 'intimacy_hunger' },
          { text: 'The need for an apology or acknowledgment of the pain they caused me', detail: 'vindication closure', score: 'vindication_closure' },
          { text: 'The fantasy of undoing the breakup and getting a second chance', detail: 'reconciliation fantasy', score: 'reconciliation_fantasy' },
          { text: 'Relief from guilt that I am somehow betraying my current partner', detail: 'guilt relief', score: 'guilt_relief' },
          { text: 'Confirmation that I have truly healed and can let them go forever', detail: 'peaceful release', score: 'peaceful_release' }
        ]
      },
      {
        id: 'guidance_fit',
        q: 'If you sought outside perspective on this dream, what standard would you value most?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A closure tarot spread exploring the Eight of Cups (walking away cleanly)', detail: 'closure tarot', score: 'tarot' },
          { text: 'An astrology reading analyzing Venus transits and karmic relationship cycles', detail: 'astrological relationship timing', score: 'astrology' },
          { text: 'An intuitive psychic reading to explore my energetic boundaries', detail: 'intuitive perspective', score: 'psychic' },
          { text: 'A licensed relationship counselor to address lingering attachment wounds', detail: 'clinical attachment therapy', score: 'therapy' },
          { text: 'Zero paid consultations — I will journal, hold my boundaries, and let it pass', detail: 'independent self-work', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.telepathic_projection || 0) + (a.waking_attachment || 0) + (a.current_relationship_status || 0) + (a.anniversary_trigger || 0);
      if (a.telepathic_projection >= 1 && a.dream_scenario === 'reconciliation') {
        return 'reconciliation_wish_fantasy';
      }
      if (a.current_relationship_status === 2) {
        return 'current_relationship_comparison';
      }
      if (a.dream_scenario === 'conflict' || a.core_longing === 'vindication_closure') {
        return 'unresolved_resentment';
      }
      if (a.anniversary_trigger >= 1) {
        return 'anniversary_cue';
      }
      return 'memory_consolidation';
    },

    results: {
      'memory_consolidation': {
        title: 'Memory Consolidation',
        summary: 'Your brain’s offline filing system processing emotional memories during REM sleep.',
        whatAnswersSuggest: [
          'According to cognitive neuroscience, your dream is not an omen, a psychic signal, or a sign to text your ex. It is your brain doing its nightly emotional memory triage: stripping visceral pain from past experiences so the factual wisdom can be safely archived.',
          'Your ex appears not as their current physical self, but as an avatar representing a specific developmental chapter of your life. The dream simply means your mind was organizing old files. Do not disrupt your waking peace over nighttime filing.'
        ],
        whatItCannotProve: 'That your ex is thinking about you or that getting back together is viable.',
        whatToWatchNext: [
          'Acknowledge the dream without judgment, take a shower, and focus your attention on your current daily goals.',
          'Notice that you can remember someone with tenderness without needing to invite them back into your physical life.'
        ]
      },
      'reconciliation_wish_fantasy': {
        title: 'Reconciliation Wish Fantasy',
        summary: 'Longing for an undo button on painful grief and romanticizing past intimacy.',
        whatAnswersSuggest: [
          'You are experiencing profound emotional withdrawal or loneliness, which has led your subconscious to stage a comforting reconciliation fantasy. Dreams have a dangerous habit of editing out the incompatibility, lies, or coldness that caused the breakup.',
          'Believing this dream is a “cosmic sign to reach out” is an emotional trap. If you break No-Contact based on a dream, you risk reopening healed wounds for an ex whose real-world character has not changed.'
        ],
        whatItCannotProve: 'That your ex has changed their flaws, misses you, or desires reconciliation.',
        whatToWatchNext: [
          'Write down the five biggest, most painful reasons you broke up. Read them before you even consider picking up your phone.',
          'Recognize that you are missing the sensation of intimacy and warmth &mdash; not necessarily this specific flawed human.'
        ]
      },
      'current_relationship_comparison': {
        title: 'Current Relationship Comparison',
        summary: 'Your subconscious comparing past vulnerability with present safety &mdash; not emotional betrayal.',
        whatAnswersSuggest: [
          'Dreaming of an ex while in a happy relationship can trigger intense, unnecessary guilt. You worry: “Does this mean I secretly still love my ex? Am I betraying my partner?”',
          'The answer is an emphatic no. The human brain constantly evaluates current relational safety against historical benchmarks. Your current partner may have touched a deep vulnerability that naturally reactivated old attachment memories. Release the guilt.'
        ],
        whatItCannotProve: 'That your current relationship is flawed or that you married/dated the wrong person.',
        whatToWatchNext: [
          'Give your current partner a warm hug today. Notice the safety, reliability, and respect they offer.',
          'Recognize that dreams are involuntary subconscious phenomena; you are only responsible for your conscious waking choices.'
        ]
      },
      'unresolved_resentment': {
        title: 'Unresolved Resentment & Closure Need',
        summary: 'Your psyche attempting to resolve betrayal trauma and give itself the apology you never received.',
        whatAnswersSuggest: [
          'Your dream was filled with fighting, betrayal, or a staged apology. This occurs because the relationship ended ambiguously, leaving you with an acute Need for Cognitive Closure.',
          'Because your ex never took responsibility in real life, your subconscious staged the drama to vent unexpressed rage or provide self-vindication. Accept the closure from your own mind: you do not need them to apologize to be free.'
        ],
        whatItCannotProve: 'That confronting your ex in real life will result in an honest or satisfying conversation.',
        whatToWatchNext: [
          'Write a raw, uncensored letter detailing every single betrayal and boundary violation. Do not send it &mdash; burn it safely.',
          'Reclaim your power: true closure is an internal decision to stop waiting for an apology that will never arrive.'
        ]
      },
      'anniversary_cue': {
        title: 'Anniversary & Sensory Cue',
        summary: 'A seasonal, calendar, or sensory trigger activating associative memory pathways.',
        whatAnswersSuggest: [
          'Your dream was sparked by associative memory conditioning: a change in season, an anniversary, their birthday, a familiar song, or a scent triggered your hippocampus to retrieve associated memories.',
          'This is a completely normal biological phenomenon. The brain organizes memories associatively; when a sensory cue fires, the old file opens. It does not carry mystical significance; it is simply how memory works.'
        ],
        whatItCannotProve: 'That the universe is aligning your paths again.',
        whatToWatchNext: [
          'Acknowledge the calendar anniversary: “Yes, we used to celebrate this week. That chapter is finished, and today is a new day.”',
          'Create a new, positive sensory association in your present environment.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'reconciliation_wish_fantasy' || a.telepathic_projection >= 1) {
        return {
          key: 'grief_of_unrealized_future',
          label: 'Mourning the ghost of the future you planned together',
          text: 'The hardest part of a breakup is not just losing the person; it is burying the imagined future you designed with them. When you dream of reconciliation, you are longing for that lost future. Healing requires having the courage to build an even better future on your own.'
        };
      }
      if (p === 'unresolved_resentment' || a.core_longing === 'vindication_closure') {
        return {
          key: 'wound_of_unseen_injustice',
          label: 'The agony of being misunderstood and mistreated without remorse',
          text: 'It burns to be lied to or discarded by someone you trusted, while they walk away seemingly unaffected. But waiting for an ex to validate your pain keeps you bound to them. Your vindication is living an honorable, joyful, and beautiful life.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'breakup closure, emotional memory integration, and boundary healing', cluster: 'dreams' }),

    matchPractice: function (a) {
      if (a.guidance_fit === 'tarot' || a.core_longing === 'vindication_closure') {
        return 'closure';
      }
      if (a.guidance_fit === 'astrology') {
        return 'tarot_deep';
      }
      if (a.guidance_fit === 'psychic') {
        return 'psychic';
      }
      if (a.guidance_fit === 'therapy' || a.breakup_timeline === 'on_off') {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'dream-about-your-ex', {
        negativePatternTip: {
          pattern: 'reconciliation_wish_fantasy',
          text: 'when a reader tells you that dreaming about your ex proves they are telepathically calling you and you should break No-Contact, run. They are playing on your vulnerability to sell reconciliation readings.'
        }
      });
    }
  },
`;

// Insert right before the last closing '};\n'
const lastClosingIndex = content.lastIndexOf('};');
if (lastClosingIndex === -1) {
  console.error('Could not find closing }; in quizzes.js');
  process.exit(1);
}

const updatedContent = content.slice(0, lastClosingIndex) + batch3Quizzes + '\n' + content.slice(lastClosingIndex);
writeFileSync(quizzesPath, updatedContent, 'utf8');
console.log('Successfully appended 5 Batch 3 quizzes to assets/js/quizzes.js!');
