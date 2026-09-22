# append_batch1_quizzes.py
import sys
from pathlib import Path

quizzes_file = Path(r"c:\Users\samja\Desktop\site\mysticdo\assets\js\quizzes.js")
content = quizzes_file.read_text(encoding="utf-8")

# Verify end seam
target_tail = """    launchSub: 'Eight questions, about two minutes. It reads how much the uncertainty is costing you, whether your timeline is realistic, how clearly you\\u2019ve read fit, and how much weight this one outcome is carrying \\u2014 and ends on the step that fits.'
  },

};"""

if target_tail not in content:
    # Try normalized newlines
    normalized_content = content.replace("\r\n", "\n")
    target_tail_norm = target_tail.replace("\r\n", "\n")
    if target_tail_norm not in normalized_content:
        print("ERROR: target_tail not found in quizzes.js!")
        sys.exit(1)
    content = normalized_content
    target_tail = target_tail_norm

batch1_quizzes_code = """    launchSub: 'Eight questions, about two minutes. It reads how much the uncertainty is costing you, whether your timeline is realistic, how clearly you\\u2019ve read fit, and how much weight this one outcome is carrying \\u2014 and ends on the step that fits.'
  },

  /* ------------------------------------------------------------
     BATCH 1: LOSS & CLOSURE + MONEY & WEALTH
     ------------------------------------------------------------ */

  /* 1. SIGNS FROM DECEASED LOVED ONES */
  'signs-from-deceased-loved-ones': {
    id: 'signs-from-deceased-loved-ones',
    title: 'What Is Your Experience Asking For?',
    subtitle: 'Eight questions, about two minutes. It maps how you interact with signs, whether the experience brings peace or sustains an anxious loop, and what kind of support fits your grief.',
    launchSub: 'Eight questions, about two minutes. It reads whether your relationship to signs is bringing peace or sustaining an anxious loop, and matches you with a grounded next step.',
    questions: [
      {
        id: 'grief_stage',
        q: 'How long has it been since your loss, and how does your grief currently feel?',
        hint: 'Context first \\u2014 fresh loss and long-carried grief process symbolism differently.',
        options: [
          { text: 'Very recent (under 6 months) \\u2014 still in acute shock and waves', score: 'recent' },
          { text: '6 to 24 months \\u2014 adjusting to absence, but pain hits in sharp surges', score: 'transition' },
          { text: 'Several years on \\u2014 steady baseline, but an anniversary or reminder stirred it', score: 'integrated' },
          { text: 'A long-ago loss \\u2014 gentle reflection, looking back with perspective', score: 'distant' }
        ]
      },
      {
        id: 'encounter_type',
        q: 'What kind of encounter or sign prompted this question?',
        hint: 'Where the attention was caught.',
        options: [
          { text: 'An animal or bird encounter (cardinal, butterfly, unusual wildlife behavior)', score: 'animal' },
          { text: 'Sensory anomaly (a sudden whiff of perfume, pipe smoke, or feeling a presence)', score: 'sensory' },
          { text: 'An object or number (coins on the floor, stopped clocks, repeating numbers)', score: 'object' },
          { text: 'A vivid dream where they appeared healthy and spoke to you', score: 'dream' },
          { text: 'Nothing at all \\u2014 the complete silence is what is troubling you', score: 'silence' }
        ]
      },
      {
        id: 'emotional_effect',
        q: 'How do you usually feel in the hours after you notice a potential sign?',
        hint: 'The immediate emotional wake is the clearest signal of what the perception is doing.',
        options: [
          { text: 'Deeply comforted, warm, and able to return to my day with peace', detail: 'Comforting integration', score: 'comfort' },
          { text: 'A brief, sweet smile, then ordinary life resumes normally', detail: 'Gentle reflection', score: 'gentle' },
          { text: 'Brief relief, quickly replaced by analyzing whether it was \\u201Creal\\u201D', detail: 'Analysis loop', score: 'doubt' },
          { text: 'Intense longing or panic \\u2014 it re-opens the raw wound of their absence', detail: 'Anxiety spike', score: 'distress' },
          { text: 'I am not sure how to feel about it yet', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'scanning_habit',
        q: 'How often do you find yourself actively looking or waiting for signs?',
        hint: 'Spontaneous perception brings comfort; compulsive scanning produces anxiety.',
        options: [
          { text: 'Almost never \\u2014 encounters are completely spontaneous and unforced', detail: 'Organic occurrence', score: 'never' },
          { text: 'Occasionally, during emotional milestones or difficult days', detail: 'Milestone awareness', score: 'occasional' },
          { text: 'Daily \\u2014 I regularly scan clocks, sidewalks, or nature hoping for messages', detail: 'Frequent scanning', score: 'frequent' },
          { text: 'Constantly \\u2014 I feel anxious and abandoned if a few days pass with no sign', detail: 'Hyper-vigilant scanning', score: 'constant' },
          { text: 'It varies depending on my stress level', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'interpretation_weight',
        q: 'What meaning does your mind tend to attach to these moments?',
        hint: 'What is the sign being asked to carry?',
        options: [
          { text: 'A loving reminder that their impact and memory live on in my life', detail: 'Continuing bond', score: 'memory' },
          { text: 'A meaningful coincidence that provided a comforting pause', detail: 'Poetic synchronicity', score: 'coincidence' },
          { text: 'A message that they might be worried, troubled, or trying to warn me', detail: 'Worry projection', score: 'warning' },
          { text: 'Proof that I am forgiven for words left unsaid before they passed', detail: 'Guilt absolution', score: 'guilt' },
          { text: 'I am torn between believing and feeling skeptical', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'absence_distress',
        q: 'How does it feel when weeks go by and you experience no signs whatsoever?',
        hint: 'The quiet room reveals whether attachment security is intact.',
        options: [
          { text: 'Completely fine \\u2014 our connection lives in my heart, not in external events', detail: 'Secure baseline', score: 'secure' },
          { text: 'A little wistful, but I trust their love was real and complete', detail: 'Gentle longing', score: 'wistful' },
          { text: 'Worried that I am losing my connection or failing to remember them', detail: 'Memory panic', score: 'fear' },
          { text: 'Devastated \\u2014 I fear they have abandoned me or are angry with me', detail: 'Abandonment distress', score: 'abandoned' },
          { text: 'I have not had a long period of silence to test this', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'want',
        q: 'What are you most hoping to understand right now?',
        hint: 'Your real intention decides the practice fit.',
        options: [
          { text: 'Reassurance that they are at peace and that our love remains real', score: 'reassurance' },
          { text: 'Resolution for regrets, guilt, or things left unsaid before death', score: 'resolution' },
          { text: 'A perspective on how to carry their memory while rebuilding my life', score: 'direction' },
          { text: 'Evidential contact \\u2014 specific memories only they and I would know', score: 'contact' }
        ]
      },
      {
        id: 'help',
        q: 'What kind of support would honestly serve you best at this stage?',
        hint: 'Different stages need different kinds of holding.',
        options: [
          { text: 'A grounded framework to quiet the compulsive scanning and anxiety', score: 'framework' },
          { text: 'A session with an evidential medium, approached with healthy boundaries', score: 'medium' },
          { text: 'A structured reflective reading (like tarot) on my grief and next steps', score: 'tarot' },
          { text: 'A licensed grief counselor or peer support group for deep emotional holding', score: 'counseling' }
        ]
      }
    ],

    resolve: function (a) {
      if ((a.scanning_habit === 'constant' || a.scanning_habit === 'frequent') && (a.emotional_effect === 'distress' || a.emotional_effect === 'doubt')) {
        return 'hyper-vigilant';
      }
      if (a.interpretation_weight === 'guilt' || a.interpretation_weight === 'warning') {
        return 'guilt-projection';
      }
      if (a.absence_distress === 'abandoned' || a.absence_distress === 'fear') {
        return 'absence-distress';
      }
      if (a.emotional_effect === 'comfort' && (a.scanning_habit === 'never' || a.scanning_habit === 'occasional')) {
        return 'comforting-integration';
      }
      var nullCount = 0;
      if (a.emotional_effect === null) nullCount++;
      if (a.scanning_habit === null) nullCount++;
      if (a.interpretation_weight === null) nullCount++;
      if (a.absence_distress === null) nullCount++;
      if (nullCount >= 2) {
        return 'not-enough-evidence';
      }
      return 'quiet-reflection';
    },

    results: {
      'comforting-integration': {
        path: 'Comforting Integration',
        summary: 'Your encounters arrive organically and leave you with warmth, peace, and resilience.',
        suggest: function (a) {
          return 'Your answers describe a healthy continuing bond. When you notice a sign \\u2014 whether a bird, scent, or memory \\u2014 it functions as a moment of stillness and gratitude rather than an anxious hunt for proof. You do not rely on signs to survive, but welcome them as poetic reminders of enduring love.';
        },
        dontTell: 'It does not prove supernatural transmission in an empirical lab \\u2014 but in this pattern, scientific proof is unnecessary because the emotional comfort is self-contained and free of distress.',
        watchIntro: 'Continue anchoring your connection in living memory:',
        watch: function (a) {
          return [
            'Notice how natural memory brings the same peace as external signs \\u2014 their love lives in your neural architecture, not just on window ledges',
            'Protect this peace from commercial exploitation \\u2014 you do not need third-party readings to certify an experience that already feels whole',
            'Continue sharing stories of their life with others who remember them'
          ];
        }
      },
      'hyper-vigilant': {
        path: 'Hyper-Vigilant Scanning',
        summary: 'Looking for signs has quietly converted from a spontaneous comfort into an exhausting anxiety loop.',
        suggest: function (a) {
          return 'Your answers indicate that sign-seeking is carrying the weight of emotional avoidance. When the pain of physical absence feels unbearable, the mind begins scanning clocks, sidewalks, and nature compulsively, treating every coincidence as a lifeline. The problem is that the relief lasts only hours before the doubt returns.';
        },
        dontTell: 'More signs cannot heal the underlying grief \\u2014 compulsive scanning is an anxiety symptom that keeps the nervous system in suspended hyper-vigilance.',
        watchIntro: 'Steps to bring your nervous system back into safety:',
        watch: function (a) {
          return [
            'Set a gentle boundary with yourself: stop actively searching for signs for one full week',
            'Notice the physical anxiety that surfaces when you stop scanning \\u2014 that anxiety is the real grief asking to be felt and held',
            'Ground yourself in physical routines, walks, and conversations with trusted living friends'
          ];
        }
      },
      'guilt-projection': {
        path: 'Unresolved Guilt Projection',
        summary: 'Encounters are carrying the heavy burden of words left unsaid or caregiver regrets.',
        suggest: function (a) {
          return 'Your answers suggest that potential signs are triggering self-blame or fear that your loved one is troubled. This is almost never about their actual state \\u2014 it reflects your own waking moral guilt, deathbed trauma, or regrets about how things ended while they were alive.';
        },
        dontTell: 'No sign or external reading can absolve you \\u2014 absolution must come from understanding that human relationships are imperfect, and a lifetime of love is not defined by its final difficult days.',
        watchIntro: 'Ways to work with lingering guilt:',
        watch: function (a) {
          return [
            'Write an uncensored letter to them detailing everything you wish you had said or done differently, then keep it in a private box',
            'Recognize that a loved one who cared for you in life would not return to torment you with guilt from beyond',
            'Consider speaking with a licensed grief counselor to unpack caregiver trauma'
          ];
        }
      },
      'absence-distress': {
        path: 'Absence Distress',
        summary: 'The silence feels like abandonment, but it is the natural fatigue of an overwhelmed nervous system.',
        suggest: function (a) {
          return 'You are feeling devastated because days or months pass with zero signs or dreams, leading you to fear that the bond has vanished or that they are angry with you. In reality, perceiving subtle synchronicities requires spare cognitive bandwidth that deep grief completely drains.';
        },
        dontTell: 'Silence does not mean absence of love \\u2014 your loved one is not withholding affection; your brain is simply exhausted from processing profound loss.',
        watchIntro: 'How to hold the quiet room:',
        watch: function (a) {
          return [
            'Release the expectation of external theatrics \\u2014 their presence lives in your values, your habits, and your memories',
            'Prioritize physical rest, nourishment, and simple daily rhythms without demanding spiritual revelations',
            'Remember that grief comparison on social media is toxic: others posting about \\u201Cconstant signs\\u201D are often projecting their own vulnerability'
          ];
        }
      },
      'not-enough-evidence': {
        path: 'Unsettled Exploration',
        summary: 'You are in between skepticism and longing, with too many mixed feelings to form a fixed pattern.',
        suggest: function (a) {
          return 'Your answers show a mix of curiosity, doubt, and raw grief. You are trying to make sense of anomalous moments without wanting to surrender your rational mind. This ambiguity is completely normal in the landscape of bereavement.';
        },
        dontTell: 'You do not have to choose right now between cold materialism and total supernatural belief \\u2014 you can hold an experience as meaningful without declaring it a proven miracle.',
        watchIntro: 'What to observe over the coming weeks:',
        watch: function (a) {
          return [
            'Keep a private notebook of moments that catch your attention, noting what you felt without forcing an interpretation',
            'Notice whether your thoughts are leaning more toward practical recovery or spiritual searching',
            'Take your time \\u2014 grief does not follow an external schedule'
          ];
        }
      },
      'quiet-reflection': {
        path: 'Quiet Reflective Memory',
        summary: 'A gentle, steady relationship with their memory that needs no dramatic external validation.',
        suggest: function (a) {
          return 'Your answers reflect an understated, healthy balance. You notice occasional reminders of your loved one, smile with a mix of sweetness and sorrow, and continue living your life. The bond is quiet, internalized, and respectful of reality.';
        },
        dontTell: 'You do not need to seek out dramatic mediumship sessions \\u2014 your own quiet heart is already doing the work of continuing bonds beautifully.',
        watchIntro: 'Healthy ways to sustain this baseline:',
        watch: function (a) {
          return [
            'Trust the adequacy of quiet moments \\u2014 you do not need fireworks to have an authentic memorial connection',
            'Honor their life by practicing the qualities you most admired in them',
            'Share their stories with younger family members or friends who never met them'
          ];
        }
      }
    },

    underneath: function (a, p) {
      if (a.want === 'resolution' || p === 'guilt-projection') {
        return {
          key: 'unspoken_words',
          label: 'The weight of unfinished conversations',
          text: 'When someone dies unexpectedly or after painful estrangement, the mind reaches for signs as surrogate apologies. Naming the regret directly and working through it with compassion does more for your healing than hunting for external omens.'
        };
      }
      if (p === 'hyper-vigilant' || a.scanning_habit === 'constant') {
        return {
          key: 'avoidance_of_finality',
          label: 'Using signs to delay the finality of death',
          text: 'Compulsive scanning is often an unconscious attempt to keep the person physically here so you do not have to face the terrifying emptiness of stepping into a new life alone. Giving yourself permission to mourn the finality is the turning point.'
        };
      }
      if (a.absence_distress === 'abandoned' || p === 'absence-distress') {
        return {
          key: 'attachment_panic',
          label: 'The fear of being permanently erased',
          text: 'The silence of the room can trigger primal childhood fears of abandonment. Remind your nervous system that love given over a lifetime cannot be deleted by silence \\u2014 their imprint on you is permanent.'
        };
      }
      return null;
    },

    practice: {
      free_first: {
        name: 'The Continuing Bonds Framework',
        fit: 'For grounding your experience without spending money or falling into superstition.',
        href: '/questions/loss-closure/',
        cta: 'Explore the Loss & Closure Hub',
        secondary: { name: 'What Mediums Actually Do', fit: 'Consumer guide to reading vetting', href: '/guides/medium-reading-guide' },
        note: 'When grief is tender, free self-reflection and trusted friends are almost always safer than paid strangers.'
      },
      medium: {
        name: 'Evidential Medium Reading',
        fit: 'For exploring evidential connection and memories when you feel emotionally stable.',
        href: '/medium/',
        cta: 'Read how mediumship works',
        choose: { name: 'What Mediums Actually Do', href: '/guides/medium-reading-guide' },
        secondary: { name: 'Psychic vs Medium', fit: 'Why booking the wrong format is expensive', href: '/guides/psychic-vs-medium' },
        note: 'Never book a medium while in acute trauma or panic; wait until you have a stable emotional baseline.'
      },
      tarot_deep: {
        name: 'Tarot Reflection for Grief',
        fit: 'For structured symbolic exploration of your own emotional cycles and healing.',
        href: '/tarot/',
        cta: 'Explore reflective tarot',
        choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
        secondary: { name: 'The Daily Card', fit: 'Free daily self-reflection', href: '/tools/daily-card' },
        note: 'Tarot does not contact the dead \\u2014 it holds a mirror to your own grief processing.'
      },
      tarot_decision: {
        name: 'Grief Counseling / Support',
        fit: 'For deep, safe holding when loss is causing persistent depression, panic, or guilt.',
        href: '/questions/loss-closure/',
        cta: 'See grief support resources',
        secondary: { name: 'Dark Night of the Soul', fit: 'Spiritual crisis vs clinical depression', href: '/guides/dark-night-of-the-soul' },
        note: 'A reading cannot stabilize a nervous system in crisis; licensed therapists are the honest first call.'
      },
      closure: {
        name: 'Memorial Letter & Continuing Bonds',
        fit: 'For resolving unspoken words and finding peace through personal ritual.',
        href: '/questions/loss-closure/',
        cta: 'Read closure frameworks',
        secondary: { name: 'Do What Fits', fit: 'Comprehensive 7-question matcher', href: '/do-what-fits' },
        note: 'Personal ritual costs nothing and provides deeper closure than third-party consultations.'
      },
      general: {
        name: 'Do What Fits',
        fit: 'When you are not sure whether this is grief, existential crisis, or anxiety.',
        href: '/do-what-fits',
        cta: 'Take the 7-question matcher',
        secondary: { name: 'Questions Hub', fit: 'Explore all life questions', href: '/questions/' },
        note: 'A quick matcher that screens emotional readiness before recommending any guidance.'
      },
      psychic: {
        name: 'General Psychic Reading',
        fit: 'Not recommended for deceased loved ones \\u2014 psychics read the living, not the dead.',
        href: '/guides/psychic-vs-medium',
        cta: 'See why mediumship is required',
        choose: { name: 'Psychic vs Medium', href: '/guides/psychic-vs-medium' },
        secondary: { name: 'What Mediums Actually Do', fit: 'The right format for grief', href: '/guides/medium-reading-guide' },
        note: 'Booking a general psychic for a deceased loved one question is the #1 booking mistake in this category.'
      }
    },

    matchPractice: function (a) {
      if (a.help === 'counseling' || a.emotional_effect === 'distress') {
        return 'tarot_decision'; // Routes to grief counseling/support
      }
      if (a.help === 'medium' && (a.grief_stage === 'transition' || a.grief_stage === 'integrated')) {
        return 'medium';
      }
      if (a.help === 'tarot') {
        return 'tarot_deep';
      }
      if (a.want === 'resolution') {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'signs-from-deceased-loved-ones', {
        negativePatternTip: {
          pattern: 'hyper-vigilant',
          text: 'when scanning for signs becomes a daily compulsion, a reading promising \\u201Cproof\\u201D only deepens the dependency. Giving yourself permission to rest and mourn in quiet reality brings far more peace than chasing external omens.'
        }
      });
    }
  },

  /* 2. DREAM ABOUT A DECEASED LOVED ONE */
  'dream-about-deceased-loved-one': {
    id: 'dream-about-deceased-loved-one',
    title: 'What Is Your Grief Dream Surfacing?',
    subtitle: 'Eight questions, about two minutes. It maps the structure of your dream, how it aligns with your grief stage, and what internal resolution it is pointing toward.',
    launchSub: 'Eight questions, about two minutes. It reads whether your dream is serving emotional resolution, memory integration, or trauma replay, and matches you with a grounded next step.',
    questions: [
      {
        id: 'loss_timing',
        q: 'When did your loved one pass away?',
        hint: 'Dream architecture changes dramatically as bereavement matures.',
        options: [
          { text: 'Very recently (within the last 6 months)', score: 'fresh' },
          { text: 'Between 6 months and 2 years ago', score: 'mid' },
          { text: 'Several years ago', score: 'long' },
          { text: 'A decade or more ago', score: 'distant' }
        ]
      },
      {
        id: 'dream_appearance',
        q: 'How did they look and appear in your dream?',
        hint: 'The physical state in the dream reflects where your memory is anchored.',
        options: [
          { text: 'Healthy, radiant, whole, and at peace \\u2014 looking like their best self', score: 'radiant' },
          { text: 'Sick, frail, in pain, or as they were in their final hospice days', score: 'sick' },
          { text: 'Ordinary and everyday \\u2014 doing normal chores or having dinner', score: 'ordinary' },
          { text: 'Shadowy, distant, or turning away from me', score: 'shadowy' }
        ]
      },
      {
        id: 'dream_tone',
        q: 'What was the overall tone of communication and feeling?',
        hint: 'What was the emotional atmosphere of the dream?',
        options: [
          { text: 'Warm embrace, reassurance, or clear words saying \\u201CI am okay\\u201D', detail: 'Comfort & peace', score: 'peace' },
          { text: 'Total silence \\u2014 they were present, but could not or would not speak', detail: 'Quiet presence', score: 'silent' },
          { text: 'Urgent, chaotic, or frightening \\u2014 trying to save them from death again', detail: 'Nightmare / Panic', score: 'panic' },
          { text: 'Accusatory, tense, or filled with sadness and regret', detail: 'Conflict / Guilt', score: 'guilt' },
          { text: 'I woke up before understanding what was happening', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'waking_afterglow',
        q: 'How did you feel the morning after waking from the dream?',
        hint: 'The waking afterglow is the truest marker of the dream’s psychological function.',
        options: [
          { text: 'A profound sense of peace, love, and emotional relief that lingered for days', detail: 'Deep comfort', score: 'comfort' },
          { text: 'Bittersweet \\u2014 happy to have \\u201Cseen\\u201D them, but sad they are gone', detail: 'Tender longing', score: 'longing' },
          { text: 'Exhausted and shaken \\u2014 as if I had lived through the funeral all over again', detail: 'Re-traumatized', score: 'reopened' },
          { text: 'Confused, unsettled, and obsessively searching online for symbol meanings', detail: 'Anxious search', score: 'anxious' },
          { text: 'My mood shifted several times during the day', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'dream_frequency',
        q: 'How often do you have dreams of this nature?',
        hint: 'Milestone dreams heal; chronic dream loops signal emotional trauma.',
        options: [
          { text: 'It was a single, vivid, unforgettable milestone dream', detail: 'Singular event', score: 'once' },
          { text: 'Occasionally \\u2014 every few months or on meaningful dates', detail: 'Periodic', score: 'periodic' },
          { text: 'Regularly \\u2014 several times a week in confusing variations', detail: 'Frequent', score: 'frequent' },
          { text: 'Exhausting recurrent nightmares about their death', detail: 'Trauma loop', score: 'nightmare' },
          { text: 'This was the very first time I have dreamed of them', detail: 'First time', score: null }
        ]
      },
      {
        id: 'unresolved_factors',
        q: 'Were there unresolved conflicts or unspoken words between you when they died?',
        hint: 'Subconscious dreams frequently work through relational debris.',
        options: [
          { text: 'No \\u2014 our love was clear, complete, and fully expressed', detail: 'Clean closure', score: 'clean' },
          { text: 'Minor regrets, but generally we had deep mutual affection', detail: 'Normal regrets', score: 'minor' },
          { text: 'Yes \\u2014 we were estranged, mid-argument, or things were left unsaid', detail: 'Significant unfinished business', score: 'heavy' },
          { text: 'I carried intense caregiver guilt about decisions made in their care', detail: 'Caregiver trauma', score: 'caregiver' },
          { text: 'It is complicated and difficult to summarize', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'want',
        q: 'What are you most hoping this dream represents?',
        hint: 'Your hope reveals the underlying need.',
        options: [
          { text: 'An authentic visitation confirming they are safe and watching over me', score: 'visitation' },
          { text: 'A healthy sign that my own heart is finally healing and finding peace', score: 'healing' },
          { text: 'An opportunity to say goodbye or apologize for things left unsaid', score: 'apology' },
          { text: 'A warning or message about my current waking life direction', score: 'warning' }
        ]
      },
      {
        id: 'help',
        q: 'What kind of clarity would be most helpful right now?',
        hint: 'What supports your emotional balance?',
        options: [
          { text: 'Permission to hold the comfort without needing to prove it scientifically', score: 'permission' },
          { text: 'Clinical support to resolve traumatic nightmares of their illness', score: 'therapy' },
          { text: 'A reflective reading to explore the emotional themes the dream surfaced', score: 'tarot' },
          { text: 'A medium reading to check if they have further messages', score: 'medium' }
        ]
      }
    ],

    resolve: function (a) {
      if (a.dream_tone === 'panic' || a.waking_afterglow === 'reopened' || a.dream_frequency === 'nightmare') {
        return 'trauma-replay';
      }
      if (a.dream_tone === 'guilt' || a.unresolved_factors === 'heavy' || a.unresolved_factors === 'caregiver') {
        return 'unresolved-guilt';
      }
      if (a.dream_appearance === 'radiant' && (a.dream_tone === 'peace' || a.waking_afterglow === 'comfort')) {
        return 'comforting-visitation';
      }
      if (a.dream_appearance === 'ordinary' || a.waking_afterglow === 'longing') {
        return 'cognitive-adjustment';
      }
      var nullCount = 0;
      if (a.dream_tone === null) nullCount++;
      if (a.waking_afterglow === null) nullCount++;
      if (a.dream_frequency === null) nullCount++;
      if (a.unresolved_factors === null) nullCount++;
      if (nullCount >= 2) {
        return 'not-enough-evidence';
      }
      return 'cognitive-adjustment';
    },

    results: {
      'comforting-visitation': {
        path: 'Comforting Visitation & Integration',
        summary: 'A profound milestone dream that provided genuine emotional peace and closure.',
        suggest: function (a) {
          return 'Your dream features the classic markers of what researchers and spiritual traditions call a comforting visitation: your loved one appeared whole and radiant, the emotional atmosphere was peaceful, and you woke with lasting warmth. Whether viewed as an actual spirit encounter or deep REM emotional resolution, its healing gift to you is real.';
        },
        dontTell: 'It cannot be certified by third-party instruments \\u2014 but you do not need outside verification to accept the peace it gave you.',
        watchIntro: 'How to honor this dream:',
        watch: function (a) {
          return [
            'Protect the memory \\u2014 write it down in detail so that doubt does not erode its comfort over time',
            'Accept the gift: treat it as permission from your own heart (and their memory) to flourish in life',
            'Avoid consulting fortune-tellers who might complicate a clean, beautiful experience'
          ];
        }
      },
      'trauma-replay': {
        path: 'Trauma Replay & Processing',
        summary: 'Your dream is replaying the shock of death, reflecting waking post-traumatic stress.',
        suggest: function (a) {
          return 'Your dream replayed their illness, hospital alarms, or deathbed scene, leaving you exhausted and shaken. This is not a message from the spirit world that they are suffering \\u2014 it is your brain struggling to integrate the traumatic shock of how they died. It is especially common after sudden loss or exhausting caregiving.';
        },
        dontTell: 'It is not an omen of bad luck or proof that their soul is restless \\u2014 it is post-traumatic stress in your own nervous system.',
        watchIntro: 'Steps to calm traumatic dream loops:',
        watch: function (a) {
          return [
            'Remind yourself upon waking: \\u201CThat was medical trauma replaying; they are no longer in pain\\u201D',
            'Seek out a trauma-informed grief therapist (EMDR or somatic therapies excel at resolving deathbed flashbacks)',
            'Avoid watching medical dramas or reading triggering obituaries before bed'
          ];
        }
      },
      'unresolved-guilt': {
        path: 'Guilt & Conflict Projection',
        summary: 'The dream was tense or silent, reflecting your own unexpressed regrets and longing for absolution.',
        suggest: function (a) {
          return 'When relationships end with words left unsaid or caregiver burnout, the grieving brain projects that conflict into the dream world. If they turned away or seemed angry, that emotion belongs to your waking self-criticism, not to their current state.';
        },
        dontTell: 'Their dream figure is not holding a grudge \\u2014 the harshness in the dream is your own guilt wearing their face.',
        watchIntro: 'Healing the relational debris:',
        watch: function (a) {
          return [
            'Write an unsent letter expressing every regret, apology, and gratitude you never voiced aloud',
            'Remember that a lifetime bond is not erased by a messy ending or human impatience during illness',
            'Practice self-compassion: you did the best you could with the emotional resources you had at the time'
          ];
        }
      },
      'cognitive-adjustment': {
        path: 'Cognitive Reality Adjustment',
        summary: 'Everyday dreams reflecting the brain updating its reality map to incorporate their absence.',
        suggest: function (a) {
          return 'Your dream was ordinary \\u2014 doing chores, driving, or chatting \\u2014 followed by the bittersweet realization that they are dead. This is the brain’s neural prediction engine slowly updating to the new reality of their physical absence. It is an organic, healthy part of mourning.';
        },
        dontTell: 'It does not mean you are failing to move on \\u2014 the brain takes months or years to rewire lifelong habits of presence.',
        watchIntro: 'Gentle ways to navigate these reminders:',
        watch: function (a) {
          return [
            'Allow the morning sadness to wash through without panic \\u2014 it is simply missing someone you loved',
            'Keep their photo in a place of honor, greeting their memory with tenderness rather than dread',
            'Continue building your daily routine: restoration-oriented activities help the brain ground itself'
          ];
        }
      },
      'not-enough-evidence': {
        path: 'Unclear Dream Boundary',
        summary: 'Fragmented dream elements that need time before their emotional meaning becomes clear.',
        suggest: function (a) {
          return 'Your dream had mixed elements that don’t fit neatly into a single category. Dream fragments often jumble everyday stress with deep grief. Give yourself time before deciding what it means.';
        },
        dontTell: 'You do not need to rush to a dream dictionary \\u2014 generic symbols rarely capture the truth of personal bereavement.',
        watchIntro: 'Patience with your dreams:',
        watch: function (a) {
          return [
            'Keep a dream journal by your bedside to capture future dreams right as you wake',
            'Focus on how your waking body feels rather than dissecting individual surreal symbols',
            'Talk with a compassionate friend about what you miss most about them'
          ];
        }
      }
    },

    underneath: function (a, p) {
      if (p === 'trauma-replay' || a.help === 'therapy') {
        return {
          key: 'medical_trauma',
          label: 'The weight of witness and caregiver trauma',
          text: 'Watching someone deteriorate or die leaves physical trauma in the witness. When nightmares replay the hospital room, the healing required is trauma stabilization, not spiritual interpretation.'
        };
      }
      if (p === 'unresolved-guilt' || a.want === 'apology') {
        return {
          key: 'hunger_for_absolution',
          label: 'The desperate search for absolution',
          text: 'Grief magnifies human imperfection. We desperately want a dream to give us a clean slate. Granting yourself the forgiveness you wish they would vocalize is the real sacred work.'
        };
      }
      if (p === 'comforting-visitation' || a.want === 'healing') {
        return {
          key: 'permission_to_live',
          label: 'Permission to step back into the living world',
          text: 'Comforting dreams often arrive when you are ready to live again. The peaceful smile in your dream is your own heart realizing that moving forward does not mean forgetting.'
        };
      }
      return null;
    },

    practice: {
      free_first: {
        name: 'Dream Journaling & Reflection',
        fit: 'For integrating peaceful dreams without external contamination or expense.',
        href: '/questions/loss-closure/',
        cta: 'Explore Loss & Closure',
        secondary: { name: 'Signs From Loved Ones', fit: 'Waking encounters guide', href: '/questions/loss-closure/signs-from-deceased-loved-ones' },
        note: 'The truest authority on your dream is your own waking feeling \\u2014 no reader knows it better than you.'
      },
      medium: {
        name: 'Evidential Medium Reading',
        fit: 'For exploring evidential memories if you have lingering doubts about ongoing connection.',
        href: '/medium/',
        cta: 'Read mediumship vetting guide',
        choose: { name: 'What Mediums Actually Do', href: '/guides/medium-reading-guide' },
        secondary: { name: 'Psychic vs Medium', fit: 'Why booking the wrong format hurts', href: '/guides/psychic-vs-medium' },
        note: 'Never tell the medium about your dream beforehand; let their evidence stand on its own.'
      },
      tarot_deep: {
        name: 'Tarot Reflection for Grief',
        fit: 'For exploring the subconscious symbols and emotional blocks surfaced by your dream.',
        href: '/tarot/',
        cta: 'Explore reflective tarot',
        choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
        secondary: { name: 'Dreams Hub', fit: 'Explore dream frameworks', href: '/questions/dreams/' },
        note: 'Tarot does not decode prophecies; it unpacks your own emotional associations.'
      },
      tarot_decision: {
        name: 'Trauma-Informed Grief Therapy',
        fit: 'For resolving distressing nightmares, hospice flashbacks, and acute sleep disruption.',
        href: '/questions/loss-closure/',
        cta: 'See grief support resources',
        secondary: { name: 'Dark Night of the Soul', fit: 'Spiritual crisis vs clinical depression', href: '/guides/dark-night-of-the-soul' },
        note: 'Clinical EMDR and somatic therapies are the gold standard for recurring bereavement nightmares.'
      },
      closure: {
        name: 'Unsent Letter & Memorial Ritual',
        fit: 'For reconciling unresolved guilt and completing conversations left unfinished.',
        href: '/questions/loss-closure/',
        cta: 'Read closure frameworks',
        secondary: { name: 'Do What Fits', fit: 'Comprehensive 7-question matcher', href: '/do-what-fits' },
        note: 'A quiet, personal ceremony offers deeper closure than third-party consultations.'
      },
      general: {
        name: 'Do What Fits',
        fit: 'When you are unsure if your dream is a grief question, anxiety, or life transition.',
        href: '/do-what-fits',
        cta: 'Take the 7-question matcher',
        secondary: { name: 'Questions Hub', fit: 'Explore all life questions', href: '/questions/' },
        note: 'A fast, private matcher that clarifies what kind of support your situation needs.'
      },
      psychic: {
        name: 'General Psychic Reading',
        fit: 'Not recommended for bereavement dreams \\u2014 psychics read the living, not the departed.',
        href: '/guides/psychic-vs-medium',
        cta: 'See why mediumship is required',
        choose: { name: 'Psychic vs Medium', href: '/guides/psychic-vs-medium' },
        secondary: { name: 'What Mediums Actually Do', fit: 'The right format for grief', href: '/guides/medium-reading-guide' },
        note: 'Do not book a psychic for a dream about someone who died; mediums handle grief.'
      }
    },

    matchPractice: function (a) {
      if (a.help === 'therapy' || a.waking_afterglow === 'reopened') {
        return 'tarot_decision'; // Grief therapy
      }
      if (a.help === 'medium' && a.waking_afterglow === 'comfort') {
        return 'medium';
      }
      if (a.help === 'tarot') {
        return 'tarot_deep';
      }
      if (a.want === 'apology' || a.unresolved_factors === 'heavy') {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'dream-about-deceased-loved-one', {
        negativePatternTip: {
          pattern: 'trauma-replay',
          text: 'when dreams replay painful hospice or medical scenes, beware of psychics claiming the spirit is \\u201Crestless.\\u201D That is a scam capitalizing on your pain. The distress is in your nervous system, and trauma counseling brings real relief.'
        }
      });
    }
  },

  /* 3. IS MY LOVED ONE WATCHING OVER ME */
  'is-my-loved-one-watching-over-me': {
    id: 'is-my-loved-one-watching-over-me',
    title: 'What Is Your Need for Reassurance Asking For?',
    subtitle: 'Eight questions, about two minutes. It maps whether your relationship to their memory is providing a secure foundation or sustaining anxious loops, and maps the next step that fits.',
    launchSub: 'Eight questions, about two minutes. It reads whether wondering if they are watching is bringing comfort or creating decision paralysis, and matches you with a grounded next step.',
    questions: [
      {
        id: 'trigger_moment',
        q: 'When does the question \\u201Care they watching over me\\u201D hit you hardest?',
        hint: 'Context surfaces what the emotional need is.',
        options: [
          { text: 'During major milestones (graduations, weddings, births, career moves)', score: 'milestone' },
          { text: 'In moments of acute loneliness, panic, or personal crisis', score: 'crisis' },
          { text: 'When I am making a difficult moral or life decision and feel unsure', score: 'decision' },
          { text: 'When I feel guilty about moving on, laughing, or living my life', score: 'guilt' },
          { text: 'Just as a constant quiet curiosity in daily life', score: 'curiosity' }
        ]
      },
      {
        id: 'internal_voice',
        q: 'When you sit quietly and think of them, can you hear or imagine their advice?',
        hint: 'Internalized neural models of loved ones are deeply accurate.',
        options: [
          { text: 'Yes \\u2014 I know exactly what they would say, and it brings clarity', detail: 'Strong internal anchor', score: 'anchor' },
          { text: 'Partially \\u2014 I remember their warmth, but feel unsure of their specific advice', detail: 'Gentle recall', score: 'partial' },
          { text: 'No \\u2014 it feels like a silent, empty void that brings pain', detail: 'Silence / Absence', score: 'void' },
          { text: 'I only hear their criticism or worry that they would disapprove of me', detail: 'Critical projection', score: 'critic' },
          { text: 'I am not sure', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'reassurance_habit',
        q: 'How often do you seek external signs or psychic readings to confirm their presence?',
        hint: 'Reassurance seeking can become an addictive substitute for self-trust.',
        options: [
          { text: 'Rarely \\u2014 their memory in my heart is enough', detail: 'Self-contained', score: 'rare' },
          { text: 'Occasionally \\u2014 I like the idea, but I don’t rely on it to make choices', detail: 'Casual comfort', score: 'occasional' },
          { text: 'Frequently \\u2014 I feel uneasy if I don’t get a sign or confirmation', detail: 'Reassurance habit', score: 'frequent' },
          { text: 'Compulsively \\u2014 I consult readings repeatedly to feel safe', detail: 'Addictive loop', score: 'compulsive' },
          { text: 'I have never consulted an outside source', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'decision_autonomy',
        q: 'How does the thought of their gaze affect your big life choices?',
        hint: 'Honoring memory vs. living in an imaginary prison.',
        options: [
          { text: 'It inspires me to live with courage, integrity, and joy', detail: 'Empowering legacy', score: 'empowered' },
          { text: 'It comforts me, but I make my own choices independently', detail: 'Independent', score: 'independent' },
          { text: 'It paralyzes me \\u2014 I hesitate to date, move, or change jobs in case they disapprove', detail: 'Decision paralysis', score: 'paralyzed' },
          { text: 'It creates guilt \\u2014 I feel watched in my private mistakes or flaws', detail: 'Surveillance anxiety', score: 'watched' },
          { text: 'It depends on the specific decision', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'presence_perception',
        q: 'How does it feel when you go through long periods without \\u201Cfeeling\\u201D them near?',
        hint: 'Does silence feel safe, or like abandonment?',
        options: [
          { text: 'Peaceful \\u2014 love is a permanent fact of my history, not an hourly broadcast', detail: 'Secure attachment', score: 'secure' },
          { text: 'A little sad, but natural as life demands my attention', detail: 'Normal adaptation', score: 'natural' },
          { text: 'Panic that they are drifting away or forgetting me', detail: 'Separation anxiety', score: 'panic' },
          { text: 'Guilt that I am failing to honor or remember them enough', detail: 'Memory guilt', score: 'guilt' },
          { text: 'I am not sure', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'moving_on_guilt',
        q: 'Do you ever feel guilty about experiencing joy, laughing, or thriving without them?',
        hint: 'Survivor joy is often the hardest hurdle in grief.',
        options: [
          { text: 'No \\u2014 I know they would want me to be happy and live fully', detail: 'Clean permission', score: 'free' },
          { text: 'Sometimes a brief pang of guilt, but I allow myself to enjoy life', detail: 'Gentle pangs', score: 'minor' },
          { text: 'Frequently \\u2014 joy feels like an act of betrayal or abandonment', detail: 'Survivor guilt', score: 'heavy' },
          { text: 'Constantly \\u2014 I hold onto sorrow as proof of my devotion', detail: 'Sorrow-as-loyalty', score: 'severe' },
          { text: 'I haven’t reached a point where joy is an option yet', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'want',
        q: 'What are you most hoping an answer to this question will give you?',
        hint: 'Name the real hunger.',
        options: [
          { text: 'Permission to be happy, make mistakes, and move forward without guilt', score: 'permission' },
          { text: 'Protection and companionship \\u2014 feeling less alone in a harsh world', score: 'safety' },
          { text: 'Validation that they are proud of who I am becoming', score: 'pride' },
          { text: 'Evidential proof that consciousness survives death', score: 'proof' }
        ]
      },
      {
        id: 'help',
        q: 'What kind of support would most stabilize you right now?',
        hint: 'Match support to your emotional state.',
        options: [
          { text: 'A grounded framework to stop feeling watched, judged, or paralyzed', score: 'framework' },
          { text: 'An evidential medium reading to feel their warmth one more time', score: 'medium' },
          { text: 'Counseling to resolve deep survivor guilt and caregiver trauma', score: 'therapy' },
          { text: 'A tarot reflection on moving forward with my own life choices', score: 'tarot' }
        ]
      }
    ],

    resolve: function (a) {
      if (a.decision_autonomy === 'paralyzed' || a.moving_on_guilt === 'severe' || a.moving_on_guilt === 'heavy') {
        return 'decision-paralysis';
      }
      if (a.reassurance_habit === 'compulsive' || a.presence_perception === 'panic' || a.decision_autonomy === 'watched') {
        return 'anxious-reassurance-loop';
      }
      if (a.internal_voice === 'anchor' && (a.decision_autonomy === 'empowered' || a.decision_autonomy === 'independent')) {
        return 'grounded-internal-anchor';
      }
      if (a.internal_voice === 'void' || a.presence_perception === 'panic') {
        return 'absence-numbness';
      }
      var nullCount = 0;
      if (a.internal_voice === null) nullCount++;
      if (a.reassurance_habit === null) nullCount++;
      if (a.decision_autonomy === null) nullCount++;
      if (a.presence_perception === null) nullCount++;
      if (nullCount >= 2) {
        return 'not-enough-evidence';
      }
      return 'grounded-internal-anchor';
    },

    results: {
      'grounded-internal-anchor': {
        path: 'Grounded Internal Anchor',
        summary: 'You carry their love as an internal compass that fosters courage rather than dependency.',
        suggest: function (a) {
          return 'Your answers describe the healthiest form of continuing bonds: their memory lives inside you as a source of strength, love, and practical guidance. When you wonder if they are watching, it is an expression of enduring warmth rather than fear. You make your own decisions while honoring the values they shared with you.';
        },
        dontTell: 'It does not prove metaphysical surveillance \\u2014 but living with their internalized wisdom is far more valuable and real than chasing external signs.',
        watchIntro: 'How to keep this foundation strong:',
        watch: function (a) {
          return [
            'Continue trusting your internal dialogue \\u2014 what you imagine they would say is an authentic reflection of their love',
            'Live boldly: the greatest tribute to someone who loved you is to build a vibrant, courageous life',
            'You do not need commercial readings \\u2014 your connection is complete, free, and permanent'
          ];
        }
      },
      'anxious-reassurance-loop': {
        path: 'Anxious Reassurance Loop',
        summary: 'Wondering if they are watching has become an anxious cycle of seeking external approval.',
        suggest: function (a) {
          return 'Your answers show that the question is driven by attachment anxiety: you feel panicked when you don’t feel their presence, or you feel hyper-monitored in your private mistakes. When grief turns into surveillance anxiety, you are treating their memory like an external judge rather than a loving anchor.';
        },
        dontTell: 'More psychic readings cannot soothe this loop \\u2014 external reassurance wears off in days because the doubt lives in your own self-trust.',
        watchIntro: 'Steps to step out of the surveillance trap:',
        watch: function (a) {
          return [
            'Remind yourself: someone who truly loved you in life would never want to become a harsh surveillance camera after death',
            'Take a break from asking for signs or booking readings for at least 30 days',
            'Practice offering yourself the compassion and validation you are currently begging from the other side'
          ];
        }
      },
      'decision-paralysis': {
        path: 'Grief-Related Decision Paralysis',
        summary: 'You are delaying major life choices out of fear of betraying or disappointing their memory.',
        suggest: function (a) {
          return 'You are hesitating to date, relocate, change jobs, or experience joy because part of you fears that moving forward is an act of disloyalty. You are holding onto grief as proof of devotion, turning their perceived gaze into a barrier against life.';
        },
        dontTell: 'Sacrificing your future does not honor their past \\u2014 true love wants the surviving person to be safe, supported, and happy.',
        watchIntro: 'Reclaiming your agency:',
        watch: function (a) {
          return [
            'Give yourself explicit permission to make mistakes, change directions, and build new relationships',
            'Notice where you are using \\u201Cwhat would they think\\u201D to avoid the scary vulnerability of choosing for yourself',
            'Consider speaking with a grief counselor about survivor guilt'
          ];
        }
      },
      'absence-numbness': {
        path: 'Absence Numbness & Depletion',
        summary: 'Feeling only a painful void, leaving you exhausted and doubting the bond.',
        suggest: function (a) {
          return 'When you look into your heart or the quiet room, you feel only silence and emptiness. You worry that this means they have vanished or stopped caring. In truth, profound grief burns out the nervous system, creating emotional anesthesia that temporarily blocks warm memories.';
        },
        dontTell: 'The void does not mean the bond is dead \\u2014 it means your brain is emotionally depleted and fighting for basic survival.',
        watchIntro: 'Caring for your depleted system:',
        watch: function (a) {
          return [
            'Do not force spiritual connection right now \\u2014 prioritize physical rest, hydration, and sleep',
            'Accept the silence without building a tragic narrative around it \\u2014 the warmth will return as your nervous system stabilizes',
            'Let trusted living friends support you in practical daily tasks'
          ];
        }
      },
      'not-enough-evidence': {
        path: 'Tender Exploration',
        summary: 'Your relationship with their memory is evolving, with shifting moments of clarity and doubt.',
        suggest: function (a) {
          return 'Your answers indicate that your feelings change depending on the day. Milestone days trigger intense longing, while ordinary days feel manageable. You are navigating the natural dual process of mourning.';
        },
        dontTell: 'You do not need to rush to a fixed conclusion \\u2014 continuing bonds take years to settle into a comfortable rhythm.',
        watchIntro: 'Staying grounded on milestone days:',
        watch: function (a) {
          return [
            'Create simple, personal rituals on birthdays and anniversaries to honor their place in your story',
            'Notice how living according to their values keeps their presence active in the real world',
            'Be gentle with yourself when grief unexpectedly surges'
          ];
        }
      }
    },

    underneath: function (a, p) {
      if (p === 'decision-paralysis' || a.want === 'permission') {
        return {
          key: 'survivor_guilt',
          label: 'The fear that moving forward is an act of betrayal',
          text: 'Many grievers subconsciously believe that being happy again means they didn’t love the person enough. Releasing this guilt is the hardest work in bereavement: knowing that flourishing is the greatest tribute you can pay to someone who loved you.'
        };
      }
      if (p === 'anxious-reassurance-loop' || a.want === 'safety') {
        return {
          key: 'vulnerability_terror',
          label: 'Feeling unprotected in an unpredictable world',
          text: 'When a foundational protector (parent, spouse, mentor) passes, the world suddenly feels terrifyingly sharp. Asking if they are watching is often an expression of feeling physically and emotionally vulnerable.'
        };
      }
      return null;
    },

    practice: {
      free_first: {
        name: 'The Internal Compass Framework',
        fit: 'For drawing strength from their legacy without falling into superstition or expense.',
        href: '/questions/loss-closure/',
        cta: 'Explore Loss & Closure',
        secondary: { name: 'Signs From Loved Ones', fit: 'Guide to signs and synchronicities', href: '/questions/loss-closure/signs-from-deceased-loved-ones' },
        note: 'Consulting your own internalized memory of their advice costs nothing and builds real self-trust.'
      },
      medium: {
        name: 'Evidential Medium Reading',
        fit: 'For exploring evidential connection when you are emotionally stable and clear-headed.',
        href: '/medium/',
        cta: 'Read mediumship vetting guide',
        choose: { name: 'What Mediums Actually Do', href: '/guides/medium-reading-guide' },
        secondary: { name: 'Psychic vs Medium', fit: 'Why format matters for grief', href: '/guides/psychic-vs-medium' },
        note: 'Never ask a medium for life decisions or permissions; keep the session focused on memory.'
      },
      tarot_decision: {
        name: 'Decision-Focused Tarot Spread',
        fit: 'For breaking through decision paralysis and exploring your own life choices.',
        href: '/tarot/',
        cta: 'Explore decision spreads',
        choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
        secondary: { name: 'Do What Fits', fit: '7-question life matcher', href: '/do-what-fits' },
        note: 'Tarot helps you see your own options clearly; the choice remains completely yours.'
      },
      tarot_deep: {
        name: 'Grief Counseling for Survivor Guilt',
        fit: 'For deep clinical work when guilt, paralysis, or terror prevent daily functioning.',
        href: '/questions/loss-closure/',
        cta: 'See grief support resources',
        secondary: { name: 'Dark Night of the Soul', fit: 'Spiritual crisis vs depression', href: '/guides/dark-night-of-the-soul' },
        note: 'Guilt and decision paralysis respond to compassionate clinical therapy, not fortune-telling.'
      },
      closure: {
        name: 'Memorial Dialogue & Letter Writing',
        fit: 'For resolving doubts about their approval and expressing your love in private.',
        href: '/questions/loss-closure/',
        cta: 'Read closure frameworks',
        secondary: { name: 'Do What Fits', fit: '7-question matcher', href: '/do-what-fits' },
        note: 'Writing a letter to them puts their love into your hands rather than a stranger’s.'
      },
      general: {
        name: 'Do What Fits',
        fit: 'When you are unsure if this is grief, life direction, or relationship anxiety.',
        href: '/do-what-fits',
        cta: 'Take the 7-question matcher',
        secondary: { name: 'Questions Hub', fit: 'Explore all life questions', href: '/questions/' },
        note: 'A fast, private matcher that screens emotional readiness before recommending any guidance.'
      },
      psychic: {
        name: 'General Psychic Reading',
        fit: 'Not recommended for afterlife reassurance \\u2014 psychics read the living, not the departed.',
        href: '/guides/psychic-vs-medium',
        cta: 'See why mediumship is required',
        choose: { name: 'Psychic vs Medium', href: '/guides/psychic-vs-medium' },
        secondary: { name: 'What Mediums Actually Do', fit: 'The right format for grief', href: '/guides/medium-reading-guide' },
        note: 'Do not book a general psychic to ask about someone who passed; use mediumship or therapy.'
      }
    },

    matchPractice: function (a) {
      if (a.help === 'therapy' || a.decision_autonomy === 'paralyzed') {
        return 'tarot_deep'; // Counseling for survivor guilt
      }
      if (a.help === 'medium' && (a.internal_voice === 'anchor' || a.presence_perception === 'secure')) {
        return 'medium';
      }
      if (a.help === 'tarot') {
        return 'tarot_decision';
      }
      if (a.want === 'permission') {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'is-my-loved-one-watching-over-me', {
        negativePatternTip: {
          pattern: 'decision-paralysis',
          text: 'when fear of disappointing someone who died stops you from living your own life, seeking more readings keeps you trapped. True love wants you to flourish; give yourself permission to choose your own path.'
        }
      });
    }
  },

  /* 4. WHY AM I ALWAYS BROKE */
  'why-am-i-always-broke': {
    id: 'why-am-i-always-broke',
    title: 'What Is Driving Your Financial Cycle?',
    subtitle: 'Eight questions, about two minutes. It sorts your financial friction into mathematical deficits, avoidance loops, boundary leakage, or emotional spending, and matches you with a realistic next step.',
    launchSub: 'Eight questions, about two minutes. It reads whether your financial depletion is mathematical, behavioral, or boundary-related, and ends on the next step that fits.',
    questions: [
      {
        id: 'income_baseline',
        q: 'How does your net take-home income compare to your bare survival costs (rent, food, transit, minimum debt)?',
        hint: 'Math first \\u2014 you cannot budget your way out of a mathematical deficit.',
        options: [
          { text: 'Survival costs exceed 90% of my income \\u2014 there is literally no room to breathe', score: 'deficit' },
          { text: 'Survival costs are roughly 70–80% \\u2014 a small buffer, but unexpected costs wipe it out', score: 'tight' },
          { text: 'Survival costs are under 60% \\u2014 I earn decent money, but somehow it still evaporates', score: 'surplus_leak' },
          { text: 'My income fluctuates wildly from month to month (freelance / gig work)', score: 'variable' }
        ]
      },
      {
        id: 'primary_leak',
        q: 'Where does the money seem to go when it disappears?',
        hint: 'Identify the primary exit channel.',
        options: [
          { text: 'Small, uncounted daily purchases and impulse orders after exhausting days', score: 'impulse' },
          { text: 'Financial rescue for family, friends, or partners who rely on me', score: 'rescue' },
          { text: 'Emergency crises that seem to hit every time I build up a tiny savings cushion', score: 'crisis' },
          { text: 'High fixed interest rates, subscription creep, and overdraft / late fees', score: 'structural' },
          { text: 'I honestly have no idea \\u2014 I avoid looking at the numbers', score: 'avoidance' }
        ]
      },
      {
        id: 'avoidance_level',
        q: 'How do you feel when you have to open your banking app or look at bills?',
        hint: 'Money Avoidance script diagnosis.',
        options: [
          { text: 'Calm and objective \\u2014 I track my numbers regularly without drama', detail: 'High visibility', score: 'calm' },
          { text: 'Mild dread, but I look at it when I need to pay bills', detail: 'Manageable friction', score: 'mild' },
          { text: 'Severe anxiety \\u2014 I procrastinate for weeks until late notices arrive', detail: 'Active avoidance', score: 'avoid' },
          { text: 'Physical nausea / panic \\u2014 I keep my balance at a guess to avoid confronting reality', detail: 'Severe phobia', score: 'panic' },
          { text: 'It varies widely', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'emotional_spending',
        q: 'When are you most likely to spend money you know you should save?',
        hint: 'Dopamine compensation triggers.',
        options: [
          { text: 'Rarely \\u2014 my spending is planned and disciplined', detail: 'Low emotional spend', score: 'low' },
          { text: 'When I am exhausted, angry, or burned out after grueling work weeks', detail: 'Burnout anesthetic', score: 'burnout' },
          { text: 'When I am out with friends and terrified of looking cheap or broke', detail: 'Status comparison', score: 'status' },
          { text: 'When I have an unexpected surplus and feel an urge to get rid of it', detail: 'Surplus discomfort', score: 'discomfort' },
          { text: 'It happens randomly without a clear pattern', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'boundary_leakage',
        q: 'How comfortable are you saying \\u201Cno, I can’t afford that\\u201D to friends or family?',
        hint: 'Boundary leakage is one of the most common causes of chronic broke-ness.',
        options: [
          { text: 'Very comfortable \\u2014 my financial boundaries are clear and respected', detail: 'Strong boundaries', score: 'firm' },
          { text: 'A bit uncomfortable, but I can decline when necessary', detail: 'Decent boundaries', score: 'fair' },
          { text: 'Very difficult \\u2014 I often agree to expensive plans or lend money to avoid conflict', detail: 'People-pleasing leak', score: 'leak' },
          { text: 'Impossible \\u2014 I am the financial safety net for multiple people despite having nothing', detail: 'Codependent drain', score: 'severe_leak' },
          { text: 'I am not sure', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'scarcity_script',
        q: 'What message about money did you absorb growing up?',
        hint: 'Unconscious childhood money scripts run adult bank accounts.',
        options: [
          { text: 'Money was a calm, managed resource used for security and living', detail: 'Healthy baseline', score: 'healthy' },
          { text: 'Money was a source of constant screaming, fighting, and terror', detail: 'Money trauma', score: 'terror' },
          { text: 'Having money was seen as greedy, corrupt, or spiritually inferior', detail: 'Money avoidance script', score: 'corrupt' },
          { text: 'Having money was the only way to earn respect and worth in society', detail: 'Money status script', score: 'status_script' },
          { text: 'It was never spoken about at all', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'want',
        q: 'What are you most hoping to achieve right now?',
        hint: 'Your real goal determines the tool that fits.',
        options: [
          { text: 'Breathing room \\u2014 stopping the panic of overdraft fees and unpaid bills', score: 'breathing_room' },
          { text: 'Stopping self-sabotage \\u2014 learning why I spend money the moment I have it', score: 'behavior_change' },
          { text: 'Higher income \\u2014 figuring out how to transition to higher-leverage work', score: 'income_growth' },
          { text: 'Spiritual clarity \\u2014 understanding why bad luck seems to follow my finances', score: 'spiritual_read' }
        ]
      },
      {
        id: 'help',
        q: 'What kind of support would honestly make the biggest difference?',
        hint: 'Select the tool that matches the problem layer.',
        options: [
          { text: 'A clear, honest diagnostic framework and a simple micro-buffer plan', score: 'framework' },
          { text: 'Financial counseling / financial therapy to address avoidance and scripts', score: 'counseling' },
          { text: 'A tarot or astrology reading on career crossroads and timing', score: 'reading' },
          { text: 'Practical debt management or public community resource assistance', score: 'debt_help' }
        ]
      }
    ],

    resolve: function (a) {
      if (a.income_baseline === 'deficit' || a.primary_leak === 'structural') {
        return 'systemic-income-squeeze';
      }
      if (a.avoidance_level === 'panic' || a.avoidance_level === 'avoid' || a.primary_leak === 'avoidance') {
        return 'avoidance-denial-loop';
      }
      if (a.boundary_leakage === 'severe_leak' || a.boundary_leakage === 'leak' || a.primary_leak === 'rescue') {
        return 'boundary-leakage';
      }
      if (a.emotional_spending === 'burnout' || a.emotional_spending === 'status') {
        return 'emotional-compensation';
      }
      if (a.scarcity_script === 'corrupt' || a.scarcity_script === 'terror') {
        return 'scarcity-script';
      }
      var nullCount = 0;
      if (a.avoidance_level === null) nullCount++;
      if (a.emotional_spending === null) nullCount++;
      if (a.boundary_leakage === null) nullCount++;
      if (a.scarcity_script === null) nullCount++;
      if (nullCount >= 2) {
        return 'not-enough-evidence';
      }
      return 'systemic-income-squeeze';
    },

    results: {
      'systemic-income-squeeze': {
        path: 'Systemic Income Squeeze',
        summary: 'Your core expenses exceed your wage; the friction is mathematical, not a vibrational flaw.',
        suggest: function (a) {
          return 'Your answers indicate that non-negotiable living costs absorb nearly all your take-home pay. You are not broke because you buy lattes or lack \\u201Cabundance mindset\\u201D \\u2014 you are in an arithmetic deficit. Under these conditions, every unexpected expense causes a crisis because there is zero margin for error.';
        },
        dontTell: 'No spiritual ritual or manifestation script will fix a mathematical wage shortage \\u2014 treating structural under-earning as an energetic block is predatory gaslighting.',
        watchIntro: 'Strategic moves for an income deficit:',
        watch: function (a) {
          return [
            'Do not spend single dollars on manifestation courses or psychic readings \\u2014 every penny must protect your physical margin',
            'Focus your scarce bandwidth on the only variable that moves math: income expansion, skill acquisition, or public debt restructuring',
            'Release the moral shame \\u2014 living in an economic squeeze is an arithmetic reality, not a character defect'
          ];
        }
      },
      'avoidance-denial-loop': {
        path: 'Money Avoidance & Denial Loop',
        summary: 'Anxiety makes you avoid looking at your accounts, turning small manageable issues into catastrophic crises.',
        suggest: function (a) {
          return 'You are caught in the classic Money Avoidance script: opening bank apps, reviewing bills, or checking balances causes such visceral anxiety that you procrastinate until late fees, shut-off notices, or overdrafts force your hand. The avoidance gives temporary relief for hours, but multiplies the financial cost exponentially.';
        },
        dontTell: 'Avoidance is not laziness \\u2014 it is a trauma-based nervous system freeze response that requires gentle, structured desensitization.',
        watchIntro: 'Steps to break the avoidance freeze:',
        watch: function (a) {
          return [
            'Implement the \\u201CFive-Minute Financial Glance\\u201D \\u2014 log into your account once a week with a timer set for 5 minutes, then close it immediately',
            'Automate minimum payments on all critical debt so fees do not snowball while you build visibility tolerance',
            'Reward yourself with a cup of tea or a walk after looking at the numbers to rewire the threat response'
          ];
        }
      },
      'boundary-leakage': {
        path: 'Interpersonal Boundary Leakage',
        summary: 'You are serving as the financial shock absorber for other adults at the cost of your own security.',
        suggest: function (a) {
          return 'Your answers show that money is leaking out through relationships: lending money you cannot afford to lose, paying for meals you cannot afford, or bailing out family members. You are using money as a covert transaction to buy safety, avoid rejection, or maintain a sense of worth.';
        },
        dontTell: 'You cannot rescue other people by drowning yourself \\u2014 subsidizing other adults while your own emergency fund is zero is codependency, not generosity.',
        watchIntro: 'How to seal boundary leaks:',
        watch: function (a) {
          return [
            'Memorize and practice this phrase: \\u201CI love you, but my finances are committed right now and I cannot lend or cover that\\u201D',
            'Separate love from transactions \\u2014 true relationships survive financial boundaries; connections that end when the money stops were transactions, not friendships',
            'Calculate how much money you gave away in the last 12 months \\u2014 seeing the total number often provides the shock needed to set boundaries'
          ];
        }
      },
      'emotional-compensation': {
        path: 'Burnout & Emotional Compensation',
        summary: 'Using spending as an anesthetic to survive soul-crushing work exhaustion or status anxiety.',
        suggest: function (a) {
          return 'You earn decent money, but it evaporates because spending is your only available dopamine rescue from workplace burnout or feelings of inadequacy. The purchase provides a 20-minute peak of control and excitement, followed by days of shame when the statement arrives.';
        },
        dontTell: 'Budgeting apps will not cure emotional spending \\u2014 you must treat the underlying burnout and lack of life margin that drives the hunger for retail relief.',
        watchIntro: 'Interventions for emotional spending:',
        watch: function (a) {
          return [
            'Implement a mandatory 72-hour delay rule on all non-essential purchases \\u2014 remove stored credit cards from browser autofill',
            'Address the source of the exhaustion: if your job is destroying your health, spending money on gadgets won’t save you',
            'Find zero-cost dopamine alternatives: sleep, hot baths, library books, or intense physical exercise'
          ];
        }
      },
      'scarcity-script': {
        path: 'Unconscious Scarcity Script',
        summary: 'A childhood belief equating money with corruption or guilt creates an urge to spend down surpluses.',
        suggest: function (a) {
          return 'Growing up, money was either a source of screaming matches or viewed as spiritually corrupt. Consequently, your nervous system feels uncomfortable when your checking account has a cushion \\u2014 having money feels like an invitation for disaster or family conflict, so you subconsciously find ways to drain it back to zero.';
        },
        dontTell: 'Financial safety will feel like an emergency to an untreated scarcity script \\u2014 you must train your nervous system to tolerate stability as safe.',
        watchIntro: 'Rewiring the scarcity comfort zone:',
        watch: function (a) {
          return [
            'Create a \\u201CHidden Buffer\\u201D \\u2014 transfer savings to an online bank with no debit card that you do not see in daily banking',
            'Work with a certified financial therapist to explore childhood memories of financial trauma',
            'Affirm that financial stability is a protective tool for your family, not a moral betrayal'
          ];
        }
      },
      'not-enough-evidence': {
        path: 'Complex Financial Friction',
        summary: 'A combination of shifting factors that requires a month of honest tracking to untangle.',
        suggest: function (a) {
          return 'Your answers indicate that multiple factors are interacting: fluctuating income, variable expenses, and mixed emotional reactions. You need baseline data before choosing an intervention.';
        },
        dontTell: 'Do not buy quick-fix budgeting templates \\u2014 take 30 days to observe your inflows and outflows objectively.',
        watchIntro: 'Gathering clear baseline data:',
        watch: function (a) {
          return [
            'Track every single dollar spent for 30 days in a pocket notebook without judgment or forced restrictions',
            'Categorize expenses into Fixed Survival, Debt Servicing, and Discretionary Leaks',
            'Notice the emotions present during your top 3 largest discretionary purchases'
          ];
        }
      }
    },

    underneath: function (a, p) {
      if (p === 'avoidance-denial-loop' || a.avoidance_level === 'panic') {
        return {
          key: 'denial_as_shield',
          label: 'Using denial as a protective shield',
          text: 'Avoiding financial accounts is not irresponsible laziness; it is the mind’s desperate attempt to avoid feeling intense shame and terror. Acknowledging the fear with compassion is the only way to lower the threat response enough to open the app.'
        };
      }
      if (p === 'boundary-leakage' || a.boundary_leakage === 'severe_leak') {
        return {
          key: 'purchased_belonging',
          label: 'Paying a protection fee for belonging',
          text: 'Giving away your survival money to friends or family is often a covert attempt to buy safety against abandonment. True love respects your boundaries; anyone who leaves when you stop paying was an expense, not an ally.'
        };
      }
      if (p === 'emotional-compensation' || a.emotional_spending === 'burnout') {
        return {
          key: 'burnout_anesthetic',
          label: 'Shopping as an anesthetic for soul-crushing exhaustion',
          text: 'When life feels like a treadmill of endless obligation, buying something new feels like the only personal choice you get to make. The solution lies in reclaiming your time and rest, not in tighter budget restrictions.'
        };
      }
      return null;
    },

    practice: {
      free_first: {
        name: 'The 72-Hour Rule & Micro-Buffer',
        fit: 'For stopping leaks and building your first $500 safety cushion without spending money.',
        href: '/questions/money-wealth/',
        cta: 'Explore Money & Wealth Hub',
        secondary: { name: 'How to Manifest Money', fit: 'Self-efficacy vs magical thinking', href: '/guides/how-to-manifest-money' },
        note: 'Do not pay for readings when cash is tight; put every single dollar into your physical cushion.'
      },
      tarot_deep: {
        name: 'Tarot Reflection for Money Scripts',
        fit: 'For exploring emotional attachments to scarcity and unmasking career stagnation fears.',
        href: '/tarot/',
        cta: 'Explore reflective tarot',
        choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
        secondary: { name: 'Psychic vs Tarot', fit: 'Situation read vs reflective exploration', href: '/guides/psychic-vs-tarot' },
        note: 'Tarot is a mirror for unconscious patterns; it cannot balance your accounts or predict stock prices.'
      },
      tarot_decision: {
        name: 'Financial Therapy / AFC Counseling',
        fit: 'For resolving deep money avoidance, financial trauma, and chronic self-sabotage.',
        href: '/questions/money-wealth/',
        cta: 'See financial resources',
        secondary: { name: 'Should I Quit My Job?', fit: 'Career decision framework', href: '/questions/career-work/should-i-quit-my-job' },
        note: 'Accredited financial counselors (AFC) and financial therapists tackle the psychological root of money problems.'
      },
      closure: {
        name: 'Boundary Realignment & Dialogue',
        fit: 'For establishing financial boundaries with family and ending codependent financial rescue.',
        href: '/questions/money-wealth/',
        cta: 'Read boundary frameworks',
        secondary: { name: 'Do What Fits', fit: '7-question matcher', href: '/do-what-fits' },
        note: 'Saying no to others is the prerequisite to saying yes to your own financial survival.'
      },
      general: {
        name: 'Do What Fits',
        fit: 'When you are not sure whether this is an income problem, career crisis, or burnout.',
        href: '/do-what-fits',
        cta: 'Take the 7-question matcher',
        secondary: { name: 'Questions Hub', fit: 'Explore all life questions', href: '/questions/' },
        note: 'A fast, private matcher that diagnoses life crossroads without pushing paid readings.'
      },
      medium: {
        name: 'Not Applicable for Money',
        fit: 'Medium readings are for deceased loved ones; do not book a medium for money questions.',
        href: '/guides/medium-reading-guide',
        cta: 'See medium guide',
        choose: { name: 'What Mediums Actually Do', href: '/guides/medium-reading-guide' },
        secondary: { name: 'Psychic vs Medium', fit: 'Format differences', href: '/guides/psychic-vs-medium' },
        note: 'Never book a medium for financial issues.'
      },
      psychic: {
        name: 'Career Intuitive Consultation',
        fit: 'For exploring high-level vocational pivots, never for investment or cash-flow advice.',
        href: '/psychic/',
        cta: 'Read psychic guide',
        choose: { name: 'How to Choose a Psychic Reader', href: '/guides/how-to-choose-psychic-reader' },
        secondary: { name: 'Before Paying for a Reading', fit: 'Read before booking', href: '/guides/before-paying-psychic-reading' },
        note: 'Never ask a psychic for stock picks, lottery numbers, or curse removals; that is fraud territory.'
      }
    },

    matchPractice: function (a) {
      if (a.income_baseline === 'deficit' || a.avoidance_level === 'panic') {
        return 'free_first'; // Zero cost buffer plan
      }
      if (a.help === 'counseling' || a.scarcity_script === 'terror') {
        return 'tarot_decision'; // Financial therapy
      }
      if (a.help === 'reading' && a.income_baseline === 'surplus_leak') {
        return 'tarot_deep';
      }
      if (a.boundary_leakage === 'severe_leak') {
        return 'closure';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'why-am-i-always-broke', {
        negativePatternTip: {
          pattern: 'systemic-income-squeeze',
          text: 'when your expenses exceed income, paying a psychic for \\u201Cabundance clearing\\u201D only deepens the deficit. Focus every dollar on physical shelter and income strategy; math cannot be manifested away.'
        }
      });
    }
  },

  /* 5. WILL I BE RICH */
  'will-i-be-rich': {
    id: 'will-i-be-rich',
    title: 'What Is Your Desire for Wealth Really Asking For?',
    subtitle: 'Eight questions, about two minutes. It cuts through the fantasy of getting rich to identify what you are actually needing: safety, status, burnout relief, or practical career leverage.',
    launchSub: 'Eight questions, about two minutes. It reads whether your desire for wealth is driven by safety deficits, status anxiety, or strategic ambition, and matches you with a grounded next step.',
    questions: [
      {
        id: 'wealth_driver',
        q: 'What feeling is most prominent when you imagine having millions of dollars?',
        hint: 'The fantasy reveals the emotional deficiency in your waking life.',
        options: [
          { text: 'Permanent relief from terror \\u2014 knowing no one can evict, fire, or trap me', score: 'safety' },
          { text: 'Freedom to sleep, travel, and escape soul-crushing 60-hour work weeks', score: 'rest' },
          { text: 'Respect, admiration, and proving wrong the people who doubted or looked down on me', score: 'status' },
          { text: 'Excitement about building companies, creating art, or funding large projects', score: 'creation' }
        ]
      },
      {
        id: 'career_stage',
        q: 'Where do you currently stand in your career and wealth-building trajectory?',
        hint: 'Timing is developmental.',
        options: [
          { text: 'Early foundation stage (under 30) \\u2014 still acquiring marketable skills and paying entry dues', score: 'early' },
          { text: 'Mid-career plateau (30–45) \\u2014 earning okay money, but feel trapped by fixed expenses', score: 'plateau' },
          { text: 'Career crossroads \\u2014 considering launching a venture or changing industries', score: 'crossroads' },
          { text: 'Late career / transition \\u2014 worried about retirement security and legacy', score: 'late' }
        ]
      },
      {
        id: 'savings_rate',
        q: 'What happens to your money over a 12-month period?',
        hint: 'The math of wealth accumulation.',
        options: [
          { text: 'I consistently retain and invest 15–30%+ of my gross income into productive assets', detail: 'Consistent compounder', score: 'high_save' },
          { text: 'I save intermittently, but unexpected expenses or impulse spends drain it', detail: 'Unstable cushion', score: 'mid_save' },
          { text: 'Every dollar is spent each month \\u2014 savings remain at zero', detail: 'Zero accumulation', score: 'zero_save' },
          { text: 'I am actively accumulating consumer debt to fund my current lifestyle', detail: 'Negative trajectory', score: 'debt' },
          { text: 'I don’t track my annual retention', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'equity_leverage',
        q: 'Does your income scale with hours worked, or through assets and leverage?',
        hint: 'True wealth cannot be built on rented hours alone.',
        options: [
          { text: 'Strictly hours-for-dollars \\u2014 if I stop working, my income stops completely', detail: 'Zero leverage', score: 'hourly' },
          { text: 'Salary with minor bonuses, but no equity, royalties, or ownership', detail: 'Linear salary', score: 'salary' },
          { text: 'I have some equity, commission, or independent freelance leverage', detail: 'Partial leverage', score: 'partial_equity' },
          { text: 'I own equity, business assets, intellectual property, or significant investments', detail: 'Scalable ownership', score: 'owner' },
          { text: 'I am currently unemployed or in transition', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'delayed_gratification',
        q: 'Can you work diligently on a project for 2–3 years without immediate financial returns?',
        hint: 'The planning fallacy means big payoffs take years of invisible labor.',
        options: [
          { text: 'Yes \\u2014 I have a track record of multi-year patient execution', detail: 'High stamina', score: 'patient' },
          { text: 'I can manage 6 to 12 months, but start panicking if returns don’t show', detail: 'Moderate stamina', score: 'moderate' },
          { text: 'No \\u2014 I need quick wins and tend to abandon projects after a few months', detail: 'Quick-win seeker', score: 'impatient' },
          { text: 'I constantly jump between shiny new business ideas and get-rich concepts', detail: 'Shiny object syndrome', score: 'scattered' },
          { text: 'I have never tried building a long-term independent venture', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'risk_tolerance',
        q: 'How do you react when an investment or venture drops 20–30% in market value?',
        hint: 'Wealth creation requires emotional tolerance of volatility.',
        options: [
          { text: 'Calm \\u2014 I understand market cycles and view drawdowns as buying opportunities', detail: 'High risk tolerance', score: 'calm_investor' },
          { text: 'Nervous, but I hold on according to my long-term plan', detail: 'Moderate tolerance', score: 'nervous_holder' },
          { text: 'Panic \\u2014 I sell immediately at the bottom to stop the bleeding', detail: 'Low tolerance', score: 'panic_seller' },
          { text: 'I have never invested in assets with volatility', detail: 'Uncertain', score: null }
        ]
      },
      {
        id: 'want',
        q: 'What is the primary reason you are asking this question today?',
        hint: 'Identify what triggered the inquiry.',
        options: [
          { text: 'Exhaustion \\u2014 I feel like a hamster on a wheel and need hope of an exit', score: 'burnout_exit' },
          { text: 'Security panic \\u2014 I feel terrified of poverty, medical bills, or homelessness', score: 'terror_security' },
          { text: 'Status comparison \\u2014 seeing peers succeed while I feel left behind', score: 'peer_comparison' },
          { text: 'Strategic career planning \\u2014 deciding where to invest my next 5 years', score: 'strategic_pivot' }
        ]
      },
      {
        id: 'help',
        q: 'What would feel most grounding and valuable right now?',
        hint: 'Select the tool that matches your actual developmental need.',
        options: [
          { text: 'A reality check on what wealth actually requires vs. fantasy promises', score: 'reality_framework' },
          { text: 'An astrology transit reading on career timing and Saturn / Jupiter cycles', score: 'astrology' },
          { text: 'A career coach or mentor to help me negotiate leverage and equity', score: 'career_coach' },
          { text: 'A fiduciary financial advisor to optimize my actual savings and investments', score: 'financial_advisor' }
        ]
      }
    ],

    resolve: function (a) {
      if (a.wealth_driver === 'safety' || a.want === 'terror_security') {
        return 'security-buffer-deficit';
      }
      if (a.wealth_driver === 'rest' || a.want === 'burnout_exit') {
        return 'burnout-escape-fantasy';
      }
      if (a.wealth_driver === 'status' || a.want === 'peer_comparison') {
        return 'status-validation-hunt';
      }
      if (a.savings_rate === 'high_save' && (a.equity_leverage === 'owner' || a.equity_leverage === 'partial_equity')) {
        return 'strategic-builder';
      }
      if (a.delayed_gratification === 'scattered' || a.savings_rate === 'debt') {
        return 'burnout-escape-fantasy';
      }
      var nullCount = 0;
      if (a.savings_rate === null) nullCount++;
      if (a.equity_leverage === null) nullCount++;
      if (a.delayed_gratification === null) nullCount++;
      if (a.risk_tolerance === null) nullCount++;
      if (nullCount >= 2) {
        return 'not-enough-evidence';
      }
      return 'strategic-builder';
    },

    results: {
      'security-buffer-deficit': {
        path: 'Security Deficit & Safety Longing',
        summary: 'You do not actually crave luxury; your nervous system is exhausted and crying out for safety.',
        suggest: function (a) {
          return 'Your answers show that your desire for wealth is rooted in survival terror. You imagine being a multimillionaire not to buy sports cars, but to ensure no landlord, boss, or medical emergency can ever threaten your survival again. Confusing this need for safety with extreme wealth keeps you searching for impossible windfalls instead of building an immediate emergency cushion.';
        },
        dontTell: 'You do not need $10M to feel safe \\u2014 reaching an automated emergency fund of 6 months of living expenses relieves 90% of the terror you are currently carrying.',
        watchIntro: 'Pragmatic moves for survival safety:',
        watch: function (a) {
          return [
            'Stop daydreaming about lottery wins or billionaire charts \\u2014 direct all energy into building your first $1,000, then 3 months, then 6 months of liquid cash',
            'Notice how every month of savings buffer directly lowers your daytime cortisol levels',
            'Invest in health insurance and term life insurance to protect against catastrophic tail risk'
          ];
        }
      },
      'burnout-escape-fantasy': {
        path: 'Burnout Escape Fantasy',
        summary: 'Dreaming of wealth is serving as a mental escape hatch from an exhausting, unfulfilling job.',
        suggest: function (a) {
          return 'When work feels like an inescapable prison of 60-hour weeks, the mind naturally retreats into fantasies of sudden wealth: winning the lottery, crypto windfalls, or a psychic promising riches. The fantasy gives you just enough dopamine to survive another week on the treadmill, but keeps you from making real structural career changes.';
        },
        dontTell: 'Waiting for a windfall is deferring your life \\u2014 you need rest, healthy boundaries, and a vocational pivot today, not an imaginary yacht in 2035.',
        watchIntro: 'Steps to dismantle the burnout escape:',
        watch: function (a) {
          return [
            'Recognize that wealth fantasies are a symptom of exhaustion: evaluate your workload before buying into get-rich schemes',
            'Start planning an honest career transition or negotiating a reduction in hours at your current job',
            'Do not gamble savings on volatile high-risk assets hoping for a quick exit'
          ];
        }
      },
      'status-validation-hunt': {
        path: 'Status & Validation Hunt',
        summary: 'Equating net worth with self-worth in an attempt to shield yourself from feelings of inadequacy.',
        suggest: function (a) {
          return 'You want to be wealthy so that peers, family, or society will finally respect you and recognize your worth. While understandable in a hyper-capitalist culture, psychological research proves that external wealth never cures internal inadequacy. If you feel inferior today, you will simply become a wealthy person with deep imposter syndrome.';
        },
        dontTell: 'Net worth is not self-worth \\u2014 buying luxury status symbols to impress people you don’t like keeps you chronically broke and spiritually hollow.',
        watchIntro: 'Rewiring status anxiety:',
        watch: function (a) {
          return [
            'Audit your social media consumption: mute accounts that trigger toxic comparison and lifestyle envy',
            'Build self-worth in domains where money has no authority: physical fitness, deep friendships, artistic crafts, and integrity',
            'Remember the Millionaire Next Door finding: real wealth is silent and frugal; conspicuous luxury is usually financed by debt'
          ];
        }
      },
      'strategic-builder': {
        path: 'Strategic Long-Term Builder',
        summary: 'You have the mathematical and behavioral habits of genuine compounding; patience is your game.',
        suggest: function (a) {
          return 'Your answers show high savings discipline, partial or growing asset leverage, and realistic risk tolerance. You understand that wealth is not an event, but a compounding process that takes decades of quiet consistency. Your challenge is simply enduring the plateau while the curve remains flat.';
        },
        dontTell: 'Astrology can confirm timing chapters, but it cannot speed up the mathematics of compound interest \\u2014 stay the course.',
        watchIntro: 'Optimizing your compounding curve:',
        watch: function (a) {
          return [
            'Protect your portfolio from catastrophic errors \\u2014 avoid excessive leverage and speculative gambles',
            'Continue increasing your equity ownership: transition from hourly billing to asset-backed revenue',
            'Use astrological cycles (Saturn and Jupiter transits) to identify when to build foundations vs. when to expand'
          ];
        }
      },
      'not-enough-evidence': {
        path: 'Developing Financial Ambition',
        summary: 'Your relationship with money and career leverage is in an early, fluid discovery stage.',
        suggest: function (a) {
          return 'You have strong ambitions, but haven’t yet settled on the vehicle or habits required to build scale. That is normal in your early career. The focus should be on skill mastery and financial literacy rather than predicting the outcome.';
        },
        dontTell: 'You do not need to know your 20-year destination \\u2014 mastering one valuable market skill in the next 18 months moves you further than any fortune-teller.',
        watchIntro: 'Focusing your energy:',
        watch: function (a) {
          return [
            'Focus on skill acquisition: become top 10% in a valuable, specialized domain',
            'Read foundational financial literature: *The Millionaire Next Door*, *The Psychology of Money*',
            'Practice living well below your means now so that future raises compound automatically'
          ];
        }
      }
    },

    underneath: function (a, p) {
      if (p === 'security-buffer-deficit' || a.wealth_driver === 'safety') {
        return {
          key: 'terror_of_vulnerability',
          label: 'The terror of living without a financial shock absorber',
          text: 'When you have no savings, a broken car or unexpected medical bill feels like total destruction. You dream of being rich because you want to breathe. Building an emergency fund cures this terror long before you reach luxury.'
        };
      }
      if (p === 'burnout-escape-fantasy' || a.wealth_driver === 'rest') {
        return {
          key: 'exhaustion_escape',
          label: 'The fantasy of an exit door from chronic exhaustion',
          text: 'Dreaming of millions is often the only mental vacation an exhausted worker allows themselves. Reclaiming real rest, setting work boundaries, and planning a career pivot is the honest way out.'
        };
      }
      if (p === 'status-validation-hunt' || a.wealth_driver === 'status') {
        return {
          key: 'imposter_shame',
          label: 'Using money to purchase unconditional respect',
          text: 'Hoping wealth will silence childhood shame or family disrespect is a tragic trap. External admiration from shallow observers never heals the soul; true self-worth must be built on character and self-compassion.'
        };
      }
      return null;
    },

    practice: {
      free_first: {
        name: 'The Compounding Baseline Plan',
        fit: 'For focusing on savings rates, equity acquisition, and real wealth habits without cost.',
        href: '/questions/money-wealth/',
        cta: 'Explore Money & Wealth Hub',
        secondary: { name: 'Why Am I Always Broke?', fit: 'Diagnosing leaks and money scripts', href: '/questions/money-wealth/why-am-i-always-broke' },
        note: 'Every dollar spent on fortune-tellers is a dollar that cannot compound in your index funds.'
      },
      tarot_decision: {
        name: 'Tarot for Career Crossroads',
        fit: 'For exploring blind spots, fear of risk, and vocational dilemmas.',
        href: '/tarot/',
        cta: 'Explore decision spreads',
        choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
        secondary: { name: 'Should I Quit My Job?', fit: 'Job transition framework', href: '/questions/career-work/should-i-quit-my-job' },
        note: 'Tarot helps you evaluate how you feel about taking entrepreneurial risks; it cannot predict financial returns.'
      },
      astrology: {
        name: 'Astrology Career & Timing Reading',
        fit: 'For understanding your Saturn and Jupiter cycles, 2nd/10th house themes, and vocational chapters.',
        href: '/astrology/',
        cta: 'Read astrology timing guide',
        choose: { name: 'How to Choose an Astrologer', href: '/guides/how-to-choose-astrologer' },
        secondary: { name: 'Birth Chart Reading Cost', fit: 'Know what you are paying for', href: '/guides/birth-chart-reading-cost' },
        note: 'Astrology outlines timing chapters of discipline vs expansion; it cannot guarantee dollar windfalls.'
      },
      tarot_deep: {
        name: 'Career & Executive Coaching',
        fit: 'For negotiating compensation, equity stakes, and acquiring high-value market skills.',
        href: '/questions/career-work/',
        cta: 'Explore Career & Work Hub',
        secondary: { name: 'Will I Get the Job?', fit: 'Interview and hiring guidance', href: '/questions/career-work/will-i-get-the-job' },
        note: 'Real market leverage is built through negotiation and skill mastery, not mystical manifestations.'
      },
      closure: {
        name: 'Fiduciary Wealth Management (CFP)',
        fit: 'For portfolio construction, tax optimization, and wealth preservation.',
        href: '/questions/money-wealth/',
        cta: 'See financial resources',
        secondary: { name: 'Do What Fits', fit: '7-question matcher', href: '/do-what-fits' },
        note: 'Always use certified financial planners with fiduciary duties for actual money decisions.'
      },
      general: {
        name: 'Do What Fits',
        fit: 'When you are weighing career pivots, financial dread, and life purpose all at once.',
        href: '/do-what-fits',
        cta: 'Take the 7-question matcher',
        secondary: { name: 'Questions Hub', fit: 'Explore all life questions', href: '/questions/' },
        note: 'A fast, private matcher that diagnoses life crossroads without pushing paid readings.'
      },
      medium: {
        name: 'Not Applicable',
        fit: 'Medium readings are for grief; do not consult a medium for career or wealth questions.',
        href: '/guides/medium-reading-guide',
        cta: 'See medium guide',
        choose: { name: 'What Mediums Actually Do', href: '/guides/medium-reading-guide' },
        secondary: { name: 'Psychic vs Medium', fit: 'Format differences', href: '/guides/psychic-vs-medium' },
        note: 'Never consult a medium for wealth questions.'
      },
      psychic: {
        name: 'Situational Psychic Reading',
        fit: 'Not recommended for wealth prediction \\u2014 wealth cannot be foretold by intuition.',
        href: '/guides/before-paying-psychic-reading',
        cta: 'Read before paying',
        choose: { name: 'How to Choose a Psychic Reader', href: '/guides/how-to-choose-psychic-reader' },
        secondary: { name: 'Psychic Reading Cost', fit: 'Pricing guide', href: '/guides/psychic-reading-cost' },
        note: 'Psychic predictions of future wealth are the #1 red-flag scam in online readings.'
      }
    },

    matchPractice: function (a) {
      if (a.help === 'astrology' || a.career_stage === 'crossroads') {
        return 'astrology';
      }
      if (a.help === 'career_coach') {
        return 'tarot_deep';
      }
      if (a.help === 'financial_advisor' && a.savings_rate === 'high_save') {
        return 'closure'; // Fiduciary planning
      }
      if (a.wealth_driver === 'rest' || a.wealth_driver === 'safety') {
        return 'free_first';
      }
      return 'free_first';
    },

    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'will-i-be-rich', {
        negativePatternTip: {
          pattern: 'burnout-escape-fantasy',
          text: 'when a psychic promises you millions to relieve the dread of your job, they are selling you an expensive daydream. Real relief comes from setting boundaries, cutting living costs, and planning a vocational transition today.'
        }
      });
    }
  },

};"""

new_content = content.replace(target_tail, batch1_quizzes_code)
quizzes_file.write_text(new_content, encoding="utf-8")
print("SUCCESS: Batch 1 quizzes successfully appended to quizzes.js!")
