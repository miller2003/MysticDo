import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const quizzesPath = path.resolve(__dirname, '../assets/js/quizzes.js');
let content = readFileSync(quizzesPath, 'utf8');

const batch2Quizzes = `
  /* ----------------------------------------------------------
     52. 444 MEANING — Foundation, Grounding & Protection
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  '444-meaning': {
    id: '444-meaning',
    title: 'Why Is 444 on Your Mind?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are using 444 as a grounding anchor, seeking reassurance under acute stress, caught in attentional priming, or bypassing practical action.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your 444 sightings — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'life_context',
        q: 'What were you going through when 444 began appearing in your awareness?',
        hint: 'The life setting gives the symbol its psychological charge.',
        options: [
          { text: 'A period of intense personal or financial instability', detail: 'vulnerable, anxious, or facing uncertainty', score: 'instability' },
          { text: 'Building a new business, home, or creative project', detail: 'laying tangible long-term foundations', score: 'building' },
          { text: 'Grieving a loss or feeling emotionally isolated', detail: 'seeking comfort or a sense of presence', score: 'grief_isolation' },
          { text: 'A relatively calm, regular routine', detail: 'no acute crisis, just noticed the number', score: 'routine' },
          { text: 'Engaging with spiritual media and angel number posts', detail: 'immersed in online esoteric content', score: 'media' }
        ]
      },
      {
        id: 'sighting_trigger',
        q: 'When does 444 catch your eye most frequently?',
        hint: 'Context clarifies whether it is circadian conditioning or emotional projection.',
        options: [
          { text: 'Waking up in the night or checking my phone at 4:44', detail: 'predictable circadian glance', score: 'clock' },
          { text: 'In moments of acute panic, fear, or self-doubt', detail: 'seeking an emotional lifeline', score: 'stress_moment' },
          { text: 'On receipts, invoices, or financial accounts', detail: 'tied to material security and money', score: 'financial' },
          { text: 'On vehicle license plates and street signage', detail: 'everyday transit and commuting', score: 'transit' },
          { text: 'Completely at random throughout the day', detail: 'no single recurring setting', score: 'random' }
        ]
      },
      {
        id: 'vulnerability_level',
        q: 'How emotionally vulnerable or destabilized have you felt recently?',
        hint: 'High vulnerability primes the brain to search for safety cues.',
        options: [
          { text: 'Severely overwhelmed — feeling unsafe or desperate for help', detail: 'acute emotional or financial dread', score: 2 },
          { text: 'Noticeably anxious — worried about the future or my foundations', detail: 'frequent background tension', score: 1 },
          { text: 'Mildly unsettled — navigating some changes but functional', detail: 'manageable stress', score: 0 },
          { text: 'Mostly grounded — feeling steady in my daily routines', detail: 'resilient and capable', score: -1 },
          { text: 'Completely secure — calm, anchored, and confident', detail: 'deep internal stability', score: -2 }
        ]
      },
      {
        id: 'attribution_style',
        q: 'When 444 appears, what thought immediately flashes in your mind?',
        hint: 'Notice whether you assign the meaning to external magic or internal reflection.',
        options: [
          { text: '“Guardian angels are actively watching and protecting me”', detail: 'literal supernatural shield', score: 2 },
          { text: '“The universe is reassuring me that everything will work out”', detail: 'comforting spiritual message', score: 1 },
          { text: '“A helpful reminder to take a deep breath and stay grounded”', detail: 'reflective somatic anchor', score: 0 },
          { text: '“My brain is primed to notice repeating fours”', detail: 'cognitive recognition of visual salience', score: -1 },
          { text: '“Pure coincidence — I ignore the numbers I don’t track”', detail: 'statistical and random reality', score: -2 }
        ]
      },
      {
        id: 'practical_action',
        q: 'How much real-world action have you taken to reinforce your foundations?',
        hint: 'Are you building real stability or relying on signs to fix things?',
        options: [
          { text: 'None — I am waiting for signs or divine intervention to clear the way', detail: 'passive spiritual bypassing', score: 2 },
          { text: 'Very little — I feel too paralyzed or exhausted to take steps', detail: 'overwhelmed avoidance', score: 1 },
          { text: 'Some initial steps, but I struggle to stay consistent', detail: 'patching leaks as they arise', score: 0 },
          { text: 'Active practical building — budgeting, boundary-setting, or skill-building', detail: 'taking responsibility for security', score: -1 },
          { text: 'Rigorous structural discipline — solid plan executed daily', detail: 'complete practical ownership', score: -2 }
        ]
      },
      {
        id: 'checking_fixation',
        q: 'How much mental focus do you spend watching for 444 or other numbers?',
        hint: 'Fixation indicates cognitive monitoring load.',
        options: [
          { text: 'Compulsively checking clocks or feeling uneasy if I don’t see it', detail: 'superstitious hyper-vigilance', score: 2 },
          { text: 'Frequently looking for it when I need reassurance', detail: 'intentional reassurance-seeking', score: 1 },
          { text: 'I notice it when it pops up, but don’t actively hunt for it', detail: 'casual passive awareness', score: 0 },
          { text: 'Rarely think about it outside of the exact moment I see it', detail: 'fleeting observation', score: -1 },
          { text: 'Never seek it out — it has zero grip on my behavior', detail: 'zero cognitive load', score: -2 }
        ]
      },
      {
        id: 'primary_need',
        q: 'If you are honest with yourself, what do you most need right now?',
        hint: 'Your answer points directly to your next grounded step.',
        options: [
          { text: 'Deep emotional reassurance that I am safe and not alone', detail: 'nervous system soothing', score: 'reassurance' },
          { text: 'A clear practical plan to fix my finances, career, or home', detail: 'structural life audit', score: 'practical_plan' },
          { text: 'Proof that supernatural beings are orchestrating my life', detail: 'external spiritual validation', score: 'external_proof' },
          { text: 'An outside perspective on where my life foundations are weak', detail: 'objective diagnostic feedback', score: 'objective_feedback' },
          { text: 'To stop feeling anxious and learn to trust my own competence', detail: 'reclaiming self-reliance', score: 'self_reliance' }
        ]
      },
      {
        id: 'preferred_support',
        q: 'If you chose to seek guidance, what kind of help would feel most honorable?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A structured, reflective reading on my stability and boundaries', detail: 'grounded tarot inquiry', score: 'tarot' },
          { text: 'An intuitive read on my energetic blocks and blind spots', detail: 'conversational psychic session', score: 'psychic' },
          { text: 'Practical financial, career, or executive coaching', detail: 'concrete actionable mentoring', score: 'coaching' },
          { text: 'Evidence-based therapy for anxiety or hyper-vigilant thinking', detail: 'licensed clinical support', score: 'therapy' },
          { text: 'Free self-inquiry tools and personal journaling', detail: 'self-directed inner work', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.vulnerability_level || 0) + (a.attribution_style || 0) + (a.practical_action || 0) + (a.checking_fixation || 0);
      if (a.practical_action >= 1 && a.attribution_style === 2) {
        return 'passive_protection';
      }
      if (s >= 4 && (a.vulnerability_level >= 1 || a.primary_need === 'reassurance')) {
        return 'anxiety_reassurance';
      }
      if (a.attribution_style <= 0 && a.practical_action <= 0) {
        return 'grounding_anchor';
      }
      if (a.life_context === 'media' || a.checking_fixation <= -1) {
        return 'attentional_salience';
      }
      return 'unsettled_seeking';
    },

    results: {
      'grounding_anchor': {
        title: 'Grounding Anchor',
        summary: 'Using 444 as a mindful trigger to breathe, stabilize, and reinforce real foundations.',
        whatAnswersSuggest: [
          'You hold a healthy, grounded relationship with 444. You appreciate the archetype of the four — stability, structure, boundary-setting, and endurance — without treating digital clocks as magical talismans.',
          'When the number catches your eye, it functions as an internal punctuation mark: an invitation to check in with your physical body, evaluate your practical boundaries, and take steady, deliberate action in your career and home life.'
        ],
        whatItCannotProve: 'That unseen forces are managing your physical security for you, or that challenges will never disrupt your plans.',
        whatToWatchNext: [
          'Identify one concrete foundation in your life (emergency savings, sleep hygiene, or relationship boundaries) that needs maintenance this week.',
          'Continue treating numbers as reflective mirrors of your own integrity rather than commands from the cosmos.'
        ]
      },
      'anxiety_reassurance': {
        title: 'Anxiety Reassurance',
        summary: 'Reaching for 444 as a lifeline when the nervous system feels ungrounded and vulnerable.',
        whatAnswersSuggest: [
          'Your recurring sightings of 444 are closely tethered to acute stress, loneliness, or emotional precarity. When perceived control is low, human pattern recognition naturally spikes in an effort to find safety cues in the surrounding environment.',
          'Finding 444 provides a momentary burst of relief (“I am protected”), but the underlying anxiety quickly returns because the root practical or emotional vulnerability remains unaddressed.'
        ],
        whatItCannotProve: 'That your anxiety can be cured by waiting for more numerical signs or that you are helpless without external reassurance.',
        whatToWatchNext: [
          'Shift your focus from seeking signs of protection to taking one somatic grounding action: slow diaphragmatic breathing, feet flat on the ground, and physical rest.',
          'Notice if reassurance-seeking is keeping you from addressing a hard reality in your budget, living situation, or partnerships.'
        ]
      },
      'attentional_salience': {
        title: 'Attentional Salience',
        summary: 'Visual priming and pattern recognition operating without deep emotional desperation.',
        whatAnswersSuggest: [
          'Your sightings of 444 are largely the result of normal human cognitive mechanics: high visual contrast, circadian waking habits (checking your phone at 4:44), and attentional priming amplified by social media algorithms.',
          'You notice 444 because four identical parallel strokes stand out against everyday noise, and your brain has flagged the sequence as interesting. You do not suffer from superstitious dread, but you are genuinely curious why it happens so consistently.'
        ],
        whatItCannotProve: 'That the universe is transmitting personal numerical codes or that you are on an orchestrated spiritual escalation timeline.',
        whatToWatchNext: [
          'Enjoy the pleasant synchronicity without over-interpreting it. Let it serve as a lighthearted reminder to be present in your physical surroundings.',
          'Notice how many non-repeating numbers (like 3:18 or 7:42) you glance at each day without giving them a second thought.'
        ]
      },
      'passive_protection': {
        title: 'Passive Protection Trap',
        summary: 'Waiting for angelic intervention while neglecting practical responsibility and planning.',
        whatAnswersSuggest: [
          'There is a tendency to use the belief that “angels are protecting me” as a reason to avoid having difficult conversations, balancing your budget, or updating a lagging career strategy.',
          'Spiritual bypassing occurs when comforting esoteric concepts are substituted for uncomfortable real-world effort. True foundation-building (the essence of the number 4) requires sweat, discipline, and clear boundaries.'
        ],
        whatItCannotProve: 'That spiritual protection excuses negligence, or that positive thinking alone will safeguard your material security.',
        whatToWatchNext: [
          'Audit where you have been postponing practical responsibility under the guise of “surrendering to divine timing.”',
          'Choose one specific task you have been avoiding and finish it today. That is how real foundations are built.'
        ]
      },
      'unsettled_seeking': {
        title: 'Unsettled Seeking',
        summary: 'Searching for meaning in recurring numbers without knowing what clarity is actually needed.',
        whatAnswersSuggest: [
          'You find yourself noticing 444 repeatedly, but you feel ambiguous about what it means or what to do with the experience. You are caught between curiosity and skepticism.',
          'This usually happens during life transitions where you sense that an old phase is closing, but a clear new path has not yet emerged. The mind catches repeating patterns because it is searching for an orienting compass.'
        ],
        whatItCannotProve: 'That an external source will hand you a pre-packaged roadmap without your active exploration and experimentation.',
        whatToWatchNext: [
          'Sit with a journal and ask: “If 444 were asking me what kind of stability I want to build over the next five years, what would I write?”',
          'Give yourself permission to not have every answer immediately. Clarity comes through action, not passive contemplation.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'anxiety_reassurance' || a.vulnerability_level >= 1) {
        return {
          key: 'fear_of_instability',
          label: 'The terror of feeling unprotected in an uncertain world',
          text: 'When life feels unstable, the human heart aches for a guardian. Craving protection is a tender, completely natural human impulse. Honor that vulnerability by building real, compassionate human support rather than relying on digital clocks to keep you safe.'
        };
      }
      if (p === 'passive_protection' || a.practical_action >= 1) {
        return {
          key: 'fear_of_agency',
          label: 'The desire to be rescued from adult responsibility',
          text: 'Making decisions and bearing their consequences is heavy. Believing unseen guides have everything handled is a comforting escape hatch from the weight of adult agency. Reclaiming your power means accepting that you are the builder of your life.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'stability, grounding, and life foundations', cluster: 'angel-numbers' }),

    matchPractice: function (a) {
      if (a.preferred_support === 'tarot' || a.primary_need === 'practical_plan') {
        return 'tarot_decision';
      }
      if (a.preferred_support === 'psychic' || a.primary_need === 'objective_feedback') {
        return 'psychic';
      }
      if (a.preferred_support === 'therapy') {
        return 'closure';
      }
      if (a.preferred_support === 'free_tools' || a.attribution_style <= 0) {
        return 'free_first';
      }
      return 'general';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, '444-meaning', {
        negativePatternTip: {
          pattern: 'passive_protection',
          text: 'when a psychic tells you 444 means you don’t need to worry about money or boundaries because angels have you covered, they are feeding an avoidance trap. Real stability comes from your own disciplined stewardship.'
        }
      });
    }
  },

  /* ----------------------------------------------------------
     53. 333 MEANING — Synthesis, Expression & Crossroads
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  '333-meaning': {
    id: '333-meaning',
    title: 'Why Is 333 on Your Mind?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are navigating a decision crossroads, experiencing creative friction, resolving cognitive dissonance, or caught in attentional priming.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your 333 sightings — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'life_context',
        q: 'What major theme was active in your life when 333 became noticeable?',
        hint: 'The life stage provides the archetypal tension.',
        options: [
          { text: 'A difficult decision between two divergent life paths', detail: 'crossroads in career, relationship, or location', score: 'crossroads' },
          { text: 'A creative urge or desire to express my authentic voice', detail: 'writing, art, or speaking up', score: 'creative' },
          { text: 'Waking up frequently around 3:33 AM with racing thoughts', detail: 'nocturnal awakenings and sleep disruption', score: 'sleep' },
          { text: 'Feeling internal conflict between what I think and what I do', detail: 'cognitive dissonance and misalignment', score: 'dissonance' },
          { text: 'Just general curiosity from seeing repeating numbers online', detail: 'casual spiritual exploration', score: 'casual' }
        ]
      },
      {
        id: 'trigger_setting',
        q: 'Where does 333 capture your conscious focus most strongly?',
        hint: 'Context distinguishes circadian biology from emotional projection.',
        options: [
          { text: 'Digital clocks and timers during midday work or study', detail: 'frequent desk or phone checks', score: 'day_clock' },
          { text: 'Middle-of-the-night phone checks when waking up', detail: 'nocturnal REM transition window', score: 'night_clock' },
          { text: 'Receipt totals, license plates, and transactional numbers', detail: 'spontaneous commercial sightings', score: 'transaction' },
          { text: 'Social media timestamps, view counts, or comment feeds', detail: 'digital algorithm engagement', score: 'social' },
          { text: 'Right when I am ruminating over a specific relationship or choice', detail: 'emotional synchronicity anchor', score: 'ruminating' }
        ]
      },
      {
        id: 'decision_tension',
        q: 'How intensely are you currently experiencing indecision or inner conflict?',
        hint: 'Cognitive dissonance drives the mind to search for tie-breaking signs.',
        options: [
          { text: 'Paralyzed by indecision — agonizing between choices for weeks', detail: 'intense analysis paralysis', score: 2 },
          { text: 'Noticeably torn — head says one thing, heart says another', detail: 'frequent internal friction', score: 1 },
          { text: 'Weighing practical pros and cons with moderate clarity', detail: 'deliberate consideration', score: 0 },
          { text: 'Mostly decided — just building the courage to execute', detail: 'clear direction, minor hesitation', score: -1 },
          { text: 'Completely unified — clear mind, open heart, decisive action', detail: 'zero cognitive dissonance', score: -2 }
        ]
      },
      {
        id: 'creative_voice',
        q: 'How freely are you expressing your authentic thoughts and creative energy?',
        hint: 'The triad archetype is fundamentally linked to truth and self-expression.',
        options: [
          { text: 'Heavily suppressed — keeping quiet to avoid conflict or judgment', detail: 'swallowing your voice', score: 2 },
          { text: 'Stifled — creative projects stalled by self-criticism or perfectionism', detail: 'blocked creative flow', score: 1 },
          { text: 'Expressing myself in some areas, holding back in others', detail: 'partial authenticity', score: 0 },
          { text: 'Speaking my mind honestly and engaging in regular creative work', detail: 'active, healthy expression', score: -1 },
          { text: 'Fully aligned and vocal — zero fear of authentic self-expression', detail: 'uninhibited creative vitality', score: -2 }
        ]
      },
      {
        id: 'attribution_style',
        q: 'How do you interpret the significance of 333 when it appears?',
        hint: 'Distinguishes external guru worship from internal synthesis.',
        options: [
          { text: '“Ascended masters are giving me a direct sign to follow”', detail: 'mythological external authority', score: 2 },
          { text: '“The universe is telling me that my path is cosmically blessed”', detail: 'external confirmation seeking', score: 1 },
          { text: '“A reminder to align my intellect, heart, and actions”', detail: 'reflective triad archetype', score: 0 },
          { text: '“Cognitive Rule of Three — my brain is simply highlighting threes”', detail: 'heuristic pattern detection', score: -1 },
          { text: '“Everyday random coincidence with zero mystical meaning”', detail: 'strict rational baseline', score: -2 }
        ]
      },
      {
        id: 'action_ownership',
        q: 'What are you doing to resolve your current crossroads or creative block?',
        hint: 'Agency turns symbolic insights into tangible life progress.',
        options: [
          { text: 'Waiting for 333 to appear more times so I know for sure what to do', detail: 'outsourcing decisions to signs', score: 2 },
          { text: 'Over-researching numerology and horoscopes instead of choosing', detail: 'intellectual avoidance', score: 1 },
          { text: 'Journaling and listing pros/cons, but postponing the leap', detail: 'processing without execution', score: 0 },
          { text: 'Taking concrete small steps to test each option directly', detail: 'empirical experimentation', score: -1 },
          { text: 'Setting a firm deadline and taking full ownership of the outcome', detail: 'radical personal agency', score: -2 }
        ]
      },
      {
        id: 'core_longing',
        q: 'What would bring you the greatest sense of peace right now?',
        hint: 'Reveals the underlying motivation behind your search.',
        options: [
          { text: 'An authoritative answer telling me which choice is guaranteed to succeed', detail: 'risk elimination fantasy', score: 'guarantee' },
          { text: 'The courage to share my creative work or speak my honest truth', detail: 'creative liberation', score: 'liberation' },
          { text: 'Unbroken, deep sleep without waking at 3:33 AM with anxiety', detail: 'physiological rest', score: 'sleep_rest' },
          { text: 'Grounded clarity on how to bridge my head and my heart', detail: 'integrated alignment', score: 'alignment' },
          { text: 'Knowing that I am capable of handling the consequences of my choice', detail: 'self-trust', score: 'self_trust' }
        ]
      },
      {
        id: 'guidance_fit',
        q: 'If you consulted an outside advisor, what approach would you respect most?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A reflective tarot spread comparing the trajectories of my options', detail: 'decision-focused tarot', score: 'tarot' },
          { text: 'An intuitive psychic session to surface unspoken dynamics', detail: 'intuitive perspective', score: 'psychic' },
          { text: 'An executive or creative coach to overcome analysis paralysis', detail: 'action-oriented coaching', score: 'coaching' },
          { text: 'Cognitive behavioral support for insomnia or chronic worry', detail: 'evidence-based clinical support', score: 'therapy' },
          { text: 'Quiet solitary journaling with structured self-inquiry prompts', detail: 'self-reliant contemplation', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.decision_tension || 0) + (a.creative_voice || 0) + (a.attribution_style || 0) + (a.action_ownership || 0);
      if (a.attribution_style === 2 && a.action_ownership >= 1) {
        return 'ascended_master_fixation';
      }
      if (a.decision_tension >= 1 && a.action_ownership >= 1) {
        return 'dissonance_escape';
      }
      if (a.creative_voice >= 1 || a.core_longing === 'liberation') {
        return 'creative_alignment';
      }
      if (s <= -1 && a.attribution_style <= 0) {
        return 'crossroads_catalyst';
      }
      return 'attentional_priming';
    },

    results: {
      'crossroads_catalyst': {
        title: 'Crossroads Catalyst',
        summary: 'Using 333 as an empowering trigger to synthesize head, heart, and decisive action.',
        whatAnswersSuggest: [
          'You hold a mature, constructive relationship with the 333 archetype. Rather than demanding that spirits make your choices, you recognize the number as an invitation to synthesize your intellect and your emotions.',
          'You understand that lingering in analysis paralysis is more costly than making an imperfect choice. Sighting 333 acts as a catalyst to end hesitation, communicate your boundaries, and step forward with conviction.'
        ],
        whatItCannotProve: 'Which specific choice holds zero risk, or that every outcome will be universally applauded by others.',
        whatToWatchNext: [
          'Set a clear date and time by which your decision will be made, and commit to honoring whatever you choose.',
          'Bring your actions into direct alignment with your core principles today.'
        ]
      },
      'creative_alignment': {
        title: 'Creative Alignment Need',
        summary: 'A subconscious call to release perfectionism, unblock your authentic voice, and create.',
        whatAnswersSuggest: [
          'Your sightings of 333 correlate strongly with suppressed self-expression or unexpressed creative vitality. The archetype of the three across world mythology is tied to fertility, imagination, and truth-telling.',
          'You may be holding back an important perspective in your relationship, or stalling on an artistic project out of fear of criticism. 333 is functioning as an internal alarm telling you that silence has become too expensive.'
        ],
        whatItCannotProve: 'That your art or perspective will become an effortless viral sensation without hard editing and vulnerability.',
        whatToWatchNext: [
          'Dedicate 30 uninterrupted minutes today to writing, speaking, or building without judging the preliminary output.',
          'Identify where in your relationships you are being agreeable at the expense of your authentic integrity.'
        ]
      },
      'dissonance_escape': {
        title: 'Dissonance Escape',
        summary: 'Searching for external signs to resolve painful internal conflict without having to choose.',
        whatAnswersSuggest: [
          'You are experiencing profound cognitive dissonance — your mind wants one path, but your emotions or fears pull toward another. Because carrying this friction is uncomfortable, your brain is hunting for an external sign to break the tie.',
          'Fixating on 333 gives you a temporary sense that a cosmic force will intervene, allowing you to delay the painful responsibility of cutting off one option to pursue the other.'
        ],
        whatItCannotProve: 'That a number can eliminate the grief or risk involved in choosing between two incompatible paths.',
        whatToWatchNext: [
          'Acknowledge that every real choice involves sacrificing something. Name the sacrifice you are trying to avoid making.',
          'Stop asking “what is the sign telling me?” and ask “which path allows me to respect myself more ten years from now?”'
        ]
      },
      'ascended_master_fixation': {
        title: 'Ascended Master Fixation',
        summary: 'Projecting authority onto mythological spiritual figures to escape personal accountability.',
        whatAnswersSuggest: [
          'You have absorbed new age literature that frames 333 as direct contact from “ascended masters.” While archetypes of wisdom are deeply inspiring, outsourcing your discernment to invisible authorities disempowers you.',
          'If you believe masters are orchestrating your schedule, you risk ignoring rational red flags in business, relationships, or health because “the signs told me to do it.”'
        ],
        whatItCannotProve: 'That historical spiritual figures are micromanaging your digital clock or relieving you of critical thinking.',
        whatToWatchNext: [
          'Reclaim your authority. Even if you appreciate spiritual teachers, remember that the purpose of real wisdom is to teach you how to stand on your own two feet.',
          'Evaluate your current crossroads using evidence, ethics, and practical feasibility rather than esoteric commands.'
        ]
      },
      'attentional_priming': {
        title: 'Attentional Priming',
        summary: 'Heuristic Rule of Three pattern recognition amplified by everyday curiosity and digital habits.',
        whatAnswersSuggest: [
          'You notice 333 primarily because of the cognitive Rule of Three: three occurrences of any stimulus form the baseline threshold for human pattern detection. Add digital clocks, timers, and social media, and sightings multiply naturally.',
          'Your experience is grounded and relatively calm. You are not experiencing acute crises; your pattern-detection system is simply operating as evolution intended.'
        ],
        whatItCannotProve: 'That repeating digits are cosmic Morse code meant only for you.',
        whatToWatchNext: [
          'Enjoy the fun of noticing patterns without letting esoteric rabbit holes consume your productive daily time.',
          'Use sightings as a gentle mindful prompt to drink a glass of water and stretch.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'dissonance_escape' || a.decision_tension >= 1) {
        return {
          key: 'fear_of_regret',
          label: 'The agony of having to choose and mourning the unchosen path',
          text: 'Every major decision closes a door. We agonize over signs because we want a guarantee that we won’t feel regret. True maturity is accepting that every meaningful choice carries a seed of loss, and trusting yourself to build a good life on the road you pick.'
        };
      }
      if (p === 'creative_alignment' || a.creative_voice >= 1) {
        return {
          key: 'fear_of_visibility',
          label: 'The vulnerability of being seen in your authentic truth',
          text: 'Staying quiet feels safe; expressing your genuine creative truth exposes you to judgment. Craving alignment is your soul’s rebellion against hiding. Stepping into visibility requires tolerating the discomfort of being seen imperfectly.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'decision crossroads, creative synthesis, and alignment', cluster: 'angel-numbers' }),

    matchPractice: function (a) {
      if (a.guidance_fit === 'tarot' || a.life_context === 'crossroads') {
        return 'tarot_decision';
      }
      if (a.guidance_fit === 'psychic' || a.life_context === 'creative') {
        return 'tarot_deep';
      }
      if (a.guidance_fit === 'therapy' || a.life_context === 'sleep') {
        return 'closure';
      }
      if (a.guidance_fit === 'free_tools' || a.attribution_style <= 0) {
        return 'free_first';
      }
      return 'general';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, '333-meaning', {
        negativePatternTip: {
          pattern: 'ascended_master_fixation',
          text: 'when a reader tells you that an ascended master gave them a secret command for your life, they are replacing your judgment with their agenda. A wise advisor helps you find your own voice.'
        }
      });
    }
  },

  /* ----------------------------------------------------------
     54. 777 MEANING — Wisdom, Culmination & Jackpot Fallacy
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  '777-meaning': {
    id: '777-meaning',
    title: 'Why Is 777 on Your Mind?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are cultivating introspective wisdom, caught in the jackpot fallacy, seeking validation for a gamble, or navigating attentional priming.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your 777 sightings — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'life_context',
        q: 'What situation in your life coincided with 777 drawing your attention?',
        hint: 'Sets the emotional foundation for why 777 feels charged.',
        options: [
          { text: 'Exhaustion after a long season of struggle or sacrifice', detail: 'hoping that relief or reward is finally near', score: 'exhaustion' },
          { text: 'Contemplating a high-stakes financial, career, or personal risk', detail: 'weighing a gamble or speculative leap', score: 'gamble' },
          { text: 'Immersed in solitary study, meditation, or spiritual reflection', detail: 'deep philosophical or mystical inquiry', score: 'study' },
          { text: 'Seeing 777 repeatedly on receipts, prices, or gas pumps', detail: 'transactional and commercial encounters', score: 'receipts' },
          { text: 'Engaging with social media posts about luck, miracles, or twin flames', detail: 'online algorithm immersion', score: 'social' }
        ]
      },
      {
        id: 'sighting_moment',
        q: 'What were you thinking right before you noticed 777?',
        hint: 'Identifies the thought pattern being projected onto the symbol.',
        options: [
          { text: '“When is it finally my turn to get lucky?”', detail: 'longing for sudden external rescue', score: 'lucky_turn' },
          { text: '“Is this business/investment risk the right move?”', detail: 'seeking validation for speculative risk', score: 'risk_check' },
          { text: '“I need to pull back and think quietly about what I’ve learned”', detail: 'contemplative pause', score: 'reflection' },
          { text: '“I hope this confirms that my prayers were answered”', detail: 'faith confirmation seeking', score: 'prayer' },
          { text: 'Nothing special — just noticed the three sevens lined up', detail: 'neutral observational glance', score: 'neutral' }
        ]
      },
      {
        id: 'jackpot_mindset',
        q: 'How much are you relying on a sudden stroke of luck or miracle to resolve your problems?',
        hint: 'High reliance on luck signals the Jackpot Fallacy.',
        options: [
          { text: 'Completely — I need a miracle, lottery win, or windfall to survive', detail: 'acute desperation for rescue', score: 2 },
          { text: 'Significantly — hoping a sudden breakthrough saves me from grinding', detail: 'escapist longing', score: 1 },
          { text: 'Somewhat — I work hard, but keep wishing for a lucky break', detail: 'moderate hopefulness', score: 0 },
          { text: 'Minimally — I believe luck is just preparation meeting opportunity', detail: 'grounded realism', score: -1 },
          { text: 'Not at all — my progress is built strictly on competence and discipline', detail: 'complete internal locus of control', score: -2 }
        ]
      },
      {
        id: 'risk_behavior',
        q: 'Have you used sightings of 777 to justify speculative spending, bets, or uncalculated risks?',
        hint: 'Examines magical thinking in financial or personal decision-making.',
        options: [
          { text: 'Yes — bought tickets, made risky trades, or made purchases believing 777 was a green light', detail: 'active magical risk-taking', score: 2 },
          { text: 'Tempted to — felt an urge to gamble on the assumption that luck was on my side', detail: 'near-miss impulse', score: 1 },
          { text: 'Hesitated — wondered if 777 meant I should take a chance, but held back', detail: 'curious hesitation', score: 0 },
          { text: 'No — I evaluate risks strictly by their downside and mathematical odds', detail: 'disciplined risk management', score: -1 },
          { text: 'Never — I never mix superstition with financial or contractual decisions', detail: 'strict rational boundary', score: -2 }
        ]
      },
      {
        id: 'wisdom_orientation',
        q: 'How much are you using 777 as a prompt for solitary study, introspection, and patience?',
        hint: 'In esoteric history, 7 represents the Hermit and philosophical study.',
        options: [
          { text: 'Not at all — I just want the good fortune and abundance promised online', detail: 'pure jackpot orientation', score: 2 },
          { text: 'A little, but I am mostly focused on external results and outcomes', detail: 'outcome fixation', score: 1 },
          { text: 'I reflect occasionally on what recent hard lessons have taught me', detail: 'moderate introspection', score: 0 },
          { text: 'Very much — 777 reminds me to value quiet wisdom, study, and mastery', detail: 'deep contemplative practice', score: -1 },
          { text: 'Exclusively — I view the 7 as the archetype of truth-seeking and inner peace', detail: 'complete philosophical alignment', score: -2 }
        ]
      },
      {
        id: 'cultural_conditioning',
        q: 'When you see 777, how strongly does the image of a slot machine or jackpot pop into your head?',
        hint: 'Measures commercial and pop-culture conditioning.',
        options: [
          { text: 'Instantly — 777 has always meant winning big and striking gold', detail: 'heavy commercial conditioning', score: 2 },
          { text: 'Quite strongly — I naturally associate it with casinos or jackpots', detail: 'moderate commercial association', score: 1 },
          { text: 'I recognize the casino link, but think of spiritual sevens too', detail: 'mixed awareness', score: 0 },
          { text: 'Rarely — I think of ancient cycles, chakras, and contemplative study', detail: 'archetypal orientation', score: -1 },
          { text: 'Never — I see it simply as three digits with high visual symmetry', detail: 'zero commercial conditioning', score: -2 }
        ]
      },
      {
        id: 'underlying_need',
        q: 'What is the real underlying need fueling your interest in 777?',
        hint: 'Points toward what actually brings resolution.',
        options: [
          { text: 'Relief from exhaustion — knowing my prolonged struggle wasn’t in vain', detail: 'exhaustion validation', score: 'exhaustion_relief' },
          { text: 'A green light to make a risky investment or life gamble', detail: 'risk validation', score: 'risk_greenlight' },
          { text: 'Deep spiritual clarity and alignment with my true path', detail: 'spiritual clarity', score: 'spiritual_path' },
          { text: 'Practical financial stability so I can stop worrying about money', detail: 'financial stability', score: 'financial_security' },
          { text: 'To understand why my brain is catching this specific number', detail: 'intellectual curiosity', score: 'cognitive_curiosity' }
        ]
      },
      {
        id: 'advisor_preference',
        q: 'If you consulted an advisor about this, what kind of counsel would you value?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A tarot reading exploring the Seven of Pentacles (evaluating long-term harvest)', detail: 'strategic tarot', score: 'tarot' },
          { text: 'An astrology reading examining Jupiter transits and cycles of expansion', detail: 'astrological cycles', score: 'astrology' },
          { text: 'An intuitive psychic reading on current spiritual momentum', detail: 'intuitive perspective', score: 'psychic' },
          { text: 'A financial planner or credit counselor to fix practical cash flow', detail: 'practical financial coaching', score: 'financial' },
          { text: 'Solitary reflection tools and zero paid reading sales pitches', detail: 'independent self-work', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.jackpot_mindset || 0) + (a.risk_behavior || 0) + (a.wisdom_orientation || 0) + (a.cultural_conditioning || 0);
      if (a.risk_behavior >= 1 || a.jackpot_mindset === 2) {
        return 'jackpot_magical_thinking';
      }
      if (a.cultural_conditioning >= 1 && a.wisdom_orientation >= 1) {
        return 'cultural_conditioning';
      }
      if (a.underlying_need === 'risk_greenlight') {
        return 'decision_validation_seeking';
      }
      if (s <= -1 && a.wisdom_orientation <= -1) {
        return 'introspective_wisdom';
      }
      return 'attentional_clustering';
    },

    results: {
      'introspective_wisdom': {
        title: 'Introspective Wisdom',
        summary: 'Approaching 777 as the sacred archetype of contemplation, study, and quiet discernment.',
        whatAnswersSuggest: [
          'You hold an honorable and mature connection with the number 7. Rather than chasing casino-style windfalls, you connect with the ancient esoteric meaning of the 7: the philosopher, the Hermit, and the patient student of life.',
          'When 777 appears, it serves as an intuitive reminder to step back from crowd noise, honor the lessons you have earned through hardship, and cultivate quiet inner peace. You understand that real wealth is discernment.'
        ],
        whatItCannotProve: 'That your spiritual wisdom excuses you from practical financial planning or physical health maintenance.',
        whatToWatchNext: [
          'Carve out an afternoon for solitude, reading, or nature contemplation without screens or digital distractions.',
          'Review the hardest trial you survived in recent years and write down the three core lessons it taught you.'
        ]
      },
      'jackpot_magical_thinking': {
        title: 'Jackpot Magical Thinking',
        summary: 'Falling for the casino fallacy — hoping a miracle will rescue you from practical struggle.',
        whatAnswersSuggest: [
          'You are experiencing profound emotional or financial fatigue, which makes the promise of an effortless windfall deeply seductive. Pop culture has heavily commercialized 777 as the “jackpot,” and you are looking to the sky for rescue.',
          'Using 777 to justify buying lottery tickets, entering speculative financial schemes, or putting off necessary budgeting is dangerous. Numbers appearing on receipts do not alter the mathematical laws of probability.'
        ],
        whatItCannotProve: 'That an unexpected check will arrive to solve your debt without active financial discipline.',
        whatToWatchNext: [
          'Immediately halt all speculative betting or magical purchases based on angel numbers.',
          'Conduct an honest, grounded audit of your finances: face the numbers on your bank statement with courage.'
        ]
      },
      'cultural_conditioning': {
        title: 'Cultural Conditioning',
        summary: 'Noticing 777 because commercial media, billboards, and games have pre-loaded its salience.',
        whatAnswersSuggest: [
          'Your recurring sightings of 777 are heavily influenced by the fact that our culture is saturated with lucky-seven imagery. From slot machine ads to gasoline pricing, 777 is everywhere.',
          'Your brain’s pattern-detection network flags 777 because it carries high visual contrast and cultural baggage, not because a supernatural entity is flashing neon signs into your life.'
        ],
        whatItCannotProve: 'That commercialized lucky symbols carry objective cosmic power over your personal destiny.',
        whatToWatchNext: [
          'Notice how conditioned stimuli trigger automatic emotional responses, and practice observing numbers without projecting destiny onto them.',
          'Focus on building real, earned advantages in your career rather than hoping for superstitious luck.'
        ]
      },
      'decision_validation_seeking': {
        title: 'Decision Validation Seeking',
        summary: 'Searching for 777 to validate taking a gamble that your rational intellect questions.',
        whatAnswersSuggest: [
          'You are contemplating a major career, financial, or personal leap, but deep down, you know the foundation is shaky. You are hoping 777 appears to give you cosmic permission to jump.',
          'Using a number sighting to bypass rigorous scenario planning is an abdication of discernment. If a business plan or investment fails without a miracle, the plan is fundamentally flawed.'
        ],
        whatItCannotProve: 'That a high-risk venture is guaranteed to succeed just because you saw three sevens.',
        whatToWatchNext: [
          'Stress-test your plan: what is the worst-case scenario if this venture fails? Do you have the cash reserves to survive it?',
          'Make your decision based on data, risk tolerance, and ethics — not numerical omens.'
        ]
      },
      'attentional_clustering': {
        title: 'Attentional Clustering',
        summary: 'Dopamine reward anticipation and selective memory creating the illusion of a numerical sequence.',
        whatAnswersSuggest: [
          'Every time you see 777, you experience a mild spike in dopamine because the number is coded as a positive reward cue. This makes you remember every sighting vividly while forgetting the thousands of ordinary numbers you see daily.',
          'This clustering illusion is completely natural and harmless, provided it does not lead to reckless financial behavior or obsessive checking habits.'
        ],
        whatItCannotProve: 'That random occurrences in your day are coordinated by unseen beings.',
        whatToWatchNext: [
          'Take a deep breath and smile at the coincidence. Use the momentary pause to return your attention to whatever task is in front of you.',
          'Direct your mental focus toward high-leverage habits that produce durable long-term results.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'jackpot_magical_thinking' || a.jackpot_mindset >= 1) {
        return {
          key: 'exhaustion_from_struggle',
          label: 'The desperation of an exhausted nervous system craving rescue',
          text: 'When you have worked hard for years with little to show for it, hoping for a magical windfall is a completely understandable human defense against despair. But real relief will not come from a jackpot; it comes from restructuring your life so that your daily labor actually nourishes you.'
        };
      }
      if (p === 'decision_validation_seeking' || a.risk_behavior >= 1) {
        return {
          key: 'fear_of_failure',
          label: 'Outsourcing the blame for a high-risk decision',
          text: 'If you take a risky gamble and it fails, you bear the sting of regret. If you convince yourself “the universe gave me 777 so I had to do it,” you protect your ego from responsibility. Real power comes from owning both your risks and your outcomes.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'wisdom, life harvest, and long-term discernment', cluster: 'angel-numbers' }),

    matchPractice: function (a) {
      if (a.advisor_preference === 'tarot' || a.life_context === 'study') {
        return 'tarot_deep';
      }
      if (a.advisor_preference === 'astrology') {
        return 'tarot_decision';
      }
      if (a.advisor_preference === 'psychic') {
        return 'psychic';
      }
      if (a.advisor_preference === 'financial' || a.jackpot_mindset >= 1) {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, '777-meaning', {
        negativePatternTip: {
          pattern: 'jackpot_magical_thinking',
          text: 'when a psychic tells you 777 means you will win the lottery if you buy their lucky candle or charm, they are running a classic scam. Put that money into your savings account instead.'
        }
      });
    }
  },

  /* ----------------------------------------------------------
     555 MEANING — Transition, Disruption & Adaptive Change
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  '555-meaning': {
    id: '555-meaning',
    title: 'Why Is 555 on Your Mind?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are in an active readiness phase, experiencing anticipatory anxiety, restless from stagnation, or caught in attentional priming.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your 555 sightings — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'life_context',
        q: 'What impending change or stagnation coincided with 555 catching your eye?',
        hint: 'Sets the life stage for why transition symbolism feels poignant.',
        options: [
          { text: 'A job, career, or company that has become painfully suffocating', detail: 'feeling stuck in professional stagnation', score: 'career_stuck' },
          { text: 'A relationship that feels like it has reached an unavoidable threshold', detail: 'evolve or end crossroad', score: 'relationship_threshold' },
          { text: 'Desire to relocate, change lifestyles, or start completely over', detail: 'craving a radical clean slate', score: 'relocation' },
          { text: 'General anxiety that an unpredictable disruption is about to hit me', detail: 'free-floating dread of upheaval', score: 'anxiety_dread' },
          { text: 'Reading online posts claiming 555 means massive shifts are coming', detail: 'internet spiritual media engagement', score: 'media' }
        ]
      },
      {
        id: 'sighting_moment',
        q: 'When does 555 usually appear to you?',
        hint: 'Reveals whether the sighting is circadian habit or situational vigilance.',
        options: [
          { text: 'Glancing at my phone or computer clock at exactly 5:55', detail: 'end-of-workday circadian marker', score: 'clock_555' },
          { text: 'During moments of deep restlessness, boredom, or frustration', detail: 'chafing against current boundaries', score: 'restless_moment' },
          { text: 'Immediately after applying for a job, signing a lease, or sending a risky text', detail: 'action-threshold confirmation', score: 'action_moment' },
          { text: 'On order receipts, license plates, or random flight monitors', detail: 'everyday transit and retail encounters', score: 'transit' },
          { text: 'Completely at random with no recognizable pattern', detail: 'unpredictable spontaneous encounters', score: 'random' }
        ]
      },
      {
        id: 'transition_readiness',
        q: 'How ready do you feel to leave your familiar comfort zone behind?',
        hint: 'Evaluates whether you are embracing or resisting adaptation.',
        options: [
          { text: 'Terrified — desperately clinging to the familiar even though it hurts', detail: 'extreme status quo resistance', score: 2 },
          { text: 'Anxious — I know change is needed, but fear the unknown deeply', detail: 'reluctant anticipation', score: 1 },
          { text: 'Ambivalent — one foot in the old world, one foot testing the new', detail: 'threshold hesitation', score: 0 },
          { text: 'Mostly ready — willing to tolerate discomfort to build something better', detail: 'proactive courage', score: -1 },
          { text: 'Completely ready — excited and prepared for the next chapter', detail: 'full adaptive momentum', score: -2 }
        ]
      },
      {
        id: 'anticipatory_anxiety',
        q: 'How much dread or fear of catastrophe do you feel when you read that 555 means “massive upheaval”?',
        hint: 'Measures whether the symbol induces empowerment or panic.',
        options: [
          { text: 'Severe panic — constantly bracing for disaster, loss, or sudden catastrophe', detail: 'acute catastrophic thinking', score: 2 },
          { text: 'Noticeable unease — worried that forces outside my control will upend my life', detail: 'fatalistic anxiety', score: 1 },
          { text: 'Mild curiosity mixed with slight nervousness', detail: 'normal human caution', score: 0 },
          { text: 'Empowered — I view disruption as a necessary clearing of dead weight', detail: 'resilient mindset', score: -1 },
          { text: 'Zero dread — I know I am capable of adapting to whatever comes', detail: 'deep self-efficacy', score: -2 }
        ]
      },
      {
        id: 'practical_preparation',
        q: 'What concrete preparations have you made for your anticipated transition?',
        hint: 'Distinguishes grounded proactive coping from passive fatalism.',
        options: [
          { text: 'None — just waiting helplessly to see what happens to me', detail: 'complete passive fatalism', score: 2 },
          { text: 'Very little — overthinking scenarios without taking practical steps', detail: 'mental wheel-spinning', score: 1 },
          { text: 'A few preliminary inquiries or financial calculations', detail: 'initial scoping', score: 0 },
          { text: 'Active groundwork — saving funds, updating credentials, or talking openly', detail: 'disciplined preparation', score: -1 },
          { text: 'Comprehensive safety net and contingency plan fully in place', detail: 'exemplary proactive readiness', score: -2 }
        ]
      },
      {
        id: 'attribution_style',
        q: 'How do you internally explain the appearance of 555?',
        hint: 'Checks locus of control and agency.',
        options: [
          { text: '“The universe is dictating an inevitable upheaval for my destiny”', detail: 'external fatalism', score: 2 },
          { text: '“A sign that spiritual guides are shaking up my life”', detail: 'external guidance belief', score: 1 },
          { text: '“A reflection of my own subconscious restlessness and readiness to grow”', detail: 'psychological mirror', score: 0 },
          { text: '“Attentional salience — 5:55 is the end of the workday, so I glance at it”', detail: 'circadian observation', score: -1 },
          { text: '“Pure statistical coincidence that carries whatever meaning I give it”', detail: 'strict rational ownership', score: -2 }
        ]
      },
      {
        id: 'core_longing',
        q: 'What is the primary relief you are seeking right now?',
        hint: 'Identifies the core tension that needs resolving.',
        options: [
          { text: 'Reassurance that a coming change will not destroy my stability', detail: 'safety guarantee', score: 'safety_reassurance' },
          { text: 'The courage to finally quit, break away, or make a bold jump', detail: 'courage validation', score: 'courage_jump' },
          { text: 'A clear map showing what is waiting on the other side of the transition', detail: 'uncertainty elimination', score: 'clarity_map' },
          { text: 'Practical guidance on how to manage the logistical chaos of change', detail: 'logistical strategy', score: 'logistical_strategy' },
          { text: 'To stop feeling anxious and learn to tolerate ambiguity', detail: 'emotional resilience', score: 'emotional_resilience' }
        ]
      },
      {
        id: 'guidance_fit',
        q: 'If you consulted an outside advisor, what approach would serve you best?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A tarot reading exploring the Wheel of Fortune or Death (cycles & release)', detail: 'transition tarot', score: 'tarot' },
          { text: 'An astrology reading analyzing Uranus or Pluto transits for timing', detail: 'astrological timing', score: 'astrology' },
          { text: 'An intuitive psychic session to explore current momentum and blind spots', detail: 'intuitive read', score: 'psychic' },
          { text: 'A career coach or licensed counselor to navigate transition grief and planning', detail: 'practical coaching/therapy', score: 'coaching_therapy' },
          { text: 'Zero paid consultations — I prefer structured journaling and self-reflection', detail: 'independent self-work', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.transition_readiness || 0) + (a.anticipatory_anxiety || 0) + (a.practical_preparation || 0) + (a.attribution_style || 0);
      if (a.anticipatory_anxiety >= 1 && a.practical_preparation >= 1) {
        return 'anticipatory_anxiety';
      }
      if (a.attribution_style === 2 && a.practical_preparation >= 1) {
        return 'change_fatalism';
      }
      if (a.life_context === 'career_stuck' || a.life_context === 'relationship_threshold') {
        return 'readiness_mirror';
      }
      if (s <= -1 && a.transition_readiness <= -1) {
        return 'readiness_mirror';
      }
      if (a.life_context === 'media' || a.attribution_style <= -1) {
        return 'attentional_priming';
      }
      return 'restlessness_seeking';
    },

    results: {
      'readiness_mirror': {
        title: 'Readiness Mirror',
        summary: '555 reflecting your own subconscious readiness to outgrow an expired life chapter.',
        whatAnswersSuggest: [
          'You are not the helpless victim of cosmic chaos. Sighting 555 is functioning as an honest mirror reflecting your internal dissatisfaction with the status quo.',
          'You already sense that a job, a relationship dynamic, or an outdated belief has run its course. The number is catching your attention because your nervous system is ready for growth, even if part of you is nervous about stepping into the unknown.'
        ],
        whatItCannotProve: 'That your transition will happen without effort, or that external circumstances will change without you making a move.',
        whatToWatchNext: [
          'Identify what is currently expired in your routine and name one concrete step to begin phasing it out.',
          'Focus on proactive preparation: build your financial runway, update your skills, and communicate your boundaries.'
        ]
      },
      'anticipatory_anxiety': {
        title: 'Anticipatory Anxiety',
        summary: 'Bracing for catastrophic disruption and projecting worst-case fears onto a neutral number.',
        whatAnswersSuggest: [
          'Reading that 555 means “massive upheaval” has triggered your catastrophic thinking. Instead of feeling empowered, your nervous system is on high alert, bracing for sudden loss, disaster, or chaos.',
          'This anticipatory anxiety exhausts your mental bandwidth. Remember that 555 has no magical power to harm your life; it is simply three digits that commercial spirituality has loaded with sensationalist drama.'
        ],
        whatItCannotProve: 'That an uncontrollable catastrophe is headed your way, or that you are powerless to protect yourself.',
        whatToWatchNext: [
          'Disconnect from fear-based angel number content on social media.',
          'Practice grounding your nervous system: identify three things in your immediate physical environment that are safe, stable, and working right now.'
        ]
      },
      'change_fatalism': {
        title: 'Change Fatalism',
        summary: 'Believing the universe is forcing upheaval upon you, abdicating your own choice and agency.',
        whatAnswersSuggest: [
          'You have adopted a fatalistic narrative where “the universe is shaking everything up and I just have to surrender.” While surrendering to what is truly outside your control is healthy, using it to excuse inaction is disempowering.',
          'You always retain choice over how you react, what standards you hold, and how you prepare. Do not let esoteric fatalism convince you that you are a passive passenger in your own life.'
        ],
        whatItCannotProve: 'That your choices do not matter or that divine forces will clean up the mess if you neglect your responsibilities.',
        whatToWatchNext: [
          'Reclaim the steering wheel: make a list of what you CAN control in this situation and take ownership of those actions.',
          'Refuse to let fear of the unknown paralyze your practical planning.'
        ]
      },
      'restlessness_seeking': {
        title: 'Restlessness Seeking',
        summary: 'Chafing against current stagnation and searching for an external signal to break the boredom.',
        whatAnswersSuggest: [
          'You feel an itch — a lingering restlessness that tells you that your current lifestyle or career has become mundane. Sighting 555 is an external focal point for that internal desire for novelty and challenge.',
          'Rather than waiting for an explosion, recognize that healthy adults introduce novelty consciously: learning a new discipline, traveling, or adopting creative hobbies.'
        ],
        whatItCannotProve: 'That you must blow up your entire life to feel inspired again.',
        whatToWatchNext: [
          'Channel this restless energy into constructive creative projects or physical training.',
          'Differentiate between healthy desire for growth and impulsive self-sabotage.'
        ]
      },
      'attentional_priming': {
        title: 'Attentional Priming',
        summary: 'Circadian clock habits and visual contrast making 555 stand out without existential crisis.',
        whatAnswersSuggest: [
          'You notice 555 largely because of the end-of-workday glance at your clock (5:55 PM) or normal visual pattern recognition. The number is eye-catching, and because you read about it online, your brain notes it.',
          'You are not experiencing severe emotional turbulence. Your pattern detection is operating normally without requiring deep spiritual deconstruction.'
        ],
        whatItCannotProve: 'That everyday clock glances are mystical directives.',
        whatToWatchNext: [
          'Enjoy the pleasant synchronicity as a mindful reminder to log off work and enjoy your evening.',
          'Keep your focus on tangible daily goals.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'anticipatory_anxiety' || a.anticipatory_anxiety >= 1) {
        return {
          key: 'fear_of_the_unknown',
          label: 'The terror of stepping out of the familiar into ambiguity',
          text: 'Humans are biologically wired to fear the unknown because predictability meant survival for our ancestors. Experiencing dread when facing transition is not a sign that the future is cursed; it is your ancient brain begging for certainty. Build that certainty through self-trust.'
        };
      }
      if (p === 'readiness_mirror' || a.transition_readiness <= -1) {
        return {
          key: 'grief_of_outgrowing',
          label: 'The quiet grief of leaving an old identity behind',
          text: 'Even positive transitions require a funeral for your former self. When you outgrow a job or relationship, you must mourn the comfort of who you used to be. Allow yourself to feel that quiet grief without assuming it means you made a mistake.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'life transitions, career pivots, and adaptive change', cluster: 'angel-numbers' }),

    matchPractice: function (a) {
      if (a.guidance_fit === 'tarot' || a.life_context === 'relationship_threshold') {
        return 'tarot_decision';
      }
      if (a.guidance_fit === 'astrology' || a.life_context === 'career_stuck') {
        return 'tarot_deep';
      }
      if (a.guidance_fit === 'psychic') {
        return 'psychic';
      }
      if (a.guidance_fit === 'coaching_therapy' || a.anticipatory_anxiety >= 1) {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, '555-meaning', {
        negativePatternTip: {
          pattern: 'change_fatalism',
          text: 'when a reader tells you that a disastrous upheaval is cosmically destined and you are powerless to stop it, walk away. They are weaponizing your fear to sell protection rituals.'
        }
      });
    }
  },

  /* ----------------------------------------------------------
     55. 888 MEANING — Reciprocity, Abundance & Karmic Stewardship
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  '888-meaning': {
    id: '888-meaning',
    title: 'Why Is 888 on Your Mind?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are conducting a reciprocity audit, experiencing a scarcity relief fantasy, falling for passive windfall expectations, or caught in attentional priming.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your 888 sightings — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'life_context',
        q: 'What financial or professional circumstances coincided with 888 appearing?',
        hint: 'Context clarifies whether it is economic stress or professional growth.',
        options: [
          { text: 'Heavy financial anxiety — debt, unpaid bills, or chronic scarcity', detail: 'intense pressure around material survival', score: 'scarcity' },
          { text: 'Building a business, negotiating a raise, or expanding a career', detail: 'proactive professional value creation', score: 'building' },
          { text: 'Feeling exhausted from giving too much energy to others with little return', detail: 'burnout and energetic depletion', score: 'depletion' },
          { text: 'Seeing prices ending in .88 or phone numbers with 888', detail: 'commercial and retail environments', score: 'retail' },
          { text: 'Engaging with prosperity gospel, money manifestation, or wealth posts online', detail: 'social media manifestation media', score: 'media' }
        ]
      },
      {
        id: 'sighting_moment',
        q: 'What thought pattern was active right before 888 caught your attention?',
        hint: 'Reveals the projection attached to the symbol.',
        options: [
          { text: '“I desperately need money to come from somewhere”', detail: 'scarcity relief longing', score: 'desperation' },
          { text: '“Am I charging what I am truly worth in my craft?”', detail: 'value and pricing self-inquiry', score: 'worth_check' },
          { text: '“Does this sign confirm that my hard work will finally pay off?”', detail: 'karmic harvest confirmation', score: 'harvest_check' },
          { text: '“Maybe this means I can afford this luxury purchase right now”', detail: 'spending justification impulse', score: 'spending_justification' },
          { text: 'Nothing special — just registered three eights on a license plate', detail: 'neutral visual observation', score: 'neutral' }
        ]
      },
      {
        id: 'financial_agency',
        q: 'How proactive and disciplined is your current approach to money?',
        hint: 'Distinguishes grounded stewardship from magical passivity.',
        options: [
          { text: 'Completely passive — avoiding looking at bank statements and hoping for a miracle', detail: 'financial avoidance', score: 2 },
          { text: 'Inconsistent — I worry constantly, but struggle to budget or track spending', detail: 'scarcity wheel-spinning', score: 1 },
          { text: 'Moderate — I know my basic numbers, but have noticeable leaks', detail: 'basic maintenance', score: 0 },
          { text: 'Active and disciplined — clear budget, emergency fund tracking, and debt reduction', detail: 'practical stewardship', score: -1 },
          { text: 'Masterful — strategic investing, clear pricing, and disciplined wealth building', detail: 'complete financial sovereignty', score: -2 }
        ]
      },
      {
        id: 'reciprocity_balance',
        q: 'How balanced is the exchange between the energy you expend and what you receive?',
        hint: 'The 8 represents the eternal loop of fair energetic exchange.',
        options: [
          { text: 'Grossly exploitative — giving 100% to clients or partners who give back scraps', detail: 'severe energy leak', score: 2 },
          { text: 'Under-compensated — working hard but under-charging or under-earning', detail: 'chronic undervaluation', score: 1 },
          { text: 'Fairly balanced with a few noticeable boundary leaks', detail: 'mostly functional reciprocity', score: 0 },
          { text: 'Healthy and mutually beneficial in almost all my contracts and relationships', detail: 'clean reciprocity loop', score: -1 },
          { text: 'Completely sovereign — I only engage in high-integrity, mutually rewarding exchanges', detail: 'masterful boundary alignment', score: -2 }
        ]
      },
      {
        id: 'magical_spending_risk',
        q: 'Have you used 888 as a reason to spend money you do not actually have?',
        hint: 'Examines magical thinking in personal finance.',
        options: [
          { text: 'Yes — made significant purchases or investments believing 888 guaranteed cash inflow', detail: 'active financial self-sabotage', score: 2 },
          { text: 'Felt tempted to spend recklessly because “abundance is on the way”', detail: 'scarcity relief impulse', score: 1 },
          { text: 'Hesitated, but decided to check my real bank balance first', detail: 'rational intervention', score: 0 },
          { text: 'No — I never make financial commitments based on numerical signs', detail: 'strict financial boundary', score: -1 },
          { text: 'Never — my spending is governed strictly by my budget and cash reserves', detail: 'complete financial realism', score: -2 }
        ]
      },
      {
        id: 'attribution_style',
        q: 'How do you explain the meaning of 888 when it appears?',
        hint: 'Checks whether the symbol is used for magic or for mastery.',
        options: [
          { text: '“A supernatural guarantee that wealth and windfalls are flowing to me”', detail: 'passive prosperity belief', score: 2 },
          { text: '“A sign that the universe wants me to be rich”', detail: 'external favoritism', score: 1 },
          { text: '“An audit of my reciprocity: cause, effect, value, and fair compensation”', detail: 'archetypal stewardship', score: 0 },
          { text: '“Attentional salience triggered by cultural marketing and financial stress”', detail: 'cognitive scarcity bias', score: -1 },
          { text: '“Pure coincidence — three symmetrical loops that pop into view”', detail: 'strict rational baseline', score: -2 }
        ]
      },
      {
        id: 'core_longing',
        q: 'What is the deepest desire behind your fascination with 888?',
        hint: 'Points toward the true emotional bottleneck.',
        options: [
          { text: 'An end to the exhausting terror of living paycheck to paycheck', detail: 'scarcity relief', score: 'scarcity_relief' },
          { text: 'Validation that my years of hard work, mastery, and sacrifice have value', detail: 'karmic recognition', score: 'karmic_recognition' },
          { text: 'The courage to raise my rates, ask for a raise, or demand fair treatment', detail: 'worth claiming', score: 'worth_claiming' },
          { text: 'Practical, no-nonsense tools to build wealth and eliminate debt', detail: 'financial education', score: 'financial_education' },
          { text: 'Understanding why my brain keeps latching onto repeating eights', detail: 'cognitive curiosity', score: 'cognitive_curiosity' }
        ]
      },
      {
        id: 'advisor_preference',
        q: 'If you sought outside perspective on your career and wealth, what would you respect most?',
        hint: 'Matches your situation to the right tool.',
        options: [
          { text: 'A tarot reading exploring the Eight of Pentacles (mastery, craft, fair compensation)', detail: 'career-focused tarot', score: 'tarot' },
          { text: 'An astrology reading analyzing my 2nd, 8th, and 10th Houses (wealth & career cycles)', detail: 'astrological vocational timing', score: 'astrology' },
          { text: 'An intuitive psychic session to explore business momentum and energy leaks', detail: 'intuitive perspective', score: 'psychic' },
          { text: 'A certified financial counselor or business coach to audit real cash flow', detail: 'practical financial coaching', score: 'financial_coach' },
          { text: 'Free self-inquiry frameworks and zero paid sales pitches', detail: 'independent self-work', score: 'free_tools' }
        ]
      }
    ],

    resolve: function (a) {
      var s = (a.financial_agency || 0) + (a.reciprocity_balance || 0) + (a.magical_spending_risk || 0) + (a.attribution_style || 0);
      if (a.magical_spending_risk >= 1 || (a.attribution_style === 2 && a.financial_agency >= 1)) {
        return 'passive_windfall_expectation';
      }
      if (a.life_context === 'scarcity' || a.financial_agency >= 1) {
        return 'scarcity_relief_fantasy';
      }
      if (a.reciprocity_balance >= 1 || a.core_longing === 'worth_claiming') {
        return 'reciprocity_audit';
      }
      if (s <= -1 && a.attribution_style <= 0) {
        return 'reciprocity_audit';
      }
      if (a.life_context === 'media' || a.life_context === 'retail') {
        return 'attentional_priming';
      }
      return 'karmic_overthinking';
    },

    results: {
      'reciprocity_audit': {
        title: 'Reciprocity Audit',
        summary: 'Approaching 888 as a master audit of cause and effect, energetic exchange, and fair compensation.',
        whatAnswersSuggest: [
          'You hold a deeply grounded connection to the archetype of the eight. Rather than treating 888 as a magic lottery ticket, you recognize it as the universal symbol of the infinity loop: what you invest must yield a sustainable, honorable return.',
          'You are being called to audit your balance sheet — not just your finances, but your energetic boundaries. Where are you over-giving and under-charging? Where are you allowing your skills to be exploited? 888 is your prompt to demand fair exchange.'
        ],
        whatItCannotProve: 'That employers or clients will automatically raise your pay without you negotiating directly.',
        whatToWatchNext: [
          'Calculate your true hourly rate or value contribution and identify one area where your pricing needs to increase.',
          'Firmly plug one energetic or financial leak where you are giving value without fair reciprocity.'
        ]
      },
      'scarcity_relief_fantasy': {
        title: 'Scarcity Relief Fantasy',
        summary: 'An overtaxed brain using 888 as an emotional safety valve to escape the terror of debt.',
        whatAnswersSuggest: [
          'Your recurring sightings of 888 are rooted in chronic economic stress or debt. As behavioral economics shows, poverty and financial precarity consume massive mental bandwidth, driving the subconscious to search for rescue signals.',
          'Believing that 888 means “wealth is rushing in” brings a temporary chemical dopamine exhale, but it does not pay rent. Do not let comforting fantasies distract you from taking the hard, practical steps required to build financial security.'
        ],
        whatItCannotProve: 'That a windfall will clear your debt without budgeting, saving, and earning.',
        whatToWatchNext: [
          'Face your real numbers: write down all debts, minimum payments, and essential expenses on a single sheet of paper.',
          'Contact a non-profit credit counseling agency if debt feels insurmountable. Real help exists in the physical world.'
        ]
      },
      'passive_windfall_expectation': {
        title: 'Passive Windfall Expectation',
        summary: 'Falling into dangerous magical thinking and using 888 to justify irresponsible spending.',
        whatAnswersSuggest: [
          'You have absorbed harmful prosperity gospel advice telling you to “act like you are already rich when you see 888.” This mindset frequently leads vulnerable people into credit card debt or speculative gambles.',
          'True material mastery (the essence of the number 8) is built on patient craftsmanship, living below your means, and compounding value. Stop waiting for unearned riches and start stewarding the resources you have.'
        ],
        whatItCannotProve: 'That spending money you don’t have will magically trigger wealth inflow.',
        whatToWatchNext: [
          'Freeze all discretionary spending for the next 7 days.',
          'Audit your recent impulse purchases and recognize the emotional insecurity they were trying to soothe.'
        ]
      },
      'karmic_overthinking': {
        title: 'Karmic Overthinking',
        summary: 'Obsessing over whether past actions have created “money blocks” or karmic debt.',
        whatAnswersSuggest: [
          'You are over-analyzing your financial struggles through an esoteric karmic lens, wondering if you have an ancestral curse or a “poverty frequency.”',
          'Economic inequality and financial struggles are largely structural and behavioral — not karmic punishments. Stop shaming your spiritual state and start building practical, high-value vocational skills.'
        ],
        whatItCannotProve: 'That your soul has a “poverty contract” requiring paid spiritual cleansings.',
        whatToWatchNext: [
          'Discard all ideas of financial curses or ancestral money blocks.',
          'Focus on learning one high-income skill (sales, coding, writing, negotiation) that the market genuinely rewards.'
        ]
      },
      'attentional_priming': {
        title: 'Attentional Priming',
        summary: 'Commercial pricing (.88) and cultural conditioning highlighting eights on retail displays.',
        whatAnswersSuggest: [
          'You encounter 888 frequently because retail prices, gas stations, and Chinese cultural businesses heavily feature repeating eights. Your visual system flags the symmetrical loops naturally.',
          'You are not experiencing an existential financial crisis; your brain is simply cataloging patterns in a consumer environment.'
        ],
        whatItCannotProve: 'That commercial price tags contain personalized messages about your net worth.',
        whatToWatchNext: [
          'Enjoy the satisfying symmetry of the number without needing to decode a supernatural fortune.',
          'Stay focused on executing your daily professional responsibilities with excellence.'
        ]
      }
    },

    underneath: function (a, p) {
      if (p === 'scarcity_relief_fantasy' || a.life_context === 'scarcity') {
        return {
          key: 'terror_of_destitution',
          label: 'The physical dread of poverty and running out of survival resources',
          text: 'Living under constant financial scarcity creates chronic nervous system trauma. Wanting a miracle is a tender, completely understandable cry for safety. Honor that need by building real financial safety nets with self-compassion and realistic patience.'
        };
      }
      if (p === 'reciprocity_audit' || a.reciprocity_balance >= 1) {
        return {
          key: 'fear_of_charging_worth',
          label: 'The imposter fear of demanding fair compensation',
          text: 'Many conscientious people feel deep guilt around charging money for their gifts. You over-give because you fear being labeled greedy or rejected. True spiritual maturity recognizes that fair compensation is not greed; it is the boundary that allows your work to endure.'
        };
      }
      return null;
    },

    practice: window.topicPracticeSet({ topic: 'career mastery, fair exchange, and financial stewardship', cluster: 'angel-numbers' }),

    matchPractice: function (a) {
      if (a.advisor_preference === 'tarot' || a.life_context === 'building') {
        return 'tarot_decision';
      }
      if (a.advisor_preference === 'astrology') {
        return 'tarot_deep';
      }
      if (a.advisor_preference === 'psychic') {
        return 'psychic';
      }
      if (a.advisor_preference === 'financial_coach' || a.life_context === 'scarcity') {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, '888-meaning', {
        negativePatternTip: {
          pattern: 'passive_windfall_expectation',
          text: 'when a reader tells you that 888 means you should spend your last dollars on an expensive wealth ceremony, they are preying on your vulnerability. Keep your money and pay your bills.'
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

const updatedContent = content.slice(0, lastClosingIndex) + batch2Quizzes + '\n' + content.slice(lastClosingIndex);
writeFileSync(quizzesPath, updatedContent, 'utf8');
console.log('Successfully appended 5 Batch 2 quizzes to assets/js/quizzes.js!');
