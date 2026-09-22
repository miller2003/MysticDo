import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const quizzesPath = path.resolve(__dirname, '../assets/js/quizzes.js');
let content = readFileSync(quizzesPath, 'utf8');

const batch4Quizzes = `
  /* ----------------------------------------------------------
     61. DREAM ABOUT SOMEONE DYING — Transition, Loss & Shadow
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'dream-about-someone-dying': {
    id: 'dream-about-someone-dying',
    title: 'Why Did You Dream Someone Died?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether your dream reflects a relational transition, acute separation anxiety, suppressed friction, or catastrophic premonition panic.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your death dream — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'who_died',
        q: 'Who was the person who died in your dream?',
        hint: 'The identity points directly to the relational or symbolic domain.',
        options: [
          { text: 'A parent or older authority figure who raised me', detail: 'anchors of identity and safety', score: 'parent' },
          { text: 'My romantic partner or spouse', detail: 'primary attachment and intimacy bond', score: 'partner' },
          { text: 'My child or someone I am responsible for protecting', detail: 'vulnerability and caregiving focus', score: 'child' },
          { text: 'A close friend, sibling, or peer', detail: 'equality, companionship, or social identity', score: 'friend' },
          { text: 'An acquaintance, celebrity, or a stranger', detail: 'symbolic projection of an inner trait', score: 'symbolic' }
        ]
      },
      {
        id: 'dream_emotion',
        q: 'What was your primary emotional experience inside the dream itself?',
        hint: 'The felt emotion inside sleep reveals the autonomic processing taking place.',
        options: [
          { text: 'Frantic, screaming panic — desperately trying to save them', detail: 'acute separation distress', score: 'panic' },
          { text: 'Quiet, solemn sorrow — a deep ache but an acceptance of finality', detail: 'integrative grief processing', score: 'acceptance' },
          { text: 'Shock followed by a strange, guilty sense of emotional relief or space', detail: 'boundary fatigue or suppressed friction', score: 'relief' },
          { text: 'Confusion and detachment — watching like an observer in a movie', detail: 'dissociative cognitive buffering', score: 'detachment' },
          { text: 'Horror at a premonition — convinced I was seeing future reality', detail: 'catastrophic omen interpretation', score: 'omen' }
        ]
      },
      {
        id: 'relational_shift',
        q: 'Is your real-world relationship with this person undergoing a significant transition?',
        hint: 'Death in dreams is the brain’s shorthand for the end of an era.',
        options: [
          { text: 'A massive change — someone moved, graduated, retired, or changed roles', detail: 'objective structural milestone', score: 2 },
          { text: 'We are gradually drifting apart as our adult lives evolve', detail: 'natural developmental drift', score: 1 },
          { text: 'No major change, our day-to-day dynamic has been fairly constant', detail: 'stable baseline', score: 0 },
          { text: 'We have been growing closer and more emotionally interdependent', detail: 'deepening intimacy and attachment', score: -1 },
          { text: 'I rarely see or speak to them; they belong mostly to my past', detail: 'historical or symbolic archetype', score: -2 }
        ]
      },
      {
        id: 'anxiety_load',
        q: 'How intense is your baseline waking anxiety about loss, health, or vulnerability?',
        hint: 'Measures sympathetic nervous system threat simulation.',
        options: [
          { text: 'Severe — I am hyper-vigilant and constantly terrified of losing loved ones', detail: 'chronic attachment terror', score: 2 },
          { text: 'Elevated — recent health scares or family aging have heightened my worry', detail: 'situational vulnerability', score: 1 },
          { text: 'Moderate — normal human concern for family, but manageable', detail: 'average anxiety baseline', score: 0 },
          { text: 'Low — I generally accept that life has natural beginnings and endings', detail: 'high existential resilience', score: -1 },
          { text: 'Very low — I rarely worry about death or physical harm', detail: 'stoic or compartmentalized baseline', score: -2 }
        ]
      },
      {
        id: 'unspoken_conflict',
        q: 'Is there unexpressed resentment, boundary fatigue, or suppressed friction between you?',
        hint: 'Shadow death dreams dramatize a desire for emotional space.',
        options: [
          { text: 'Yes — their demands or presence feel suffocating, but I cannot say it', detail: 'severe boundary suffocation', score: 2 },
          { text: 'A quiet, simmering frustration over unspoken differences', detail: 'mild unaddressed tension', score: 1 },
          { text: 'Minor normal disagreements, but our communication is honest', detail: 'clean relational hygiene', score: 0 },
          { text: 'Zero friction — our relationship is warm, loving, and supportive', detail: 'unambiguous positive bond', score: -1 },
          { text: 'Not applicable — they represent an internal idea rather than an active person', detail: 'pure symbolic projection', score: -2 }
        ]
      },
      {
        id: 'premonition_dread',
        q: 'How much are you obsessing that this dream is an actual psychic death warning?',
        hint: 'Distinguishes grounded reflection from superstitious panic.',
        options: [
          { text: 'Paralyzed by it — terrified that my thoughts or dreams will cause them harm', detail: 'severe magical thinking & dread', score: 2 },
          { text: 'Worried enough that I felt a strong urge to call and check their safety', detail: 'hyper-vigilant reassurance seeking', score: 1 },
          { text: 'Briefly unnerved, but I know dreams are symbolic, not telepathic', detail: 'grounded reality testing', score: 0 },
          { text: 'Completely unconcerned about physical harm; focused on what it means inside', detail: 'mature psychological reflection', score: -1 },
          { text: 'I view dreams purely as random neurological noise during REM sleep', detail: 'strictly reductionist perspective', score: -2 }
        ]
      },
      {
        id: 'what_needed',
        q: 'What kind of emotional reassurance or resolution would help you most right now?',
        hint: 'Intent clarifies the immediate next step.',
        options: [
          { text: 'Certainty that they are safe and this dream was not a premonition', detail: 'reassurance & cognitive grounding', score: 'safety_reassurance' },
          { text: 'Clarity on how to evolve our relationship boundaries as we both change', detail: 'relational maturation', score: 'boundary_maturation' },
          { text: 'Relief from chronic caregiver burnout or hyper-vigilant anxiety', detail: 'nervous system recovery', score: 'burnout_relief' },
          { text: 'A way to address unexpressed feelings or apologies before it’s too late', detail: 'direct communication', score: 'honest_dialogue' },
          { text: 'Understanding what part of my own identity or habits is ready to transform', detail: 'internal individuation', score: 'internal_transformation' }
        ]
      },
      {
        id: 'next_step_focus',
        q: 'How do you want to handle this dream as you move through your week?',
        hint: 'Identifies the appropriate integration container.',
        options: [
          { text: 'Reach out with love without mentioning the scary nightmare', detail: 'warm, non-alarmist connection', score: 'warm_outreach' },
          { text: 'Schedule a calm, honest conversation to reset a strained boundary', detail: 'boundary recalibration', score: 'boundary_reset' },
          { text: 'Work on calming my nervous system and challenging catastrophic loops', detail: 'cognitive & somatic grounding', score: 'somatic_grounding' },
          { text: 'Reflect through journaling or a symbolic lens on my own growth', detail: 'structured reflective inquiry', score: 'journaling' },
          { text: 'Let the dream go completely and return to my daily schedule', detail: 'natural settling', score: 'letting_go' }
        ]
      }
    ],

    results: {
      relational_transition: {
        name: 'Relational Transition & Role Evolution',
        summary: 'The dream marks the natural death of an old dynamic, not a person.',
        description: 'Your answers indicate that your relationship with this person is undergoing a significant life-stage shift. As roles evolve — whether through aging, physical distance, career changes, or emotional independence — the old version of how you related must pass away. Your subconscious dramatizes this closing chapter as a death so that an updated, mature connection can take its place.',
        supports: 'Acknowledging that relationships must change form to survive; grieving the past version while actively shaping the new dynamic.',
        cannotSettle: 'Whether the other person is ready to evolve at the same pace as you, or how long the transition will take.',
        watchNext: 'Notice where you are still treating this person like an earlier version of themselves. Allow them the space to be who they are today.',
        whatYourAnswersSuggest: 'The passing in your dream was a ceremonial farewell to an outdated role. Honor what that dynamic gave you, and welcome the adult terms of your connection now.'
      },
      separation_anxiety: {
        name: 'Acute Separation & Caregiver Vulnerability',
        summary: 'The dream reflects deep love coupled with autonomic terror of loss.',
        description: 'Your dream was an intense manifestation of threat simulation (Revonsuo, 2000). When you care deeply for someone and feel vulnerable to life’s uncertainties, your sleeping mind runs catastrophic drills to process the terrifying weight of attachment. Waking up in tears or panic is proof of your profound investment, exacerbated by fatigue, stress, or caregiver exhaustion.',
        supports: 'Validating how deeply you love this person while regulating your over-activated nervous system.',
        cannotSettle: 'Absolute guarantees about life’s longevity; trying to control uncertainty through compulsive checking.',
        watchNext: 'Watch for hyper-vigilant checking behaviors or hovering that smother the relationship. Practice somatic self-soothing when loss anxiety spikes.',
        whatYourAnswersSuggest: 'Your mind ran a worst-case scenario because your emotional stakes are so high. Treat the nightmare as a prompt for tender gratitude today, not an omen of doom.'
      },
      suppressed_conflict: {
        name: 'Suppressed Friction & Shadow Boundaries',
        summary: 'The dream represents an urgent subconscious wish for space or boundaries.',
        description: 'In dream psychology, dreaming of someone’s death often occurs when their presence, expectations, or demands are suffocating you in waking life. Because conscious guilt prevents you from acknowledging resentment or asking for space, your dreaming mind uses the total finality of death to dramatize the boundary you are afraid to set. It is not a death wish; it is a boundary wish.',
        supports: 'Recognizing that unexpressed anger is eroding your peace; planning an honest waking conversation to establish healthy emotional space.',
        cannotSettle: 'Whether the other person will like your new boundary, or whether they will react defensively.',
        watchNext: 'Notice moments of silent resentment during your next interaction with them. Practice communicating small preferences directly before resentment builds.',
        whatYourAnswersSuggest: 'Do not feel ashamed of your dream. Your psyche is signaling that an unsustainable dynamic must end. Set the boundary in waking life so your subconscious no longer has to stage it.'
      },
      symbolic_self: {
        name: 'Symbolic Ego-Death & Metamorphosis',
        summary: 'The person in your dream was a mirror for an aspect of your own psyche.',
        description: 'In depth psychology, people in dreams frequently serve as archetypal projections of the dreamer’s own traits. If you dreamed of an ambitious, disciplined, carefree, or vulnerable person dying, your subconscious is processing the shedding of an old persona, habit, or defense mechanism within yourself. You are outgrowing who you used to be.',
        supports: 'Embracing personal transformation; intentionally releasing outdated habits or self-protective personas that no longer serve you.',
        cannotSettle: 'What your new identity will look like in complete detail before you have lived it.',
        watchNext: 'Look at the three most prominent character traits of the person who died in your dream. Which of those traits are you actively changing in yourself?',
        whatYourAnswersSuggest: 'This dream was an internal graduation ceremony. Clear away the old self-concept to make room for your authentic emergence.'
      },
      premonition_panic: {
        name: 'Premonition Panic & Apophenic Dread',
        summary: 'You are caught in superstitious terror, mistaking a cognitive simulation for a prophecy.',
        description: 'Your answers indicate that the primary issue is not the dream itself, but the catastrophic meaning your waking mind has attached to it. Believing that a nightmare has telepathic power or acts as an omen creates acute paralysis and guilt. Cognitive science confirms that across billions of nightly dreams, random coincidences occur, but dreams possess zero precognitive authority.',
        supports: 'Immediate cognitive reality testing; disengaging from fear-based forums; practicing physical grounding in the present moment.',
        cannotSettle: 'Unfalsifiable supernatural claims designed to create panic or extract money for curse removals.',
        watchNext: 'Interrupt the thought loop whenever your brain whispers "what if it was a sign?" Say aloud: "It was a dream, not a prophecy."',
        whatYourAnswersSuggest: 'Your mind is tired and vulnerable. Refuse to give superstitious terror a foothold. Anchor yourself in the reality of your day.'
      }
    },

    practice: window.topicPracticeSet({ topic: 'dreams', cluster: 'general' }),

    resolve: function(answers) {
      if (answers.premonition_dread === 2) return 'premonition_panic';
      if (answers.unspoken_conflict >= 1 || answers.dream_emotion === 'relief') return 'suppressed_conflict';
      if (answers.anxiety_load >= 1 || answers.dream_emotion === 'panic') return 'separation_anxiety';
      if (answers.who_died === 'symbolic' || answers.relational_shift === -2) return 'symbolic_self';
      return 'relational_transition';
    },

    underneath: function(answers) {
      return 'Underneath the visceral horror of a death dream is the raw terror of vulnerability. Loving deeply means accepting that we cannot control the universe or keep the people we love frozen in time. Your dream held up a mirror to how deeply you care, or how urgently an old dynamic must transform.';
    },

    matchPractice: function(answers) {
      if (answers.premonition_dread >= 1) return 'reflective_tarot';
      if (answers.unspoken_conflict >= 1) return 'clarity_spread';
      if (answers.anxiety_load >= 1) return 'counseling_first';
      return 'journaling_prompt';
    },

    customResult: function(pKey, rKey, answers) {
      return null;
    }
  },

  /* ----------------------------------------------------------
     62. WHAT IS MY MOON SIGN — Somatics, Instincts & Blueprint
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'what-is-my-moon-sign': {
    id: 'what-is-my-moon-sign',
    title: 'What Does Your Moon Sign Inquiry Reveal?',
    launchSub: 'Eight questions, about two minutes. Surfaces your somatic self-soothing style, Sun-Moon internal dissonance, birth time precision, and healthy symbolic reflection.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your Moon sign inquiry — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'birth_data',
        q: 'How accurate is the birth time you have available for your chart?',
        hint: 'The Moon moves 13° per day; time precision determines the sign.',
        options: [
          { text: 'Exact minute from an official birth certificate or hospital record', detail: '100% astronomical precision', score: 'exact' },
          { text: 'Approximate time remembered by parents within an hour window', detail: 'moderate certainty', score: 'approx' },
          { text: 'Only know the time of day (morning, afternoon, or night)', detail: 'requires day-range check', score: 'window' },
          { text: 'Completely unknown — have only the date and location', detail: 'needs 12:01 AM vs 11:59 PM check', score: 'unknown' },
          { text: 'I already know my Moon sign, but want to understand what it means', detail: 'interpretive focus', score: 'known' }
        ]
      },
      {
        id: 'inquiry_reason',
        q: 'What prompted you to search for your Moon sign today?',
        hint: 'Context defines the psychological driver behind the inquiry.',
        options: [
          { text: 'My Sun sign describes my goals, but feels nothing like my private feelings', detail: 'internal dissonance', score: 'dissonance' },
          { text: 'Struggling with stress and trying to understand how to soothe myself', detail: 'emotional regulation needs', score: 'regulation' },
          { text: 'Relationship friction — my partner and I process emotions completely differently', detail: 'relational understanding', score: 'relationship' },
          { text: 'General astrological curiosity to complete my Big Three profile', detail: 'symbolic exploration', score: 'curiosity' },
          { text: 'Someone told me my Moon sign is cursed or incompatible with someone', detail: 'superstitious fear', score: 'fear' }
        ]
      },
      {
        id: 'sun_moon_split',
        q: 'How stark is the contrast between your outward social persona and private emotional state?',
        hint: 'Measures ego-persona vs somatic lunar divergence.',
        options: [
          { text: 'Radical divide — people think I am confident/breezy, but inside I am intensely sensitive', detail: 'deep internal polarization', score: 2 },
          { text: 'Noticeable difference — I filter my feelings heavily around acquaintances', detail: 'healthy selective vulnerability', score: 1 },
          { text: 'Moderate congruence — what you see is mostly what you get', detail: 'integrated self-expression', score: 0 },
          { text: 'Strong alignment — my emotional reactions directly mirror my outward behavior', detail: 'high behavioral transparency', score: -1 },
          { text: 'I have never felt any contradiction between my public and private self', detail: 'unpolarized expression', score: -2 }
        ]
      },
      {
        id: 'stress_coping',
        q: 'When you are emotionally overwhelmed, what does your nervous system instinctively crave?',
        hint: 'Points toward Earth/Water somatic retreat vs Fire/Air verbalization.',
        options: [
          { text: 'Total quiet, physical isolation, sensory dimming, and tactile comfort', detail: 'somatic containment (Earth/Water)', score: 2 },
          { text: 'A deep emotional release through tears, music, or heartfelt journaling', detail: 'emotional catharsis (Water)', score: 1 },
          { text: 'Vocalizing — talking it out with a trusted friend until thoughts settle', detail: 'cognitive dialogue (Air)', score: -1 },
          { text: 'Physical action, rapid problem-solving, or blowing off steam through movement', detail: 'expressive ventilation (Fire)', score: -2 },
          { text: 'Analyzing the problem objectively from 30,000 feet to find logic', detail: 'intellectual detachment (Air)', score: 0 }
        ]
      },
      {
        id: 'astro_attachment',
        q: 'How much do you lean on astrology to justify emotional outbursts or relationship choices?',
        hint: 'Distinguishes self-compassion from fatalistic excuses.',
        options: [
          { text: 'Heavily — I often say "I can’t help being harsh/cold, it’s my Moon sign"', detail: 'astrological excuse trap', score: 2 },
          { text: 'Sometimes I use it to explain why certain relationships feel impossible', detail: 'mild fatalistic attribution', score: 1 },
          { text: 'I use it as a fun, poetic framework for introspection, not an excuse', detail: 'healthy reflective use', score: 0 },
          { text: 'Very little — I believe personal character and communication matter far more', detail: 'grounded agency', score: -1 },
          { text: 'Zero — I am skeptical of astrology and only looking at this out of curiosity', detail: 'critical detachment', score: -2 }
        ]
      },
      {
        id: 'uncertainty_tolerance',
        q: 'If your birth time leaves your Moon on the cusp of two signs, how does that sit with you?',
        hint: 'Measures method anxiety vs lived experiential awareness.',
        options: [
          { text: 'Extremely frustrating — I need an exact technical verdict to know who I am', detail: 'high method anxiety', score: 2 },
          { text: 'A bit annoying, but I am willing to read both and see which fits', detail: 'mild perfectionism', score: 1 },
          { text: 'Fine — I understand that archetypes are lenses, not birthmarks', detail: 'comfortable ambiguity', score: 0 },
          { text: 'I don’t mind at all; my actual lived behavior tells me what I need to know', detail: 'high experiential grounding', score: -1 },
          { text: 'My birth time is verified to the exact minute, so this is not an issue', detail: 'unambiguous technical baseline', score: -2 }
        ]
      },
      {
        id: 'support_desired',
        q: 'What would you most like your Moon sign to help you understand about yourself?',
        hint: 'Intent clarifies the psychological goal.',
        options: [
          { text: 'Why I feel so deeply vulnerable and how to self-soothe effectively', detail: 'somatic regulation', score: 'self_soothing' },
          { text: 'How to reconcile my private emotional needs with my public ambition', detail: 'persona integration', score: 'persona_integration' },
          { text: 'How to communicate my needs to a partner who doesn’t understand me', detail: 'relational empathy', score: 'relational_communication' },
          { text: 'Confirmation of my intuitive strengths and emotional intelligence', detail: 'validation of sensitivity', score: 'validation' },
          { text: 'Just the technical calculation and its historical symbolic meaning', detail: 'factual knowledge', score: 'factual' }
        ]
      },
      {
        id: 'practical_goal',
        q: 'How do you plan to use this astrological placement moving forward?',
        hint: 'Identifies the real-world application.',
        options: [
          { text: 'Design realistic daily boundaries and self-care rituals that fit my temperament', detail: 'practical lifestyle design', score: 'lifestyle_design' },
          { text: 'Practice greater self-compassion when my emotional reactions differ from others', detail: 'self-compassion', score: 'self_compassion' },
          { text: 'Explore a detailed natal birth chart reading with an ethical astrologer', detail: 'professional synthesis', score: 'natal_reading' },
          { text: 'Use it as journaling prompts for personal reflection and shadow work', detail: 'journaling', score: 'journaling' },
          { text: 'Read it as an interesting curiosity, then get back to real life', detail: 'light engagement', score: 'light' }
        ]
      }
    ],

    results: {
      somatic_containment: {
        name: 'Somatic Containment & Grounded Recovery',
        summary: 'Your emotional nervous system requires physical sanctuary and quiet to reset.',
        description: 'Your answers indicate that your primary emotional regulation style relies on containment, sensory reduction, and physiological grounding. When stress strikes, intellectualizing or over-talking will not soothe you; your body demands physical safety, predictable environments, and restorative quiet. Recognizing this prevents you from feeling guilty when you need to pull back from social stimulation.',
        supports: 'Building non-negotiable quiet time into your calendar; honoring your body’s sensory signals; practicing restorative boundaries.',
        cannotSettle: 'Whether others in your life will understand your need for retreat without taking it personally.',
        watchNext: 'Watch for the line where restorative solitude curdles into avoidant isolation. Communicate your need for quiet clearly before disappearing.',
        whatYourAnswersSuggest: 'Your Moon placement speaks the language of the body. Give yourself permission to power down your nervous system without apologizing.'
      },
      expressive_processing: {
        name: 'Cognitive Externalization & Dialogue',
        summary: 'Your emotional equilibrium requires verbalization, movement, and expression.',
        description: 'You cannot metabolize intense emotions in silent isolation. Your answers reveal an emotional temperament that requires dialogue, creative release, rapid ideation, or physical action to process tension. Keeping feelings bottled up creates internal agitation, insomnia, or physical restlessness.',
        supports: 'Seeking trusted sounding boards; journaling rapidly without editing; using creative or physical outlets to discharge emotional energy.',
        cannotSettle: 'Expecting one single person to listen to every unedited thought; finding immediate logical answers to pure feelings.',
        watchNext: 'Notice whether your desire to talk through a problem is overwhelming a partner who needs quiet time to process. Respect different emotional speeds.',
        whatYourAnswersSuggest: 'Expression is your medicine. Find constructive containers — writing, therapy, movement, or trusted friendships — to let your inner feelings speak.'
      },
      persona_divide: {
        name: 'The Public Persona vs Private Self Divide',
        summary: 'A significant gap between your Sun persona and Moon vulnerability creates fatigue.',
        description: 'Your answers highlight a classic tension in psychological astrology: your Sun sign presents a capable, independent, or charismatic face to the world, while your Moon sign harbors private vulnerabilities, tender sensitivities, or exhaustion that you rarely show. Maintaining this divide consumes immense psychological energy and can lead to imposter syndrome.',
        supports: 'Accepting both sides of yourself as entirely legitimate; letting a few safe people see your unpolished, vulnerable interior.',
        cannotSettle: 'A magical life where you never feel tired or where you can be 100% transparent with everyone at work.',
        watchNext: 'Notice the moment you put on your "armor" before leaving the house. Acknowledge that the armor protects you, but you can take it off at home.',
        whatYourAnswersSuggest: 'You do not have to choose between your strength and your softness. Your Sun is your external vessel; your Moon is the water it holds.'
      },
      astro_excuse: {
        name: 'The Astrological Fatalism Trap',
        summary: 'You are risking using astrological archetypes as an excuse for poor boundaries or behavior.',
        description: 'Your answers reveal a tendency to lean on astrological placements to justify emotional reactivity, relationship anxiety, or communication breakdowns. While understanding your Moon sign fosters self-compassion, weaponizing it as an unchangeable identity label disempowers your personal agency and damages relationships.',
        supports: 'Shifting from "my Moon sign makes me do this" to "this is my instinctive tendency, and I am responsible for how I handle it."',
        cannotSettle: 'Using zodiac compatibility to decide whether to stay in a relationship or break up.',
        watchNext: 'Catch yourself the next time you use an astrological placement to deflect an apology or excuse emotional carelessness.',
        whatYourAnswersSuggest: 'The stars impel; they do not compel. Use the archetype as a mirror for conscious responsibility, not a shield against accountability.'
      },
      missing_time: {
        name: 'The Birth Time Discrepancy Impasse',
        summary: 'You are caught in technical perfectionism over an uncertain birth minute.',
        description: 'Your answers indicate frustration over not possessing an exact birth time, leaving your Moon potentially on the cusp between two adjacent signs. Astrological algorithms require precision, but psychological self-knowledge does not. Obsessing over whether your Moon is at 29° Taurus or 0° Gemini is less useful than examining how you actually cope under stress.',
        supports: 'Reading both candidate archetypes and testing which emotional regulation style matches your lived experience.',
        cannotSettle: 'An infallible astronomical degree without an official hospital birth certificate.',
        watchNext: 'Notice which sign description makes you feel truly seen in your private life, not just how you wish you were seen.',
        whatYourAnswersSuggest: 'You are more than a mathematical point in an ephemeris. Trust your lived reality over an elusive birth record.'
      }
    },

    practice: window.topicPracticeSet({ topic: 'astrology', cluster: 'general' }),

    resolve: function(answers) {
      if (answers.astro_attachment === 2) return 'astro_excuse';
      if (answers.birth_data === 'unknown' && answers.uncertainty_tolerance >= 1) return 'missing_time';
      if (answers.sun_moon_split >= 1) return 'persona_divide';
      if (answers.stress_coping >= 1) return 'somatic_containment';
      return 'expressive_processing';
    },

    underneath: function(answers) {
      return 'Underneath the technical search for your Moon sign is a simple human longing: the desire for permission to have your specific emotional needs. In a culture that demands constant composure, discovering your Moon archetype reassures you that your inner sensitivity has an ancient, legitimate logic.';
    },

    matchPractice: function(answers) {
      if (answers.astro_attachment >= 1) return 'counseling_first';
      if (answers.sun_moon_split >= 1) return 'natal_synthesis';
      if (answers.stress_coping >= 1) return 'grounding_ritual';
      return 'journaling_prompt';
    },

    customResult: function(pKey, rKey, answers) {
      return null;
    }
  },

  /* ----------------------------------------------------------
     63. WHAT IS MY SATURN RETURN — Maturation, Audit & Bedrock
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'what-is-my-saturn-return': {
    id: 'what-is-my-saturn-return',
    title: 'Where Do You Stand in Your Saturn Return?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are in a voluntary life audit, experiencing involuntary upheaval, facing heavy commitment, or paralyzed by transit dread.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your Saturn Return transit — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'age_bracket',
        q: 'What is your current age relative to the major 29.5-year developmental thresholds?',
        hint: 'Saturn Return occurs around ages 27.5–30.5 and ages 57–60.',
        options: [
          { text: 'Ages 27 to 28 — entering the initial threshold and feeling pressure', detail: 'first return: entry phase', score: 'entry_27' },
          { text: 'Ages 29 to 30 — directly in the peak exact transit', detail: 'first return: peak exact', score: 'peak_29' },
          { text: 'Ages 31 to 33 — integrating the aftermath and laying new foundations', detail: 'first return: integration', score: 'exit_31' },
          { text: 'Ages 56 to 60 — approaching or navigating the second Saturn Return', detail: 'second return: elderhood', score: 'second_58' },
          { text: 'Under 26 — researching ahead of time out of curiosity or anxiety', detail: 'preparatory research', score: 'under_26' }
        ]
      },
      {
        id: 'crisis_arena',
        q: 'Which area of your life is generating the most intense pressure or friction right now?',
        hint: 'Saturn concentrates structural pressure on one or two key domains.',
        options: [
          { text: 'Career and vocation — feeling like I climbed the completely wrong ladder', detail: 'professional structural crisis', score: 'career' },
          { text: 'Primary relationship — questioning long-term marriage or enduring a breakup', detail: 'relational commitment audit', score: 'relationship' },
          { text: 'Identity and boundaries — realizing my life was built to please parents/peers', detail: 'individuation crisis', score: 'identity' },
          { text: 'Heavy new responsibility — parenthood, homeownership, or leadership role', detail: 'constructive adult weight', score: 'commitment' },
          { text: 'General existential dread — everything feels heavy, serious, and urgent', detail: 'pervasive transit pressure', score: 'existential' }
        ]
      },
      {
        id: 'structural_audit',
        q: 'Are you voluntarily auditing what is broken in your life, or resisting necessary changes?',
        hint: 'Voluntary accountability softens the impact of structural maturation.',
        options: [
          { text: 'Voluntarily pruning — making hard choices to cut dead weight and false paths', detail: 'active conscious audit', score: 2 },
          { text: 'Aware of what needs to change, but dragging my feet out of fear', detail: 'hesitant awareness', score: 1 },
          { text: 'Paralyzed — terrified to make a move in case I destroy what security I have', detail: 'fear-based stagnation', score: 0 },
          { text: 'Resisting fiercely — trying to force an unsustainable job or partner to work', detail: 'active denial & resistance', score: -1 },
          { text: 'Involuntary collapse — a sudden firing, breakup, or crisis forced my hand', detail: 'external structural demolition', score: -2 }
        ]
      },
      {
        id: 'provisional_grief',
        q: 'How difficult has it been to say goodbye to the carefree experimentation of your twenties?',
        hint: 'Levinson’s research notes grief for lost potential as the core emotional obstacle.',
        options: [
          { text: 'Deeply painful — mourning the fantasy of having unlimited paths and time', detail: 'acute developmental grief', score: 2 },
          { text: 'Bittersweet — I miss the freedom, but I crave real stability and depth', detail: 'healthy maturation balance', score: 1 },
          { text: 'Neutral — I was ready for adult responsibility and welcomed the clarity', detail: 'smooth developmental transition', score: 0 },
          { text: 'Relieved — my twenties were chaotic and exhausting; I love the certainty', detail: 'relief from early-twenties instability', score: -1 },
          { text: 'Not applicable — I am facing the second return (auditing late-life legacy)', detail: 'second return perspective', score: -2 }
        ]
      },
      {
        id: 'responsibility_stance',
        q: 'When things go wrong in your life today, where does your accountability sit?',
        hint: 'Saturn demands radical personal ownership.',
        options: [
          { text: 'Fully on me — I recognize my choices created my current circumstances', detail: 'high adult sovereignty', score: 2 },
          { text: 'Mostly on me, though external economic or familial burdens are real', detail: 'balanced sober realism', score: 1 },
          { text: 'Split — I still feel like a victim of bad luck or other people’s whims', detail: 'emerging accountability', score: 0 },
          { text: 'External — I feel completely at the mercy of unfair circumstances', detail: 'victimhood trap', score: -1 },
          { text: 'Cosmic — I blame Saturn or my horoscope for punishing me', detail: 'superstitious fatalism', score: -2 }
        ]
      },
      {
        id: 'superstition_level',
        q: 'How much do you view your Saturn Return as an unavoidable cosmic curse or punishment?',
        hint: 'Distinguishes psychological maturation from astrological terror.',
        options: [
          { text: 'Terrified — I believe the universe is targeting me for catastrophe', detail: 'severe transit panic', score: 2 },
          { text: 'A bit superstitious — I get anxious reading scary astrological predictions', detail: 'mild pop-astrology dread', score: 1 },
          { text: 'Grounded — I see it as a symbolic framework for natural adult development', detail: 'mature symbolic lens', score: 0 },
          { text: 'Completely secular — I view it purely through developmental psychology', detail: 'strictly psychological view', score: -1 },
          { text: 'I have never heard of Saturn Return being described as a curse', detail: 'unbiased baseline', score: -2 }
        ]
      },
      {
        id: 'transition_goal',
        q: 'What structural change would bring the greatest integrity to your life right now?',
        hint: 'Intent clarifies the immediate adult objective.',
        options: [
          { text: 'Leaving an unfulfilling career track to pursue authentic work', detail: 'vocation realignment', score: 'career_pivot' },
          { text: 'Ending a mismatched relationship or setting firm boundaries with family', detail: 'relational honesty', score: 'relationship_boundary' },
          { text: 'Committing deeply to a long-term goal: home, marriage, or craft mastery', detail: 'permanent commitment', score: 'deep_commitment' },
          { text: 'Restoring my physical health and establishing sustainable daily routines', detail: 'somatic foundation', score: 'health_routines' },
          { text: 'Gaining perspective on my legacy and what truly matters at this age', detail: 'legacy & wisdom', score: 'legacy_wisdom' }
        ]
      },
      {
        id: 'support_preference',
        q: 'What kind of support or structure would help you navigate this threshold best?',
        hint: 'Identifies the appropriate decision container.',
        options: [
          { text: 'Practical mentorship from seasoned adults who have already crossed this river', detail: 'practical mentorship', score: 'mentorship' },
          { text: 'A skilled therapist to help untangle family-of-origin expectations', detail: 'clinical psychotherapy', score: 'therapy' },
          { text: 'An in-depth, grounded astrological transit reading focused on timing', detail: 'ethical astrological synthesis', score: 'transit_reading' },
          { text: 'A financial and lifestyle plan to prepare for a realistic career pivot', detail: 'practical financial planning', score: 'financial_plan' },
          { text: 'Solitude and journaling to clarify my personal moral code', detail: 'contemplative self-inquiry', score: 'journaling' }
        ]
      }
    ],

    results: {
      voluntary_audit: {
        name: 'The Voluntary Structural Pruning',
        summary: 'You are consciously shedding provisional life structures to build an authentic foundation.',
        description: 'Your answers indicate that you are engaging with your Saturn Return in the most constructive manner possible: voluntary accountability. You recognize that certain careers, relationships, or habits that suited your early twenties no longer align with your adult values. Rather than waiting for a crisis to force your hand, you are doing the difficult, mature work of making deliberate cuts.',
        supports: 'Trusting the clarity you have earned; taking decisive, phased steps to exit dead ends; building durable daily routines.',
        cannotSettle: 'Whether the transition will be entirely painless; growth always entails a period of friction.',
        watchNext: 'Do not second-guess your pruning. Trees only bear rich fruit when dead wood is cut away. Stay focused on your long-term bedrock.',
        whatYourAnswersSuggest: 'You are stepping fully into adult sovereignty. Treat this season not as a loss, but as the moment your real life begins.'
      },
      heavy_commitment: {
        name: 'The Heavy Anchor & Real Commitment',
        summary: 'Your Saturn Return is bringing permanent adult weight: marriage, home, or leadership.',
        description: 'Rather than experiencing collapse, your Saturn Return is demanding that you anchor down and commit. You are stepping into major life milestones — marriage, buying a home, having children, or taking on serious professional leadership. Saturn is the god of stone, structure, and permanence; you are laying down foundations meant to last decades.',
        supports: 'Embracing the weight of responsibility; developing steady discipline; letting go of the illusion that options must remain perpetually open.',
        cannotSettle: 'A completely stress-free experience; heavy commitments require sacrificing carefree impulse.',
        watchNext: 'Watch for exhaustion. Balance your heavy commitments with regular physical maintenance and honest boundary management.',
        whatYourAnswersSuggest: 'This is the noble face of Saturn: authority, enduring craft, and respected community standing. Carry the weight with pride.'
      },
      involuntary_crisis: {
        name: 'Denial & Involuntary Structural Collapse',
        summary: 'Resisting necessary maturation has resulted in external crisis or sudden breakdown.',
        description: 'Your answers reveal that you held onto an unsustainable job, relationship, or lifestyle long past its expiration date out of fear of uncertainty. Reality has now intervened through an abrupt layoff, breakup, or burnout. While this shock feels devastating, Saturn’s demolition is purposeful: it destroys what was built on sand so you can finally build on bedrock truth.',
        supports: 'Stopping the fight against reality; accepting the end as a liberating reset; seeking compassionate therapeutic and practical support.',
        cannotSettle: 'Resurrecting an arrangement that was fundamentally compromised from the start.',
        watchNext: 'Do not rush to reconstruct the exact same fragile structure with someone or somewhere else. Sit in the rubble until you understand what went wrong.',
        whatYourAnswersSuggest: 'The crisis was not malicious; it was an eviction notice from a house that was already collapsing. Grieve the ending, then begin building your true adult foundation.'
      },
      premature_panic: {
        name: 'The Anticipatory Transit Panic',
        summary: 'You are paralyzed by pop-astrology dread before the transit has even arrived.',
        description: 'You are under age 27 or caught in catastrophic social media loops, waiting in hyper-vigilant terror for Saturn to "ruin your life." Popular astrology sensationalizes this cycle to generate viral anxiety. In developmental reality, Saturn only tests what is already weak; if you live with integrity, work hard, and treat people fairly, the transit brings clarity, not doom.',
        supports: 'Disengaging from sensationalist astrology content; focusing on practical skill acquisition, savings, and emotional maturity today.',
        cannotSettle: 'Guaranteeing that life will never present unexpected challenges.',
        watchNext: 'Catch yourself catastrophizing. Replace "Saturn is going to punish me" with "I am learning how to be a responsible, sovereign adult."',
        whatYourAnswersSuggest: 'Turn down the volume on external panic. The best preparation for your late twenties is simply doing honest, decent work today.'
      },
      second_return: {
        name: 'The Second Return: Elderhood & Legacy',
        summary: 'Approaching age 58–60, you are transitioning from external conquest to enduring legacy.',
        description: 'Your answers reflect the second great Saturn milestone (ages 57–60). While the first return asks "How do I build my adult life?", the second return asks "What did my life stand for, and what wisdom will I leave behind?" This is the threshold of elderhood, retirement, facing bodily aging, and mentoring the next generation.',
        supports: 'Auditing your life with compassion; letting go of status games; investing energy in mentorship, creative legacy, and peace.',
        cannotSettle: 'Reliving your thirties or clinging to roles that belong to the first half of life.',
        watchNext: 'Celebrate the wisdom you have earned across six decades. Step gracefully into the role of respected guide and mentor.',
        whatYourAnswersSuggest: 'This is the harvest season of your life. Gather what is sweet, let go of past regrets, and focus on what truly endures.'
      }
    },

    practice: window.topicPracticeSet({ topic: 'astrology', cluster: 'general' }),

    resolve: function(answers) {
      if (answers.superstition_level === 2) return 'premature_panic';
      if (answers.age_bracket === 'second_58') return 'second_return';
      if (answers.structural_audit === -2 || answers.structural_audit === -1) return 'involuntary_crisis';
      if (answers.crisis_arena === 'commitment' || answers.transition_goal === 'deep_commitment') return 'heavy_commitment';
      return 'voluntary_audit';
    },

    underneath: function(answers) {
      return 'Underneath the anxiety about the Saturn Return is the profound grief of closing the door on infinite potential. In youth, you can pretend you could become anything; entering true adulthood means accepting that your time and choices are finite. Sacrificing the fantasy is painful, but it is the only way to build an authentic life.';
    },

    matchPractice: function(answers) {
      if (answers.structural_audit === -2) return 'counseling_first';
      if (answers.crisis_arena === 'career') return 'career_clarity';
      if (answers.superstition_level >= 1) return 'grounding_ritual';
      return 'natal_synthesis';
    },

    customResult: function(pKey, rKey, answers) {
      return null;
    }
  },

  /* ----------------------------------------------------------
     64. FEELING LOST IN LIFE — Liminality, Meaning & Action
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'feeling-lost-in-life': {
    id: 'feeling-lost-in-life',
    title: 'What Kind of Lost Are You?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether you are in a healthy liminal void, suffering physical burnout, facing an achievement hangover, or trapped in destiny paralysis.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your disorientation — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'trigger_event',
        q: 'What triggered this acute feeling of being unmoored or directionless?',
        hint: 'Context defines whether this is a transition, depletion, or disillusionment.',
        options: [
          { text: 'A major life milestone ended — graduated, divorced, moved, or left a career', detail: 'post-transition void', score: 'milestone_end' },
          { text: 'Achieved my long-term goals, but felt completely hollow once I got there', detail: 'achievement hangover', score: 'achievement_void' },
          { text: 'Chronic, grinding exhaustion that finally broke my ability to care', detail: 'burnout collapse', score: 'burnout' },
          { text: 'Realized I built my entire life around parental or social expectations', detail: 'discarded script', score: 'inherited_script' },
          { text: 'No single trigger — I have felt aimless and stuck for as long as I can recall', detail: 'chronic existential drift', score: 'chronic_drift' }
        ]
      },
      {
        id: 'daily_energy',
        q: 'How would you describe your baseline physical, nervous system, and emotional energy?',
        hint: 'Distinguishes clinical exhaustion from directional aimlessness.',
        options: [
          { text: 'Severely depleted — waking exhausted, struggling with basic chores or hygiene', detail: 'clinical exhaustion / depression', score: 'severe_depletion' },
          { text: 'Low and fluctuating — some days fine, other days heavy and sluggish', detail: 'moderate stress fatigue', score: 'low_fluctuating' },
          { text: 'Physical energy is okay, but my mind is foggy and lacks a focal point', detail: 'cognitive lack of focus', score: 'mental_fog' },
          { text: 'High restlessness — lots of nervous energy with nowhere meaningful to put it', detail: 'frustrated agency', score: 'restless' },
          { text: 'Normal physical health — I just genuinely don’t know what to do next', detail: 'pure directional uncertainty', score: 'normal_energy' }
        ]
      },
      {
        id: 'map_authenticity',
        q: 'Looking at the life you have lived so far, whose desires were you actually fulfilling?',
        hint: 'Feeling lost happens when you stop following someone else’s map.',
        options: [
          { text: 'Almost entirely external — pleasing parents, chasing prestige, or avoiding poverty', detail: 'pure externalized compliance', score: 2 },
          { text: 'Mostly external, though a few choices were genuinely mine', detail: 'partial authenticity', score: 1 },
          { text: 'An equal mix of practical compromise and personal curiosity', detail: 'balanced pragmatism', score: 0 },
          { text: 'Mostly mine, but my interests have fundamentally changed', detail: 'natural values evolution', score: -1 },
          { text: '100% mine — I followed my passion, and it simply didn’t pan out as expected', detail: 'creative disillusionment', score: -2 }
        ]
      },
      {
        id: 'ambiguity_comfort',
        q: 'How terrifying is it for you to sit in uncertainty without an immediate answer?',
        hint: 'Measures capacity to tolerate the liminal corridor.',
        options: [
          { text: 'Unbearable — I panic and want to latch onto any random job or relationship', detail: 'acute void intolerance', score: 2 },
          { text: 'Very uncomfortable — I spend hours every day desperately researching answers', detail: 'analytical hyper-vigilance', score: 1 },
          { text: 'Uncomfortable, but I can manage day-to-day routines while I wait', detail: 'moderate ambiguity tolerance', score: 0 },
          { text: 'I accept that this is a fallow season and am learning to sit with it', detail: 'healthy liminal acceptance', score: -1 },
          { text: 'I actually enjoy the open horizon, even if the lack of structure is strange', detail: 'high ambiguity tolerance', score: -2 }
        ]
      },
      {
        id: 'action_vs_rumination',
        q: 'How much of your week is spent actively testing small experiments vs lying in bed thinking?',
        hint: 'Action precedes clarity; rumination deepens the fog.',
        options: [
          { text: '100% rumination — paralyzed by analysis, taking zero real-world action', detail: 'severe analysis paralysis', score: 2 },
          { text: 'Mostly thinking, with an occasional frantic burst of job applications', detail: 'sporadic unfocused action', score: 1 },
          { text: 'Keeping my daily life moving, but not testing new paths yet', detail: 'stable maintenance holding', score: 0 },
          { text: 'Trying a few small micro-experiments (reading, classes, volunteering)', detail: 'active low-stakes exploration', score: -1 },
          { text: 'Taking consistent, deliberate steps every single week to explore options', detail: 'high experimental momentum', score: -2 }
        ]
      },
      {
        id: 'destiny_expectation',
        q: 'How much are you waiting for an external sign, psychic revelation, or sudden epiphany?',
        hint: 'Distinguishes active meaning-building from passive destiny traps.',
        options: [
          { text: 'Completely — I feel I cannot move until the universe gives me a definitive sign', detail: 'magical destiny trap', score: 2 },
          { text: 'Hoping for a sudden flash of clarity that will make everything obvious', detail: 'passive epiphany longing', score: 1 },
          { text: 'A balance — looking for alignment while knowing I have to make the choice', detail: 'grounded discernment', score: 0 },
          { text: 'Skeptical of signs — I recognize purpose is something I must build myself', detail: 'existential responsibility', score: -1 },
          { text: 'Zero expectation — I believe life has no intrinsic meaning except what I create', detail: 'existentialist sovereignty', score: -2 }
        ]
      },
      {
        id: 'relief_priority',
        q: 'What would bring you the greatest sense of emotional relief right now?',
        hint: 'Intent clarifies the immediate healing focus.',
        options: [
          { text: 'Permission to rest and stop feeling like an embarrassing failure', detail: 'self-compassion & rest', score: 'permission_rest' },
          { text: 'A clear, step-by-step framework to identify my core adult values', detail: 'values clarification', score: 'values_clarification' },
          { text: 'Physical restoration from deep burnout and chronic exhaustion', detail: 'nervous system repair', score: 'somatic_recovery' },
          { text: 'One small, practical experiment to test a new career or creative avenue', detail: 'micro-experimentation', score: 'micro_action' },
          { text: 'Professional clinical support to evaluate underlying depression', detail: 'clinical assessment', score: 'clinical_support' }
        ]
      },
      {
        id: 'next_step_style',
        q: 'How do you want to start building momentum out of this fog?',
        hint: 'Identifies the appropriate integration vehicle.',
        options: [
          { text: 'Shrink my horizon to the next 24 hours: sleep, walk, eat, and breathe', detail: 'immediate 24h grounding', score: 'grounding_24h' },
          { text: 'Conduct an honest audit of what I actually care about vs what others wanted', detail: 'values inventory', score: 'values_audit' },
          { text: 'Book an appointment with a licensed therapist or physician', detail: 'medical / clinical care', score: 'therapy' },
          { text: 'Engage in a reflective reading or journaling practice to explore blind spots', detail: 'structured reflective inquiry', score: 'journaling' },
          { text: 'Reach out to someone doing work I admire for an informal 15-minute chat', detail: 'informational connection', score: 'informational_chat' }
        ]
      }
    ],

    results: {
      liminal_reset: {
        name: 'The Healthy Liminal Reset',
        summary: 'You are in the natural threshold between an old chapter and an unwritten one.',
        description: 'Your answers indicate that you are experiencing classic liminality (Victor Turner, 1969). You have successfully closed an old life stage, but the next structure has not yet solidified. This disorientation is not a sign of failure; it is the natural, necessary pause of fallow ground in winter. Rushing to fill the void with random commitments will only recreate your past unhappiness.',
        supports: 'Granting yourself permission to pause; resting in the unknown; observing what natural curiosities begin to sprout when pressure is removed.',
        cannotSettle: 'What your complete life will look like five years from now; clarity emerges only through lived experience.',
        watchNext: 'Watch the urge to frantically latch onto the first job or partner that appears out of panic. Tolerate the quiet space.',
        whatYourAnswersSuggest: 'You are in the hallway between rooms. The old door closed; the new door has not yet opened. Breathe and trust the space.'
      },
      achievement_void: {
        name: 'The Achievement Hangover',
        summary: 'You reached the summit of an inherited mountain, only to find the view empty.',
        description: 'You did everything you were supposed to do — earned the degree, secured the job, or hit the societal milestones — but the promised fulfillment never arrived. This is the classic "arrival fallacy." Your disorientation is proof that extrinsic goals (prestige, parental approval, status) cannot satisfy intrinsic human needs for autonomy, creative mastery, and connection.',
        supports: 'Conducting an honest values audit; shifting from external performance to internal meaning; redefining what success looks like on your own terms.',
        cannotSettle: 'Instant gratitude for a life arrangement that fundamentally violates your values.',
        watchNext: 'Notice moments when you make decisions based on how they will look to other people on LinkedIn or social media. Choose what feels genuine instead.',
        whatYourAnswersSuggest: 'The ladder was leaning against the wrong wall. Coming down from that wall is not failure; it is the beginning of wisdom.'
      },
      burnout_fog: {
        name: 'Nervous System Depletion & Freeze',
        summary: 'Your feeling of being lost is actually severe physical and emotional exhaustion.',
        description: 'Your answers reveal that your primary crisis is not directional; it is physiological. When your nervous system is in chronic sympathetic overload or dorsal vagal shutdown, your prefrontal cortex loses the neurochemical capacity to imagine inspiring futures. You cannot solve a biological deficit of rest with more existential thinking.',
        supports: 'Prioritizing biological recovery: sleep, nutrition, therapeutic support, medical checkups, and ruthless reduction of non-essential demands.',
        cannotSettle: 'Making permanent life-demolishing decisions while your body is clinically depleted.',
        watchNext: 'Stop agonizing over your "10-year life purpose." Focus exclusively on restoring your physical baseline for the next 30 days.',
        whatYourAnswersSuggest: 'You are not broken, and you have not ruined your life. You are simply exhausted. Rest your body before you demand that your mind navigate.'
      },
      discarded_script: {
        name: 'The Discarded Inherited Script',
        summary: 'You have outgrown a life chosen to appease parents, mentors, or societal norms.',
        description: 'You feel lost because the script you followed for decades has finally expired. You were living out someone else’s definition of a successful life, and your soul has staged an honest rebellion. Stepping off the paved highway leaves you feeling disoriented, but this is the precise moment your authentic individuation begins.',
        supports: 'Celebrating the courage it takes to admit an inherited life does not fit; beginning the patient, rewarding task of discovering your own authentic values.',
        cannotSettle: 'Immediate approval from the family or mentors whose expectations you are leaving behind.',
        watchNext: 'Notice the voice of guilt whenever you consider what you actually want. Separate healthy adult ethics from childhood people-pleasing.',
        whatYourAnswersSuggest: 'You are not lost; you are finally free. Begin writing your own script, one small choice at a time.'
      },
      destiny_paralysis: {
        name: 'The Magical Destiny Paralysis',
        summary: 'You are stuck waiting for a mystical sign or certainty rather than taking action.',
        description: 'Your answers indicate that you are trapped in the "destiny myth" — the belief that purpose is a pre-packaged assignment waiting to be discovered, or that you must not move until a psychic or sign gives you 100% guarantees. In existential psychology, clarity never precedes action; clarity is the byproduct of taking small, imperfect steps in the real world.',
        supports: 'Giving up the illusion of certainty; launching low-stakes micro-experiments; taking responsibility for choosing a direction and testing it.',
        cannotSettle: 'Waiting for an external guru or sign to relieve you of the vulnerability of choosing.',
        watchNext: 'Catch yourself saying "I need to figure it all out before I start." Replace it with "I will take one small step today and see what happens."',
        whatYourAnswersSuggest: 'No cosmic messenger is coming to hand you a sealed envelope with your life purpose. Pick up the pen and write the first sentence yourself.'
      }
    },

    practice: window.topicPracticeSet({ topic: 'life-direction', cluster: 'general' }),

    resolve: function(answers) {
      if (answers.destiny_expectation === 2) return 'destiny_paralysis';
      if (answers.daily_energy === 'severe_depletion' || answers.trigger_event === 'burnout') return 'burnout_fog';
      if (answers.trigger_event === 'achievement_void') return 'achievement_void';
      if (answers.map_authenticity >= 1 || answers.trigger_event === 'inherited_script') return 'discarded_script';
      return 'liminal_reset';
    },

    underneath: function(answers) {
      return 'Underneath the ache of feeling lost is what existential philosophy calls the anxiety of freedom. As long as you are following someone else’s rules, you are protected from responsibility. Feeling lost is simply the vertigo that comes with realizing you are standing on open ground with the freedom to walk in any direction you choose.';
    },

    matchPractice: function(answers) {
      if (answers.daily_energy === 'severe_depletion') return 'counseling_first';
      if (answers.action_vs_rumination >= 1) return 'clarity_spread';
      if (answers.destiny_expectation >= 1) return 'grounding_ritual';
      return 'journaling_prompt';
    },

    customResult: function(pKey, rKey, answers) {
      return null;
    }
  },

  /* ----------------------------------------------------------
     65. AM I IN THE RIGHT CAREER — Burnout, Anchors & Alignment
     8 questions (2 context, 4 signal [-2..+2], 2 intent).
     ---------------------------------------------------------- */
  'am-i-in-the-right-career': {
    id: 'am-i-in-the-right-career',
    title: 'Career Check: Burnout, Stagnation, or Misalignment?',
    launchSub: 'Eight questions, about two minutes. Surfaces whether your career dissatisfaction is organizational burnout, structural values mismatch, a growth plateau, or the passion fantasy.',
    subtitle: 'Eight questions, about two minutes. A personalized read of your career alignment — what it suggests, what it doesn’t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'career_tenure',
        q: 'How long have you been working in your current profession or industry?',
        hint: 'Tenure distinguishes early-career friction from seasoned misalignment.',
        options: [
          { text: 'Less than two years — early in the learning curve', detail: 'early exploration / adjustment', score: 'early' },
          { text: 'Three to five years — established, fully competent in core tasks', detail: 'established competence', score: 'established' },
          { text: 'Six to ten years — mid-career, on track for leadership or seniority', detail: 'mid-career threshold', score: 'mid_career' },
          { text: 'Over ten years — deeply seasoned with significant sunk cost', detail: 'senior veteran', score: 'veteran' },
          { text: 'Recently pivoted into this field and having immediate buyer’s remorse', detail: 'post-pivot doubt', score: 'remorse' }
        ]
      },
      {
        id: 'primary_complaint',
        q: 'What is the single most draining or toxic part of your workday?',
        hint: 'Isolates task mismatch from organizational culture.',
        options: [
          { text: 'The core tasks themselves — I hate the actual day-to-day work', detail: 'task values misalignment', score: 'tasks' },
          { text: 'The company culture — impossible workload, toxic leadership, or no boundaries', detail: 'workplace burnout', score: 'culture' },
          { text: 'Total boredom — the work is easy, unchallenging, and monotonous', detail: 'growth plateau', score: 'boredom' },
          { text: 'The ethical mission — the industry creates outcomes I morally dislike', detail: 'ethical values crisis', score: 'ethics' },
          { text: 'Financial compensation — work is okay, but pay doesn’t match living costs', detail: 'economic deficit', score: 'compensation' }
        ]
      },
      {
        id: 'task_vs_culture',
        q: 'If your salary was 30% higher and your boss was great, would you enjoy the core work?',
        hint: 'The definitive test separating employer problems from career problems.',
        options: [
          { text: 'No — even under perfect conditions, I would still despise doing these tasks', detail: 'unambiguous career misalignment', score: 2 },
          { text: 'Probably not — the intellectual spark and curiosity are completely dead', detail: 'deep task disengagement', score: 1 },
          { text: 'Unsure — hard to tell because current exhaustion colors everything', detail: 'burnout interference', score: 0 },
          { text: 'Yes, likely — I find the underlying subject matter genuinely interesting', detail: 'employer / context problem', score: -1 },
          { text: 'Definitely yes — I love the craft itself; it’s the toxic environment killing me', detail: 'pure organizational burnout', score: -2 }
        ]
      },
      {
        id: 'boss_test',
        q: 'Look at the leaders two levels above you. Do you want their daily life in five years?',
        hint: 'Never climb a ladder if you don’t want to stand on the roof.',
        options: [
          { text: 'Absolutely not — their schedule, stress, and lifestyle look like prison', detail: 'wrong mountain entirely', score: 2 },
          { text: 'No — I respect them, but I have zero desire for their specific responsibilities', detail: 'functional role misalignment', score: 1 },
          { text: 'Mixed — parts of their job seem interesting, but other parts look miserable', detail: 'nuanced trade-offs', score: 0 },
          { text: 'Yes, mostly — with a few adjustments to protect personal boundaries', detail: 'viable directional alignment', score: -1 },
          { text: 'Definitely — that is the exact role and impact I am working toward', detail: 'clear career north star', score: -2 }
        ]
      },
      {
        id: 'career_anchor_alignment',
        q: 'How well does this career satisfy your primary Edgar Schein Career Anchor?',
        hint: 'Anchors: Autonomy, Technical Mastery, Security, Service, Creativity, Leadership.',
        options: [
          { text: 'Violently clashing — my core need (e.g. autonomy) is completely crushed here', detail: 'severe anchor violation', score: 2 },
          { text: 'Poorly — I have to suppress what I care about to survive here', detail: 'chronic compromise', score: 1 },
          { text: 'Moderately — meets some practical needs while leaving others hungry', detail: 'pragmatic trade-off', score: 0 },
          { text: 'Well — the role gives me what matters most, with normal friction', detail: 'solid anchor fit', score: -1 },
          { text: 'Extremely well — the work directly expresses my natural gifts and values', detail: 'high vocational harmony', score: -2 }
        ]
      },
      {
        id: 'runway_readiness',
        q: 'What does your realistic financial cushion and transferable skill bridge look like?',
        hint: 'Pragmatic leverage determines transition strategy.',
        options: [
          { text: 'Zero savings, living paycheck to paycheck — cannot afford an immediate leap', detail: 'financial survival constraint', score: 2 },
          { text: '1 to 2 months of expenses — would need to secure a job before giving notice', detail: 'cautious bridge required', score: 1 },
          { text: '3 to 6 months of living expenses saved — have a modest runway', detail: 'viable transition cushion', score: 0 },
          { text: 'Substantial savings or a partner who can support a transition period', detail: 'high financial runway', score: -1 },
          { text: 'Already have viable freelance clients or job offers in another field', detail: 'active transition momentum', score: -2 }
        ]
      },
      {
        id: 'ideal_shift',
        q: 'If you could change one structural element of your working life tomorrow, what would it be?',
        hint: 'Intent clarifies the true remedy needed.',
        options: [
          { text: 'A completely different profession that aligns with my genuine values', detail: 'career pivot', score: 'total_pivot' },
          { text: 'A healthy company culture with humane hours and respectful leadership', detail: 'employer change', score: 'culture_change' },
          { text: 'More challenging, high-visibility projects to pull me out of boredom', detail: 'growth advancement', score: 'growth_challenge' },
          { text: 'A three-month sabbatical to fully sleep, recover, and reset my nervous system', detail: 'burnout sabbatical', score: 'sabbatical_rest' },
          { text: 'Decoupling my identity from work so I don’t care so much about prestige', detail: 'internal boundary reframe', score: 'decouple_identity' }
        ]
      },
      {
        id: 'decision_horizon',
        q: 'What is your timeline for making a decisive, strategic move regarding your career?',
        hint: 'Identifies the appropriate action window.',
        options: [
          { text: 'Immediate — I am at a breaking point and need an exit strategy this week', detail: 'acute crisis intervention', score: 'immediate' },
          { text: 'Next 3 to 6 months — quietly building skills, savings, and applications', detail: 'structured strategic pivot', score: 'phased_pivot' },
          { text: 'Next 12 months — setting boundaries at work while exploring side projects', detail: 'deliberate exploration', score: 'exploration' },
          { text: 'No rush — just want an objective check on where my dissatisfaction sits', detail: 'reflective audit', score: 'reflective_audit' },
          { text: 'Staying put — committed to job crafting and improving the role I have', detail: 'job crafting commitment', score: 'job_crafting' }
        ]
      }
    ],

    results: {
      values_misalignment: {
        name: 'Structural Values Misalignment (Wrong Mountain)',
        summary: 'The core daily tasks and industry model violate your intrinsic values.',
        description: 'Your answers indicate that your dissatisfaction is not a temporary rough patch; it is structural misalignment. Even under ideal management and high pay, the fundamental nature of the work clashes with your Edgar Schein Career Anchor and personal conscience. Getting promoted in this field would only deepen your misery because you do not want your boss’s life.',
        supports: 'Accepting that this profession is finished for you; designing a structured, phased career pivot; mapping your transferable skills to an aligned field.',
        cannotSettle: 'Quitting tomorrow with zero savings; smart transitions require building the bridge before you cross.',
        watchNext: 'Do not succumb to the sunk cost fallacy. The years you spent studying or working here gave you valuable discipline; now take those skills to the right mountain.',
        whatYourAnswersSuggest: 'You are climbing a ladder leaned against the wrong building. Step down calmly and deliberately. Your authentic vocation awaits.'
      },
      workplace_burnout: {
        name: 'Acute Workplace Burnout (Right Work, Bad Context)',
        summary: 'You enjoy the underlying craft, but an unsustainable culture has crushed you.',
        description: 'Your answers reveal that your career itself is sound, but your current workplace is toxic, exhausting, or structurally broken. Under Christina Maslach’s framework, your issues center on Workload, Control, or Fairness, not Values. Quitting your entire profession would be a mistake; what you need is nervous system recovery and a change of employer.',
        supports: 'Establishing strict workplace boundaries immediately; taking medical leave or PTO; updating your resume to interview at healthy competing companies.',
        cannotSettle: 'Fixing a toxic boss or broken company culture through your individual extra effort.',
        watchNext: 'Notice the urge to burn everything down when you are exhausted. Treat your fatigue first; make major career decisions only when well-rested.',
        whatYourAnswersSuggest: 'The car is fine, but the road is full of nails. Don’t sell the car; change the road. Find an employer that respects your talent and humanity.'
      },
      growth_plateau: {
        name: 'The Growth Plateau (Outgrown the Container)',
        summary: 'The work is safe and easy, but your mind is restless and atrophying from boredom.',
        description: 'You are experiencing the "golden cage" of mastery. You have conquered the learning curve, your tasks have become routine, and the lack of challenge is causing chronic procrastination and low-grade depression. You don’t need to abandon your industry; you need higher stakes, fresh learning curves, or lateral leadership.',
        supports: 'Practicing active job crafting; pitching a new ambitious initiative; seeking advanced certifications or lateral departmental transfers.',
        cannotSettle: 'Waiting for management to magically notice your boredom and hand you an exciting project.',
        watchNext: 'Do not mistake comfortable safety for long-term security. Stagnating for years diminishes your market value. Step into healthy discomfort.',
        whatYourAnswersSuggest: 'You have outgrown your fishbowl. It is time to swim into deeper water, whether through a promotion, a new project, or a bolder role.'
      },
      passion_fantasy: {
        name: 'The Passion Fantasy Trap',
        summary: 'Expecting work to be an effortless paradise of pure joy creates chronic dissatisfaction.',
        description: 'Your answers indicate that your friction stems from unrealistic romanticization of professional labor. Every field — whether creative arts, medicine, software, or entrepreneurship — contains at least 30% tedious administration, difficult clients, and repetitive grind. Fleeing a career at the first sign of routine prevents you from achieving the mastery that generates true career passion.',
        supports: 'Reframing professional expectations; separating work identity from existential salvation; accepting that work is a contract of valuable effort.',
        cannotSettle: 'Finding a magical career where hard deadlines, bureaucracy, and routine never exist.',
        watchNext: 'Catch yourself daydreaming about idyllic alternative careers without researching their unglamorous daily realities.',
        whatYourAnswersSuggest: 'Passion follows mastery, not the other way around. Commit to developing rare and valuable skills, and deep career satisfaction will follow.'
      },
      golden_handcuffs: {
        name: 'The Golden Handcuffs Impasse',
        summary: 'Lifestyle inflation and financial security are trapping you in an unfulfilling role.',
        description: 'You are fully aware that your career is unsatisfying, but your salary, stock options, status, or debt load have created an intense fear of stepping away. You feel like a hostage to your own compensation. The problem is not a mystery of direction; it is a question of lifestyle design and economic freedom.',
        supports: 'Conducting a rigorous financial audit; calculating your true "freedom number"; creating a 12-month savings and debt-reduction plan to buy your autonomy.',
        cannotSettle: 'Leaving a high-paying career without first aligning your family and lifestyle overhead.',
        watchNext: 'Ask yourself: "What is my freedom and mental peace worth?" Trimming 15% of lifestyle overhead often unlocks complete vocational mobility.',
        whatYourAnswersSuggest: 'The cage door is not locked from the outside; it is locked from the inside. Build your financial runway, and the door will open.'
      }
    },

    practice: window.topicPracticeSet({ topic: 'career-work', cluster: 'general' }),

    resolve: function(answers) {
      if (answers.task_vs_culture === 2 || answers.primary_complaint === 'ethics') return 'values_misalignment';
      if (answers.task_vs_culture <= -1 || answers.primary_complaint === 'culture') return 'workplace_burnout';
      if (answers.primary_complaint === 'boredom') return 'growth_plateau';
      if (answers.runway_readiness === 2 && answers.career_tenure === 'veteran') return 'golden_handcuffs';
      return 'passion_fantasy';
    },

    underneath: function(answers) {
      return 'Underneath the agony of career doubt is a confrontation with identity and mortality. We spend the majority of our adult lives working; realizing that your daily effort does not serve what you value feels like a betrayal of your finite time. Decoupling your worth as a human being from your job title is the first step toward genuine sovereignty.';
    },

    matchPractice: function(answers) {
      if (answers.task_vs_culture === 2) return 'career_clarity';
      if (answers.task_vs_culture <= -1) return 'counseling_first';
      if (answers.runway_readiness === 2) return 'practical_audit';
      return 'clarity_spread';
    },

    customResult: function(pKey, rKey, answers) {
      return null;
    }
  },
`;

// Insert before the closing `};` of window.MYSTICDO_QUIZZES
const lastBraceIndex = content.lastIndexOf('};');
if (lastBraceIndex === -1) {
  console.error("Could not find closing '};' in assets/js/quizzes.js");
  process.exit(1);
}

const updatedContent = content.slice(0, lastBraceIndex) + batch4Quizzes + '\n};\n';
writeFileSync(quizzesPath, updatedContent, 'utf8');
console.log('Successfully appended 5 Batch 4 quizzes to assets/js/quizzes.js!');
