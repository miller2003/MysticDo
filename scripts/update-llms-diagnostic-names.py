import os
import re

UPGRADE_ENTRIES = {
    "signs-from-deceased-loved-ones": "- [Signs From Deceased Loved Ones — 4-Signal Bereavement Diagnostic](https://mysticdo.com/questions/loss-closure/signs-from-deceased-loved-ones): MysticDo Bereavement Signal Diagnostic (4-Signal MBSD). Eight client-side questions audit encounter frequency, emotional valence, somatic regulation, and compulsive scanning into five coping archetypes. Free, no data stored.",
    "dream-about-deceased-loved-one": "- [Dream About Deceased Loved One — 4-Signal Dream Diagnostic](https://mysticdo.com/questions/loss-closure/dream-about-deceased-loved-one): MysticDo Bereavement Dream Diagnostic (4-Signal MBDD). Audits narrative coherence, emotional wake-state, daytime replay, and relational friction into five sleep processing archetypes.",
    "is-my-loved-one-watching-over-me": "- [Is My Loved One Watching Over Me — 4-Signal Alignment Screener](https://mysticdo.com/questions/loss-closure/is-my-loved-one-watching-over-me): MysticDo Continuing Bonds Alignment Screener (4-Signal MCBA). Audits personal agency retention, emotional relief, surveillance urges, and life movement into five continuing-bonds archetypes.",
    "why-am-i-always-broke": "- [Why Am I Always Broke — 4-Signal Scarcity Diagnostic](https://mysticdo.com/questions/money-wealth/why-am-i-always-broke): MysticDo Scarcity Bandwidth Diagnostic (4-Signal MSBD). Audits cash flow margin, cognitive stress overhead, emotional spend triggers, and relational boundaries into five financial archetypes.",
    "will-i-be-rich": "- [Will I Be Rich — 4-Signal Financial Reality Diagnostic](https://mysticdo.com/questions/money-wealth/will-i-be-rich): MysticDo Wealth Expectation & Reality Screener (4-Signal MWER). Evaluates compounding discipline, asymmetric risk management, status drivers, and fortune-telling reliance into five reality archetypes.",
    "444-meaning": "- [444 Meaning — 4-Signal Autonomic Grounding Screener](https://mysticdo.com/questions/angel-numbers/444-meaning): MysticDo Autonomic Grounding Screener (4-Signal MAGS-444). Audits physiological stress arousal, perceived safety deficits, visual scanning frequency, and grounding utility into five nervous-system archetypes.",
    "333-meaning": "- [333 Meaning — 4-Signal Decision Crossroads Screener](https://mysticdo.com/questions/angel-numbers/333-meaning): MysticDo Decision Crossroads Screener (4-Signal MDCS-333). Audits decision friction, cognitive dissonance, creative hesitation, and commitment follow-through into five choice archetypes.",
    "777-meaning": "- [777 Meaning — 4-Signal Introspection Diagnostic](https://mysticdo.com/questions/angel-numbers/777-meaning): MysticDo Introspection vs. Jackpot Diagnostic (4-Signal MIJD-777). Evaluates contemplative depth, jackpot fallacy wishfulness, intellectual fatigue, and reality testing into five cognitive archetypes.",
    "555-meaning": "- [555 Meaning — 4-Signal Life Transition Screener](https://mysticdo.com/questions/angel-numbers/555-meaning): MysticDo Life Transition Readiness Screener (4-Signal MLTR-555). Evaluates transition vector control, anticipatory stress spikes, somatic flexibility, and agency into five transition archetypes.",
    "888-meaning": "- [888 Meaning — 4-Signal Reciprocity Audit Diagnostic](https://mysticdo.com/questions/angel-numbers/888-meaning): MysticDo Reciprocity & Abundance Diagnostic (4-Signal MRAA-888). Audits effort-reward equity, transactional resentment, resource stewardship, and magical rescue beliefs into five equity archetypes.",
    "tower-card-meaning": "- [The Tower Tarot Card Meaning — 4-Signal Crisis Diagnostic](https://mysticdo.com/questions/tarot/tower-card-meaning): MysticDo Structural Crisis Archetype Diagnostic (4-Signal MSCD). Audits foundation stability, anticipatory dread, denial postures, and rebuilding capacity into five structural crisis archetypes.",
    "lovers-card-meaning": "- [The Lovers Tarot Card Meaning — 4-Signal Values Alignment Screener](https://mysticdo.com/questions/tarot/lovers-card-meaning): MysticDo Relational Values Alignment Screener (4-Signal MRVA). Evaluates core value congruence, moral crossroad tension, romantic projection, and personal autonomy into five alignment archetypes.",
    "tarot-yes-or-no": "- [Tarot Yes or No — 4-Signal Decision Conflict Diagnostic](https://mysticdo.com/questions/tarot/tarot-yes-or-no): MysticDo Binary Decision Conflict Diagnostic (4-Signal MBDC). Audits outcome fixation urgency, decision avoidance, binary distortion, and responsibility reclamation into five decision archetypes.",
    "dream-about-being-chased": "- [Dream About Being Chased — 4-Signal Avoidance Screener](https://mysticdo.com/questions/dreams/dream-about-being-chased): MysticDo Threat Simulation & Avoidance Screener (4-Signal MTSA). Audits waking avoidance salience, post-awakening physiological arousal, pursuer projection, and confrontation capacity into five stress archetypes.",
    "dream-about-your-ex": "- [Dream About Your Ex — 4-Signal Attachment Diagnostic](https://mysticdo.com/questions/dreams/dream-about-your-ex): MysticDo Attachment Closure & Re-consolidation Diagnostic (4-Signal MACD). Evaluates waking emotional intensity, daytime boundary maintenance, vulnerability triggers, and closure into five attachment archetypes.",
    "dream-about-someone-dying": "- [Dream About Someone Dying — 4-Signal Transition Screener](https://mysticdo.com/questions/dreams/dream-about-someone-dying): MysticDo Relational Transition & Shadow Boundary Screener (4-Signal MRTS). Audits relationship evolution, separation anxiety, unexpressed friction/guilt, and magical omen fears into five transition archetypes.",
    "what-is-my-moon-sign": "- [What Is My Moon Sign — 4-Signal Somatic Regulation Screener](https://mysticdo.com/questions/astrology/what-is-my-moon-sign): MysticDo Somatic Regulation & Moon Sign Screener (4-Signal MSMS). Evaluates somatic self-soothing patterns, Sun-Moon internal dissonance, birth time precision certainty, and Barnum discernment into five regulatory archetypes.",
    "what-is-my-saturn-return": "- [What Is My Saturn Return — 4-Signal Maturation Screener](https://mysticdo.com/questions/astrology/what-is-my-saturn-return): MysticDo Saturn Return Maturation Screener (4-Signal MSRM). Audits life structure dissatisfaction, disruption voluntariness, adult agency reclamation, and fatalistic dread into five developmental archetypes.",
    "feeling-lost-in-life": "- [Feeling Lost in Life — 4-Signal Liminal Void Diagnostic](https://mysticdo.com/questions/life-direction/feeling-lost-in-life): MysticDo Liminal Void Diagnostic (4-Signal MLVD). Evaluates personal agency reserves, temporal orientation, somatic vitality, and identity flexibility into five developmental archetypes.",
    "am-i-in-the-right-career": "- [Am I in the Right Career — 4-Signal Burnout & Values Diagnostic](https://mysticdo.com/questions/career-work/am-i-in-the-right-career): MysticDo Career Burnout vs. Values Alignment Matrix (4-Signal MCBA). Audits craft versus environmental exhaustion, core career anchor alignment, day-to-day autonomy, and passion fantasy fixation into five career archetypes.",
}

BASE_DIR = r"c:\Users\samja\Desktop\site\mysticdo"

for fn in ["llms.txt", "llms-full.txt"]:
    p = os.path.join(BASE_DIR, fn)
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()

    for slug, line in UPGRADE_ENTRIES.items():
        # Look for existing line containing the slug in questions/
        # e.g., - [.*](https://mysticdo.com/questions/.*/slug):.*
        pattern = re.compile(r'- \[.*?\]\(https://mysticdo\.com/questions/[^)]*/' + re.escape(slug) + r'\):.*')
        if pattern.search(content):
            content = pattern.sub(line, content)
        else:
            print(f"Warning: Could not match line for {slug} in {fn}")

    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {fn} successfully.")
