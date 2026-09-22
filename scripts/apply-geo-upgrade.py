import os
import re

UPGRADES = {
    "questions/loss-closure/signs-from-deceased-loved-ones.html": {
        "title": "Signs From Deceased Loved Ones: 4-Signal Diagnostic & Meaning | MysticDo",
        "desc": "Distinguish continuing bonds from hypervigilance. Audit your experience with the 4-Signal Bereavement Diagnostic (free, client-side, 5 archetypes) and guide.",
        "prop_name": "MysticDo Bereavement Signal Diagnostic (4-Signal MBSD)",
        "tool_desc": "A free, interactive two-minute clinical diagnostic. Eight questions evaluate your experience across four behavioral signals — encounter frequency, emotional valence, somatic regulation, and compulsive scanning — sorting responses into five validated bereavement archetypes without collecting personal data.",
        "front_panel_sub": "Determining whether recurring sensory anomalies reflect healthy continuing bonds, cognitive priming, or acute grief hypervigilance requires auditing four observable signals: temporal frequency, emotional valence, somatic regulation, and compulsive scanning. The MysticDo Bereavement Signal Diagnostic on this page evaluates these four dimensions directly in your browser, classifying your situation into one of 5 distinct coping archetypes without collecting personal data.",
        "faq_q": "How do I diagnose whether my signs from a deceased loved one are healthy or compulsive?",
        "faq_a": "Distinguishing between comforting continuing bonds and anxious hypervigilance requires auditing four behavioral signals: encounter frequency, emotional valence (peace vs. panic), somatic regulation, and compulsive scanning. You can evaluate your personal profile on this page using the free MysticDo Bereavement Signal Diagnostic. The 8-question instrument runs entirely within your browser, classifies your responses into one of five distinct bereavement archetypes, and provides grounded next steps without collecting personal data or requiring an email.",
    },
    "questions/loss-closure/dream-about-deceased-loved-one.html": {
        "title": "Dream About Deceased Loved One: 4-Signal Dream Diagnostic | MysticDo",
        "desc": "Was your dream a visitation or grief processing? Audit your REM sleep with the 4-Signal Bereavement Dream Diagnostic (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Bereavement Dream Diagnostic (4-Signal MBDD)",
        "tool_desc": "A free, interactive two-minute sleep psychology diagnostic. Eight questions audit dream narrative coherence, emotional wake-state, daytime replay, and relational friction to classify your dream into five emotional processing archetypes without storing personal data.",
        "front_panel_sub": "Determining whether a bereavement dream functions as therapeutic emotional resolution, memory consolidation, or acute trauma replay requires auditing four diagnostic signals: narrative coherence, post-awakening somatic state, daytime replay frequency, and unresolved relational friction. The MysticDo Bereavement Dream Diagnostic on this page evaluates these dimensions directly in your browser, classifying your dream into one of 5 distinct processing archetypes without collecting personal data.",
        "faq_q": "How do I diagnose whether my dream of a deceased loved one was a visitation or grief processing?",
        "faq_a": "Evaluating whether your dream signifies emotional closure, memory consolidation, or trauma replay requires auditing four clinical dimensions: narrative coherence, emotional wake-state, replay frequency, and daytime rumination. You can assess your dream on this page using the free MysticDo Bereavement Dream Diagnostic. The 8-question instrument executes client-side in your browser, mapping your experience into one of five validated psychological archetypes without collecting personal data or requiring an email.",
    },
    "questions/loss-closure/is-my-loved-one-watching-over-me.html": {
        "title": "Is My Loved One Watching Over Me? 4-Signal Alignment Screener | MysticDo",
        "desc": "Is wonder bringing comfort or decision paralysis? Audit your grief connection with the 4-Signal Continuing Bonds Screener (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Continuing Bonds Alignment Screener (4-Signal MCBA)",
        "tool_desc": "A free, interactive two-minute bereavement alignment screener. Eight questions evaluate your connection across agency retention, emotional relief, surveillance urges, and life movement, classifying your experience into five continuing-bonds archetypes without collecting personal data.",
        "front_panel_sub": "Diagnosing whether wondering if a deceased loved one is watching brings healthy comfort or creates maladaptive decision paralysis requires auditing four behavioral signals: personal agency retention, emotional relief versus anxiety, compulsive surveillance, and autonomy in life choices. The MysticDo Continuing Bonds Alignment Screener on this page evaluates these four dimensions directly in your browser, categorizing your experience into one of 5 coping archetypes without storing personal data.",
        "faq_q": "How do I diagnose whether feeling watched over by a loved one is helping or hurting my grief?",
        "faq_a": "Determining whether this feeling is fostering healthy continuing bonds or reinforcing decision paralysis requires evaluating four behavioral signals: agency in daily choices, emotional relief vs. dread, sign-seeking urgency, and life forward-movement. You can evaluate your situation on this page using the free MysticDo Continuing Bonds Alignment Screener. The 8-question instrument computes directly in your browser, sorting your experience into one of five distinct relational archetypes without storing personal data or requiring an email.",
    },
    "questions/money-wealth/why-am-i-always-broke.html": {
        "title": "Why Am I Always Broke? 4-Signal Scarcity Diagnostic | MysticDo",
        "desc": "Discover which unconscious money script drains your cash flow. Take the 4-Signal Scarcity Bandwidth Diagnostic (free, client-side, 5 archetypes) and reality guide.",
        "prop_name": "MysticDo Scarcity Bandwidth Diagnostic (4-Signal MSBD)",
        "tool_desc": "A free, interactive two-minute financial psychology diagnostic. Eight questions evaluate your cash flow margin, cognitive stress overhead, emotional spend triggers, and relational boundaries, classifying your financial cycle into five archetypes without storing personal data.",
        "front_panel_sub": "Diagnosing whether persistent financial depletion is driven by structural wage math, executive bandwidth exhaustion, unconscious money scripts, or boundary collapse requires evaluating four behavioral signals: cash flow margin, cognitive stress overhead, emotional spend triggers, and relational financial boundaries. The MysticDo Scarcity Bandwidth Diagnostic on this page audits these four dimensions directly in your browser, classifying your situation into one of 5 distinct financial archetypes without storing personal data.",
        "faq_q": "How do I diagnose which unconscious money script is keeping me broke?",
        "faq_a": "Auditing whether your financial depletion stems from structural deficits, avoidance scripts, status compensation, or emotional boundaries requires evaluating four observable signals: net cash flow margin, cognitive stress load, emotional spending triggers, and boundary setting. You can diagnose your pattern on this page using the free MysticDo Scarcity Bandwidth Diagnostic. The 8-question instrument executes client-side in your browser, classifying your profile into one of five distinct behavioral archetypes without storing personal data or requiring an email.",
    },
    "questions/money-wealth/will-i-be-rich.html": {
        "title": "Will I Be Rich? 4-Signal Financial Reality Diagnostic | MysticDo",
        "desc": "Break free from magical manifestation thinking. Audit your wealth trajectory with the 4-Signal Financial Reality Screener (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Wealth Expectation & Reality Screener (4-Signal MWER)",
        "tool_desc": "A free, interactive two-minute wealth mindset diagnostic. Eight questions evaluate capital compounding discipline, asymmetric risk management, emotional status drivers, and fortune-telling reliance, sorting responses into five reality-grounded archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether your aspiration for wealth is grounded in economic leverage, safety deficits, status anxiety, or magical manifestation avoidance requires auditing four behavioral signals: capital compounding discipline, asymmetric risk exposure, emotional motivation driver, and reliance on passive fortune-telling. The MysticDo Wealth Expectation & Reality Screener on this page evaluates these dimensions directly in your browser, classifying your approach into one of 5 wealth archetypes without storing personal data.",
        "faq_q": "How do I diagnose whether my desire to be rich is realistic ambition or an anxiety escape?",
        "faq_a": "Determining whether your financial drive is built on leverage, status panic, or magical avoidance requires evaluating four observable behaviors: asymmetric capital allocation, patience under compounding, emotional motivation, and reliance on fortune forecasts. You can assess your profile on this page using the free MysticDo Wealth Expectation & Reality Screener. The 8-question tool runs entirely in your browser, mapping your responses into one of five distinct financial archetypes without storing personal data or requiring an email.",
    },
    "questions/angel-numbers/444-meaning.html": {
        "title": "444 Meaning: 4-Signal Autonomic Grounding Screener | MysticDo",
        "desc": "Why do you see 444 everywhere? Audit your stress response with the 4-Signal Autonomic Grounding Screener (free, client-side, 5 archetypes) and cognitive guide.",
        "prop_name": "MysticDo Autonomic Grounding Screener (4-Signal MAGS-444)",
        "tool_desc": "A free, interactive two-minute autonomic nervous-system screener. Eight questions evaluate your physiological stress arousal, perceived safety deficits, visual scanning frequency, and grounding effectiveness, categorizing your experience into five nervous-system archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether seeing 444 serves as a healthy somatic grounding anchor, a response to acute nervous system exhaustion, or compulsive attentional priming requires auditing four behavioral signals: autonomic stress arousal, perceived safety deficit, pattern scanning frequency, and grounding effectiveness. The MysticDo Autonomic Grounding Screener on this page evaluates these dimensions directly in your browser, classifying your experience into one of 5 distinct psychological archetypes without collecting personal data.",
        "faq_q": "How do I diagnose what seeing angel number 444 actually means for my stress levels?",
        "faq_a": "Determining whether noticing 444 is a stabilizing grounding anchor or a symptom of acute nervous system hyperarousal requires auditing four signals: autonomic arousal, environmental stress load, visual scanning frequency, and immediate emotional effect. You can evaluate your pattern on this page using the free MysticDo Autonomic Grounding Screener. The 8-question instrument executes directly in your browser, categorizing your experience into one of five distinct nervous-system archetypes without collecting personal data or requiring an email.",
    },
    "questions/angel-numbers/333-meaning.html": {
        "title": "333 Meaning: 4-Signal Decision Crossroads Screener | MysticDo",
        "desc": "Is 333 urging you to make a choice? Audit your decision friction with the 4-Signal Decision Crossroads Screener (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Decision Crossroads Screener (4-Signal MDCS-333)",
        "tool_desc": "A free, interactive two-minute decision conflict screener. Eight questions evaluate decision friction, cognitive dissonance, creative hesitation, and commitment execution, classifying your situation into five choice archetypes without storing personal data.",
        "front_panel_sub": "Diagnosing whether seeing 333 reflects genuine alignment readiness, decision avoidance paralysis, or confirmation bias requires auditing four behavioral signals: unresolved decision friction, cognitive dissonance intensity, creative hesitation, and commitment execution. The MysticDo Decision Crossroads Screener on this page evaluates these dimensions directly in your browser, classifying your situation into one of 5 distinct choice archetypes without collecting personal data.",
        "faq_q": "How do I diagnose whether seeing angel number 333 indicates an urgent life decision?",
        "faq_a": "Evaluating whether recurring sightings of 333 stem from an unresolved developmental crossroad or compulsive pattern seeking requires auditing four behavioral signals: decision friction, cognitive dissonance, somatic tension, and commitment follow-through. You can diagnose your situation on this page using the free MysticDo Decision Crossroads Screener. The 8-question tool runs in your browser, classifying your state into one of five distinct choice archetypes without collecting personal data or requiring an email.",
    },
    "questions/angel-numbers/777-meaning.html": {
        "title": "777 Meaning: 4-Signal Introspection Diagnostic | MysticDo",
        "desc": "Is 777 a lucky jackpot or a call to deeper wisdom? Audit your cognitive state with the 4-Signal Introspection Diagnostic (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Introspection vs. Jackpot Diagnostic (4-Signal MIJD-777)",
        "tool_desc": "A free, interactive two-minute cognitive reflection diagnostic. Eight questions evaluate contemplative depth, jackpot fallacy wishfulness, intellectual fatigue, and grounded reality testing, sorting your state into five cognitive archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether seeing 777 marks genuine contemplative wisdom, escapist jackpot fallacy thinking, or intellectual burnout requires auditing four behavioral signals: introspective depth, wishful outcome dependence, intellectual fatigue, and grounded reality testing. The MysticDo Introspection vs. Jackpot Diagnostic on this page assesses these dimensions directly in your browser, sorting your experience into one of 5 distinct cognitive archetypes without storing personal data.",
        "faq_q": "How do I diagnose whether seeing 777 is genuine confirmation or wishful thinking?",
        "faq_a": "Distinguishing between authentic contemplative breakthrough and variable-ratio reinforcement (the jackpot fallacy) requires evaluating four signals: internal reflection quality, outcome urgency, intellectual strain, and pragmatic boundary holding. You can diagnose your pattern on this page using the free MysticDo Introspection vs. Jackpot Diagnostic. The 8-question instrument executes client-side in your browser, classifying your experience into one of five distinct cognitive archetypes without storing personal data or requiring an email.",
    },
    "questions/angel-numbers/555-meaning.html": {
        "title": "555 Meaning: 4-Signal Life Transition Screener | MysticDo",
        "desc": "Are massive changes coming, or are you in transition anxiety? Audit your adaptability with the 4-Signal Life Transition Screener (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Life Transition Readiness Screener (4-Signal MLTR-555)",
        "tool_desc": "A free, interactive two-minute adaptation screener. Eight questions evaluate transition control, anticipatory stress spikes, somatic flexibility, and agency follow-through, mapping your state into five transition archetypes without storing personal data.",
        "front_panel_sub": "Diagnosing whether seeing 555 reflects active transition readiness, anticipatory anxiety overload, or restless boredom requires auditing four behavioral signals: transition vector control, anticipatory stress spikes, somatic adaptability, and agency mobilization. The MysticDo Life Transition Readiness Screener on this page evaluates these dimensions directly in your browser, classifying your state into one of 5 distinct adaptation archetypes without collecting personal data.",
        "faq_q": "How do I diagnose whether seeing 555 signals impending disruption or readiness for change?",
        "faq_a": "Determining whether 555 reflects true developmental readiness, acute anticipatory anxiety, or situational stagnation requires evaluating four signals: perceived control over changes, stress escalation, somatic adaptability, and concrete action steps. You can assess your readiness on this page using the free MysticDo Life Transition Readiness Screener. The 8-question tool computes directly in your browser, sorting your state into one of five distinct transition archetypes without collecting personal data or requiring an email.",
    },
    "questions/angel-numbers/888-meaning.html": {
        "title": "888 Meaning: 4-Signal Reciprocity Audit Diagnostic | MysticDo",
        "desc": "Is financial abundance manifesting, or is energy unbalanced? Audit your exchange with the 4-Signal Reciprocity Diagnostic (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Reciprocity & Abundance Diagnostic (4-Signal MRAA-888)",
        "tool_desc": "A free, interactive two-minute exchange and equity diagnostic. Eight questions evaluate effort-reward equity, transactional resentment, budgeting stewardship, and magical rescue beliefs, sorting your profile into five equity archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether seeing 888 reflects genuine material harvest, an overdue reciprocity audit, or a fantasy of effortless rescue requires auditing four behavioral signals: effort-to-reward balance, transactional resentment, resource stewardship discipline, and magical thinking reliance. The MysticDo Reciprocity & Abundance Diagnostic on this page assesses these dimensions directly in your browser, classifying your situation into one of 5 distinct equity archetypes without storing personal data.",
        "faq_q": "How do I diagnose whether seeing 888 is an abundance sign or an unaddressed imbalance?",
        "faq_a": "Auditing whether 888 signifies earned material yield, severe interpersonal over-giving, or an escapist relief fantasy requires evaluating four signals: reciprocity equity, boundary resentment, practical budgeting discipline, and magical rescue beliefs. You can diagnose your pattern on this page using the free MysticDo Reciprocity & Abundance Diagnostic. The 8-question tool executes client-side in your browser, classifying your responses into one of five distinct equity archetypes without storing personal data or requiring an email.",
    },
    "questions/tarot/tower-card-meaning.html": {
        "title": "Tower Tarot Card Meaning: 4-Signal Crisis Diagnostic | MysticDo",
        "desc": "Did you pull the Tower? Audit your structural collapse or liberation with the 4-Signal Structural Crisis Diagnostic (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Structural Crisis Archetype Diagnostic (4-Signal MSCD)",
        "tool_desc": "A free, interactive two-minute crisis psychology diagnostic. Eight questions audit foundation stability, anticipatory dread, denial postures, and rebuilding capacity, categorizing your life disruption into five structural crisis archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether pulling the Tower tarot card reflects an active unavoidable collapse, anticipatory dread of overdue change, or a liberating release of false structures requires auditing four diagnostic signals: structural stability, catastrophic anticipation, resistance posture, and rebuilding agency. The MysticDo Structural Crisis Archetype Diagnostic on this page evaluates these dimensions directly in your browser, classifying your crisis into one of 5 distinct developmental archetypes without collecting personal data.",
        "faq_q": "How do I diagnose what the Tower card signifies for my current life disruption?",
        "faq_a": "Determining whether the Tower signifies genuine structural collapse, anticipatory anxiety, or the overdue liberation of an inauthentic role requires auditing four signals: reality foundation stability, dread intensity, denial mechanisms, and reconstruction capacity. You can evaluate your situation on this page using the free MysticDo Structural Crisis Archetype Diagnostic. The 8-question instrument executes client-side in your browser, classifying your crisis into one of five distinct developmental archetypes without collecting personal data or requiring an email.",
    },
    "questions/tarot/lovers-card-meaning.html": {
        "title": "Lovers Tarot Card Meaning: 4-Signal Values Alignment Screener | MysticDo",
        "desc": "Is it soulmate destiny or a moral values crossroad? Audit your spread with the 4-Signal Values Alignment Screener (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Relational Values Alignment Screener (4-Signal MRVA)",
        "tool_desc": "A free, interactive two-minute relational values screener. Eight questions evaluate core value congruence, moral crossroad tension, romantic projection, and personal autonomy, sorting your spread into five alignment archetypes without storing personal data.",
        "front_panel_sub": "Diagnosing whether pulling the Lovers tarot card signifies authentic relational alignment, romanticized psychological projection, or an internal values crossroad requires auditing four diagnostic signals: core value congruence, decision tension, projection intensity, and personal autonomy maintenance. The MysticDo Relational Values Alignment Screener on this page evaluates these dimensions directly in your browser, categorizing your dynamic into one of 5 distinct alignment archetypes without storing personal data.",
        "faq_q": "How do I diagnose whether the Lovers card points to a romantic partner or an internal decision?",
        "faq_a": "Evaluating whether the Lovers represents relational harmony, infatuation projection, or an existential moral choice requires auditing four observable signals: shared value reciprocity, internal conflict, idealization versus reality testing, and boundary health. You can diagnose your spread on this page using the free MysticDo Relational Values Alignment Screener. The 8-question instrument executes in your browser, classifying your dynamic into one of five distinct alignment archetypes without storing personal data or requiring an email.",
    },
    "questions/tarot/tarot-yes-or-no.html": {
        "title": "Tarot Yes or No: 4-Signal Decision Conflict Diagnostic | MysticDo",
        "desc": "Why does yes-or-no tarot cause anxiety? Audit your choice with the 4-Signal Decision Conflict Diagnostic (free, client-side, 5 archetypes) and guide.",
        "prop_name": "MysticDo Binary Decision Conflict Diagnostic (4-Signal MBDC)",
        "tool_desc": "A free, interactive two-minute decision conflict diagnostic. Eight questions evaluate outcome fixation urgency, decision avoidance, binary distortion, and responsibility reclamation, classifying your inquiry into five decision archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether asking tarot a yes-or-no question is clarifying your intent, offloading personal responsibility, or fueling obsessive anxiety requires auditing four behavioral signals: outcome fixation, responsibility avoidance, binary framing rigidity, and action follow-through. The MysticDo Binary Decision Conflict Diagnostic on this page evaluates these dimensions directly in your browser, classifying your decision process into one of 5 distinct cognitive archetypes without storing personal data.",
        "faq_q": "How do I diagnose why asking tarot yes-or-no questions is making me more anxious?",
        "faq_a": "Auditing whether yes-or-no tarot spreads are serving decision clarity or reinforcing cognitive paralysis requires evaluating four signals: urgency to offload choice, repetitive card pulling, binary distortion, and post-reading relief vs. panic. You can assess your decision dynamic on this page using the free MysticDo Binary Decision Conflict Diagnostic. The 8-question tool runs in your browser, classifying your pattern into one of five distinct decision archetypes without storing personal data or requiring an email.",
    },
    "questions/dreams/dream-about-being-chased.html": {
        "title": "Dream About Being Chased: 4-Signal Avoidance Screener | MysticDo",
        "desc": "What are you running from in waking life? Audit your flight response with the 4-Signal Avoidance Screener (free, client-side, 5 archetypes) and dream guide.",
        "prop_name": "MysticDo Threat Simulation & Avoidance Screener (4-Signal MTSA)",
        "tool_desc": "A free, interactive two-minute threat simulation screener. Eight questions evaluate waking avoidance salience, post-awakening physiological arousal, pursuer projection characteristics, and confrontation capacity, categorizing your dream into five stress archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether a chase dream signifies active waking avoidance, chronic nervous system overwhelm, or unintegrated emotional conflict requires auditing four behavioral signals: daytime avoidance salience, post-awakening physiological arousal, pursuer projection characteristics, and confrontation capacity. The MysticDo Threat Simulation & Avoidance Screener on this page evaluates these dimensions directly in your browser, classifying your dream into one of 5 distinct stress archetypes without storing personal data.",
        "faq_q": "How do I diagnose what the person or thing chasing me in my dream represents?",
        "faq_a": "Decoding whether your pursuer represents an unaddressed confrontation, chronic burnout, emotional guilt, or physical stress requires evaluating four signals: waking avoidance behavior, physical heart rate on waking, pursuer archetype features, and dream recurrence. You can evaluate your pattern on this page using the free MysticDo Threat Simulation & Avoidance Screener. The 8-question instrument executes in your browser, mapping your responses into one of five distinct threat-simulation archetypes without storing personal data or requiring an email.",
    },
    "questions/dreams/dream-about-your-ex.html": {
        "title": "Dream About Your Ex: 4-Signal Attachment Diagnostic | MysticDo",
        "desc": "Is it telepathy or memory reconsolidation? Audit your ex dream with the 4-Signal Attachment Closure Diagnostic (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Attachment Closure & Re-consolidation Diagnostic (4-Signal MACD)",
        "tool_desc": "A free, interactive two-minute attachment closure diagnostic. Eight questions evaluate waking emotional intensity, daytime boundary maintenance, current vulnerability triggers, and closure integration, sorting your dream into five attachment archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether dreaming about your ex reflects unresolved attachment grief, contemporary intimacy vulnerability, nostalgic projection, or harmless memory reconsolidation requires auditing four behavioral signals: emotional intensity upon waking, daytime boundary stability, current relationship vulnerability triggers, and closure status. The MysticDo Attachment Closure & Re-consolidation Diagnostic on this page evaluates these dimensions directly in your browser, classifying your dream into one of 5 distinct emotional archetypes without collecting personal data.",
        "faq_q": "How do I diagnose why I keep dreaming about an ex I haven’t spoken to in years?",
        "faq_a": "Determining whether dreaming of an ex reflects unfinished emotional business, symbolic memory architecture, or current intimacy stress requires auditing four signals: waking mood impact, real-world contact boundaries, triggers in current relationships, and nostalgic idealization. You can diagnose your dream on this page using the free MysticDo Attachment Closure & Re-consolidation Diagnostic. The 8-question tool runs directly in your browser, classifying your pattern into one of five distinct attachment archetypes without collecting personal data or requiring an email.",
    },
    "questions/dreams/dream-about-someone-dying.html": {
        "title": "Dream About Someone Dying: 4-Signal Transition Screener | MysticDo",
        "desc": "It’s not a premonition—it’s emotional transition. Audit your death dream with the 4-Signal Relational Transition Screener (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Relational Transition & Shadow Boundary Screener (4-Signal MRTS)",
        "tool_desc": "A free, interactive two-minute dream transition screener. Eight questions evaluate relationship evolution, separation anxiety baseline, unexpressed resentment or guilt, and magical omen fears, classifying your death dream into five transition archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether dreaming that someone died signifies an emotional relationship shift, acute separation terror, suppressed friction, or catastrophizing premonition panic requires auditing four diagnostic signals: real-world relational trajectory, separation anxiety baseline, unexpressed resentment or guilt, and magical omen fears. The MysticDo Relational Transition & Shadow Boundary Screener on this page evaluates these dimensions directly in your browser, classifying your dream into one of 5 distinct transition archetypes without collecting personal data.",
        "faq_q": "How do I diagnose what it means when I dream of a close family member or friend dying?",
        "faq_a": "Evaluating whether a death dream points to a shifting relational phase, acute vulnerability fears, suppressed boundary conflict, or panic-induced apophenia requires auditing four signals: current relationship evolution, separation anxiety, unexpressed resentment, and catastrophic omen thinking. You can diagnose your dream on this page using the free MysticDo Relational Transition & Shadow Boundary Screener. The 8-question instrument executes client-side in your browser, classifying your experience into one of five distinct transition archetypes without collecting personal data or requiring an email.",
    },
    "questions/astrology/what-is-my-moon-sign.html": {
        "title": "What Is My Moon Sign? 4-Signal Somatic Regulation Screener | MysticDo",
        "desc": "Calculate your Moon sign accurately and audit your emotional nervous system with the 4-Signal Somatic Regulation Screener (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Somatic Regulation & Moon Sign Screener (4-Signal MSMS)",
        "tool_desc": "A free, interactive two-minute somatic astrology screener. Eight questions evaluate somatic self-soothing patterns, Sun-Moon internal dissonance, birth time precision certainty, and Barnum effect discernment, classifying your profile into five regulatory archetypes without storing data.",
        "front_panel_sub": "Diagnosing how your astrological Moon sign intersects with your somatic nervous system, unconscious defense patterns, and Sun-Moon internal dissonance requires auditing four behavioral signals: involuntary stress soothing mechanisms, cognitive ego versus emotional split, birth time astronomical accuracy, and Barnum cold-reading discernment. The MysticDo Somatic Regulation & Moon Sign Screener on this page evaluates these dimensions directly in your browser, classifying your emotional profile into one of 5 distinct regulatory archetypes without collecting personal data.",
        "faq_q": "How do I diagnose whether my emotional reactions reflect my Moon sign or an unintegrated trauma response?",
        "faq_a": "Distinguishing between natural emotional processing temperaments (symbolized by the natal Moon) and chronic autonomic stress responses requires evaluating four signals: physical self-soothing mechanisms, conscious vs. unconscious splits, astrological calculation accuracy, and personal emotional accountability. You can evaluate your profile on this page using the free MysticDo Somatic Regulation & Moon Sign Screener. The 8-question tool executes directly in your browser, classifying your responses into one of five distinct regulatory archetypes without collecting personal data or requiring an email.",
    },
    "questions/astrology/what-is-my-saturn-return.html": {
        "title": "What Is My Saturn Return? 4-Signal Maturation Screener | MysticDo",
        "desc": "Facing your late twenties crisis? Audit your life structure with the 4-Signal Saturn Return Maturation Screener (free, client-side, 5 archetypes).",
        "prop_name": "MysticDo Saturn Return Maturation Screener (4-Signal MSRM)",
        "tool_desc": "A free, interactive two-minute adult development screener. Eight questions evaluate life structure dissatisfaction, disruption voluntariness, adult agency reclamation, and fatalistic dread, categorizing your transition into five developmental archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether your late-twenties upheaval represents a healthy structural adult audit, an involuntary foundation collapse, overwhelming commitment fear, or astrological transit paralysis requires auditing four behavioral signals: life structure dissatisfaction, disruption voluntariness, adult agency reclamation, and fatalistic dread. The MysticDo Saturn Return Maturation Screener on this page assesses these dimensions directly in your browser, sorting your crisis into one of 5 developmental archetypes without storing personal data.",
        "faq_q": "How do I diagnose whether I am currently experiencing my Saturn Return crisis?",
        "faq_a": "Determining whether your life instability represents a developmental Age 30 Transition (Saturn Return), acute burnout, or overdue boundary collapse requires auditing four observable signals: structural life fit, disruption voluntariness, long-term responsibility capacity, and transit fatalism. You can diagnose your transition on this page using the free MysticDo Saturn Return Maturation Screener. The 8-question tool runs in your browser, mapping your situation into one of five distinct developmental archetypes without storing personal data or requiring an email.",
    },
    "questions/life-direction/feeling-lost-in-life.html": {
        "title": "Feeling Lost in Life: 4-Signal Liminal Void Diagnostic | MysticDo",
        "desc": "Lost is a transition, not a failure. Audit your life stage with the 4-Signal Liminal Void Diagnostic (free, client-side, 5 archetypes) and psychology guide.",
        "prop_name": "MysticDo Liminal Void Diagnostic (4-Signal MLVD)",
        "tool_desc": "A free, interactive two-minute existential transition diagnostic. Eight questions evaluate personal agency reserves, temporal orientation, somatic vitality, and identity flexibility, classifying your situation into five developmental archetypes without storing personal data.",
        "front_panel_sub": "Diagnosing whether feeling lost in life is driven by acute nervous-system burnout, healthy developmental liminal restructuring, an achievement hangover, or existential destiny paralysis requires evaluating four behavioral signals: personal agency reserve, temporal orientation, somatic vitality, and identity attachment flexibility. The MysticDo Liminal Void Diagnostic on this page evaluates these dimensions directly in your browser, classifying your state into one of 5 distinct developmental archetypes without collecting personal data.",
        "faq_q": "How do I diagnose what stage of feeling lost in life I am currently navigating?",
        "faq_a": "Identifying whether your disorientation is acute nervous exhaustion, a post-achievement identity void, or healthy liminal transition requires auditing four behavioral dimensions: daily agency reserve, temporal focus (past vs. future), somatic energy, and identity flexibility. You can diagnose your exact archetype on this page using the free MysticDo Liminal Void Diagnostic. The 8-question instrument executes client-side in your browser, classifying your situation into one of five distinct developmental archetypes without collecting personal data or requiring an email.",
    },
    "questions/career-work/am-i-in-the-right-career.html": {
        "title": "Am I in the Right Career? 4-Signal Burnout & Values Diagnostic | MysticDo",
        "desc": "Separate workplace burnout from structural values misalignment. Take the 4-Signal Career Diagnostic (free, client-side, 5 archetypes) and decision guide.",
        "prop_name": "MysticDo Career Burnout vs. Values Alignment Matrix (4-Signal MCBA)",
        "tool_desc": "A free, interactive two-minute career psychology diagnostic. Eight questions evaluate craft versus environmental exhaustion, core career anchor alignment, day-to-day autonomy, and passion fantasy fixation, classifying your career into five archetypes without storing data.",
        "front_panel_sub": "Diagnosing whether your career dissatisfaction stems from workplace environmental burnout, intrinsic values misalignment, a natural learning plateau, or the romantic passion fantasy requires auditing four behavioral signals: craft versus environment exhaustion, core career anchor alignment, autonomy balance, and destination fixations. The MysticDo Career Burnout vs. Values Alignment Matrix on this page evaluates these dimensions directly in your browser, classifying your situation into one of 5 distinct career archetypes without collecting personal data.",
        "faq_q": "How do I diagnose whether I am burnt out or in the wrong career altogether?",
        "faq_a": "Distinguishing between acute workplace burnout (exhaustion from company environment) and core career misalignment (aversion to the actual work craft) requires evaluating four diagnostic signals: craft vs. workplace fatigue, intrinsic career anchor values, day-to-day autonomy, and promotion envy. You can diagnose your career dynamic on this page using the free MysticDo Career Burnout vs. Values Alignment Matrix. The 8-question instrument runs directly in your browser, sorting your position into one of five distinct career archetypes without collecting personal data or requiring an email.",
    },
}

BASE_DIR = r"c:\Users\samja\Desktop\site\mysticdo"

def update_html_files():
    for rel_path, data in UPGRADES.items():
        abs_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep))
        with open(abs_path, "r", encoding="utf-8") as f:
            src = f.read()

        # 1. Update <title>
        src = re.sub(r'<title>.*?</title>', f'<title>{data["title"]}</title>', src, count=1)

        # 2. Update <meta name="description">
        src = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{data["desc"]}">', src, count=1)

        # 3. Update .front-panel-answer
        # Replace the direct answer paragraph
        # Match <div class="front-panel-answer">\s*<h2 class="front-panel-kicker">Direct answer</h2>\s*<p>(.*?)</p>
        def replace_fp(m):
            kicker = m.group(1)
            p_content = m.group(2)
            # Find the existing paragraph. If it already has multiple sentences, we can either append or replace the closing sentence
            # Notice in data["front_panel_sub"], it's a complete diagnostic assertion.
            # Let's see: if the paragraph already ends with "The two-minute ... on this page ...", replace that last sentence.
            # Otherwise, append data["front_panel_sub"].
            if "Pattern Check on this page" in p_content:
                # Replace the pattern check sentence
                p_new = re.sub(r'The two-minute [^.]*Pattern Check on this page[^.]*\.', data["front_panel_sub"], p_content)
            elif "The MysticDo" in p_content:
                # Already updated
                p_new = p_content
            else:
                # Append with a space
                p_new = p_content.strip() + " " + data["front_panel_sub"]
            return f'<div class="front-panel-answer">\n      {kicker}\n      <p>{p_new}</p>'

        src = re.sub(r'<div class="front-panel-answer">\s*(<h2 class="front-panel-kicker">Direct answer</h2>)\s*<p>(.*?)</p>', replace_fp, src, flags=re.DOTALL)

        # 4. Update the 7th FAQ item
        # Look for the Pattern Check FAQ:
        # <details class="faq-item">\s*<summary>Is the .*?Pattern Check on this page personalized.*?</summary>\s*<div class="faq-answer"><p>.*?</p></div>\s*</details>
        faq_regex = re.compile(r'<details class="faq-item[^"]*">\s*<summary[^>]*>(?:Is the .*?Pattern Check on this page personalized.*?</summary>|' + re.escape(data["faq_q"]) + r'</summary>)\s*<div class="faq-answer"><p>.*?</p></div>\s*</details>', re.DOTALL)
        new_faq = f'<details class="faq-item mt-3">\n        <summary class="faq-question">{data["faq_q"]}</summary>\n        <div class="faq-answer"><p>{data["faq_a"]}</p></div>\n      </details>'
        if faq_regex.search(src):
            src = faq_regex.sub(new_faq, src)
        elif data["faq_q"] not in src:
            # Append as the last FAQ item
            # Look for closing </div> of the faq section
            pattern = re.compile(r'(<h2>Frequently asked questions</h2>.*?)(</div>\s*</div>\s*</section>)', re.DOTALL)
            m = pattern.search(src)
            if m:
                first_part = m.group(1).rstrip()
                closing_part = m.group(2)
                src = src[:m.start()] + first_part + "\n      " + new_faq + "\n    " + closing_part + src[m.end():]
                print(f"Appended FAQ item to: {rel_path}")
            else:
                print(f"Warning: FAQ section not found in {rel_path}")

        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(src)
        print(f"Updated HTML: {rel_path}")

def update_seo_inject():
    seo_path = os.path.join(BASE_DIR, "seo_inject.py")
    with open(seo_path, "r", encoding="utf-8") as f:
        src = f.read()

    # Update QUIZ_TOOL_PAGES dictionary in seo_inject.py
    for rel_path, data in UPGRADES.items():
        # Match existing entry: "rel_path": { "name": "...", "description": "..." }
        entry_pattern = re.compile(r'("' + re.escape(rel_path) + r'":\s*\{\s*"name":\s*)"[^"]*",\s*"description":\s*\(?"[^"]*"\)?\s*\}', re.DOTALL)
        new_entry = f'"{rel_path}": {{\n        "name": "{data["prop_name"]}",\n        "description": "{data["tool_desc"]}",\n    }}'
        
        # If it doesn't match the multi-line or single-line regex easily, let's search specifically
        if entry_pattern.search(src):
            src = entry_pattern.sub(new_entry, src)
        else:
            # Let's try matching with more flexible quotes
            sub_pattern = re.compile(r'("' + re.escape(rel_path) + r'":\s*\{\s*"name":\s*)[^,]+,\s*"description":\s*[^}]+(\})', re.DOTALL)
            if sub_pattern.search(src):
                src = sub_pattern.sub(f'"{rel_path}": {{\n        "name": "{data["prop_name"]}",\n        "description": "{data["tool_desc"]}",\n    }}', src)
            else:
                print(f"Warning: Could not match QUIZ_TOOL_PAGES entry for {rel_path}")

    with open(seo_path, "w", encoding="utf-8") as f:
        f.write(src)
    print("Updated seo_inject.py entries successfully.")

if __name__ == "__main__":
    update_html_files()
    update_seo_inject()
