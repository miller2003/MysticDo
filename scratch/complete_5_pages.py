# -*- coding: utf-8 -*-
"""Complete the 5 third-generation intent pages to the §4 15-section contract.

Inserts, per page:
  (A) the at-a-glance 4-col cmp-table, right before the evidence/science H2;
  (B) removes the orphan in-section quiz-inline-cta;
  (C) inserts the missing §10 quiz-explainer, §11 spiritual bridge, §13 mid
      cta-band, §14 #which-practice (+ reading-well + red flags), §15
      before-you-book (+ when-to-wait), and the end cta-band — right before
      the FAQ section.

Idempotent: re-running on an already-completed page is a no-op (each insertion
is anchored on text that the prior insertion removes/changes).
"""
import io, os, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINK = 'style="color:var(--accent-link)"'

def read(rel):
    with io.open(os.path.join(BASE, rel.replace("/", os.sep)), encoding="utf-8") as f:
        return f.read()

def write(rel, s):
    with io.open(os.path.join(BASE, rel.replace("/", os.sep)), "w", encoding="utf-8", newline="") as f:
        f.write(s)

# ── per-page authored content ────────────────────────────────────────────────
PAGES = {}

PAGES["questions/astrology/what-is-my-moon-sign.html"] = {
 "evidence_h2": "The psychological science of emotional archetypes",
 "at_a_glance_h2": "At a glance: what your Moon-sign inquiry shows, and what it doesn&rsquo;t settle",
 "at_a_glance": [
   ("Needing solitude to recover from socializing", "High sensory-processing sensitivity; an introverted nervous system that down-regulates alone", "A Water Moon (Cancer/Scorpio/Pisces) leaning toward private emotional processing", "That your specific birth Moon is in any one zodiac sign"),
   ("Reacting emotionally before you can think", "Limbic-first response with a slower prefrontal brake; attachment-shaped affect regulation", "A Fire Moon (Aries/Leo/Sag) framing of quick expressive ignition", "That Moon-sign element dictates the fate of a relationship"),
   ("Feeling like two selves &mdash; the work you and the private you", "Persona/private-self split: social masking versus authentic interior", "A Gemini/Aquarius Moon tendency toward cognitive compartmentalization", "That incompatible Moon signs will &ldquo;ruin&rdquo; a partnership"),
   ("Using your Moon sign to explain your coping habits", "Barnum/Forer effect: the label lends narrative coherence to felt experience", "Genuine archetypal resonance with a symbol system your culture handed you", "That your Moon placement causes your behavior or caps your growth"),
   ("Stuck because you can&rsquo;t find your exact birth time", "Real astronomical ambiguity &mdash; the Moon moves ~13&deg; per day", "An invitation to read the lived behavioral truth over the technical minute", "That no reading is possible at all; a day-range read still informs"),
 ],
 "quiz_title": "What Does Your Moon Sign Inquiry Reveal?",
 "quiz_sub": "Eight questions, about two minutes. It surfaces your somatic self-soothing style, Sun-Moon internal dissonance, birth-time precision, and whether your symbolic reflection is doing diagnostic or fatalistic work.",
 "ctx_desc": "Your birth-data precision and the reason the question is on your mind.",
 "signal_desc": "Sun-Moon internal friction, somatic self-soothing style, astrological-attachment intensity, and reflective-versus-deterministic lens.",
 "patterns": "Somatic Containment &amp; Grounded Recovery, Cognitive Externalization &amp; Dialogue, The Public Persona vs Private Self Divide, The Astrological Fatalism Trap, or The Birth Time Discrepancy Impasse",
 "bridge_h2": "If you still want outside perspective",
 "bridge_p1": "The framework above is what self-reflection and attachment psychology can honestly reach. Wanting another lens &mdash; a symbolic mirror that names what you sense but can&rsquo;t articulate &mdash; is legitimate, not a failure of nerve.",
 "bridge_p2": "A natal astrology reading can map the Sun-Moon tension you live inside; a tarot pull can surface the pattern your reflective mind is avoiding at night; a psychic reading offers an outside read on a relational dynamic. Each answers a different facet &mdash; none replaces the conversation with yourself, and none certifies which sign you &ldquo;really&rdquo; are.",
 "which_lead": "The Moon-sign question maps differently depending on whether your real bottleneck is symbolic vocabulary, a Sun-Moon internal conflict, or a clinical mood pattern the chart can&rsquo;t treat.",
 "which_rows": [
   ("You want symbolic language for your emotional regulation style", "Natal astrology (Moon &amp; aspects)", "A vocabulary for why you self-soothe the way you do &mdash; never a behavior cause"),
   ("You&rsquo;re working a Sun-Moon internal conflict and want a mirror", "Tarot (relationship or decision spread)", "A structured reflection on the tension &mdash; not a verdict on your wiring"),
   ("You want an outside read on a relational dynamic", "Psychic reading", "A fresh perspective on your blind spots &mdash; never a soulmate verdict"),
   ("The real issue is persistent low mood, trauma, or chronic dysregulation", "Licensed therapist", "Evidence-based treatment &mdash; astrology is not a substitute for clinical care"),
   ("Unsure what kind of support you actually need", "Do What Fits", "Seven questions that route your situation to the right tool"),
 ],
 "reading_well": "Bring the tension, not the verdict request: <em>&ldquo;My Sun is in Leo and my Moon in Capricorn &mdash; how do I stop performing confidence while privately shutting down?&rdquo;</em> Avoid <em>&ldquo;which Moon sign is my soulmate?&rdquo;</em> &mdash; no chart settles a partnership, and any reader who promises one is selling.",
 "red_flags": "Readers who tell you your Moon sign &ldquo;curses&rdquo; your relationships &middot; Anyone selling &ldquo;Moon-sign remedies,&rdquo; gems, or paid rituals to &ldquo;balance&rdquo; a placement &middot; Astrologers who use your chart to predict specific romantic-commitment dates.",
 "when_to_wait": "If you can&rsquo;t locate your birth time, don&rsquo;t pay for a &ldquo;definitive&rdquo; natal reading until you&rsquo;ve checked the hospital record or a parent&rsquo;s written note. A chart built on a guessed minute is a guessed chart &mdash; the ambiguity is real, and worth resolving before you spend.",
 "cta_text": "Take the 2-minute pattern check &rarr;",
}

# (the other 4 pages are added by a second write to this dict below — kept in a
#  separate block so this file stays reviewable.)


PAGES["questions/astrology/what-is-my-saturn-return.html"] = {
 "evidence_h2": "The developmental psychology behind the Saturn Return",
 "at_a_glance_h2": "At a glance: what your Saturn-Return pressure shows, and what it doesn&rsquo;t settle",
 "at_a_glance": [
   ("Approaching 29 and feeling structural pressure to commit", "Normative adult-identity consolidation &mdash; the closing of open-ended possibility", "A genuine maturational threshold most cultures marked ritually", "That the transit itself forces any specific decision"),
   ("A long relationship, career, or identity suddenly fracturing", "Involuntary collapse of a foundation that no longer fit", "The transit surfacing what was already structurally unsound", "That the universe singled you out for punishment"),
   ("Dread and paralysis about a return still years away", "Anticipatory anxiety; intolerance of uncertainty before the crossing", "A real psychological response to a culturally loaded milestone", "That you are doomed to crisis on a fixed calendar date"),
   ("An urge to prune commitments, simplify, get serious", "Healthy voluntary structural pruning &mdash; closing doors in order to build", "The constructive face of a maturational passage", "That seriousness equals self-denial"),
   ("Reading your Saturn placement to predict exactly when crisis hits", "Astrological determinism; apophenia layered onto transits", "A symbolic frame that gives shape to felt pressure", "That the chart foretells a specific bad event on a specific day"),
 ],
 "quiz_title": "Where Do You Stand in Your Saturn Return?",
 "quiz_sub": "Eight questions, about two minutes. It surfaces whether you are in a voluntary life audit, experiencing involuntary upheaval, facing heavy commitment, or paralyzed by transit dread.",
 "ctx_desc": "Your age relative to the ~29.5-year thresholds and what is fracturing.",
 "signal_desc": "Structural-pruning direction, involuntary-upheaval load, commitment readiness, and transit-dread intensity.",
 "patterns": "The Voluntary Structural Pruning, The Heavy Anchor &amp; Real Commitment, Denial &amp; Involuntary Structural Collapse, The Anticipatory Transit Panic, or The Second Return: Elderhood &amp; Legacy",
 "bridge_h2": "If you still want outside perspective",
 "bridge_p1": "The maturational lens above is what developmental psychology and honest self-reflection can reach. Wanting a symbolic frame for a threshold this large is legitimate &mdash; most cultures marked these crossings ritually for good reason.",
 "bridge_p2": "A transit astrology reading can name which structure the Saturn cycle is pressing on; a tarot pull can surface what your reflective mind is bracing against; a psychic reading offers an outside read on a relational or professional threshold. Each answers a different facet &mdash; none predicts a specific catastrophe, and none substitutes for the slow work of building.",
 "which_lead": "The Saturn Return reads differently depending on whether your real bottleneck is voluntary pruning, an involuntary collapse, a heavy commitment forming, or anticipatory dread.",
 "which_rows": [
   ("You want a symbolic frame for a maturational threshold", "Transit astrology (Saturn cycle)", "Names the structure under pressure &mdash; never a dated catastrophe"),
   ("You&rsquo;re bracing against a specific fear the transit surfaced", "Tarot (Tower or Devil reflection)", "A structured mirror for the dread &mdash; not a verdict on whether it happens"),
   ("You want an outside read on a professional or relational threshold", "Psychic reading", "A fresh perspective on a transition you&rsquo;re too close to"),
   ("The real issue is depression, grief, or trauma triggered by the crossing", "Licensed therapist", "Evidence-based processing &mdash; astrology can&rsquo;t treat clinical collapse"),
   ("Unsure what kind of support you actually need", "Do What Fits", "Seven questions that route your situation to the right tool"),
 ],
 "reading_well": "Ask about the structure, not the date: <em>&ldquo;Saturn is crossing my fourth house &mdash; what foundation is being rebuilt, and what is mine to do?&rdquo;</em> Avoid <em>&ldquo;when exactly will the bad thing happen?&rdquo;</em> &mdash; a transit names a pressure, not a calendar event, and a reader who gives you a catastrophe date is selling.",
 "red_flags": "Astrologers who promise a specific crisis or windfall date &middot; Anyone selling paid &ldquo;Saturn remedies,&rdquo; gems, or rituals to &ldquo;survive&rdquo; the transit &middot; Readers who use the transit to scare you into an expensive cleansing.",
 "when_to_wait": "If you&rsquo;re in the first weeks of an actual involuntary collapse &mdash; a sudden loss, a firing, a fracture &mdash; don&rsquo;t book a reading yet. Stabilize first: sleep, eat, let the parasympathetic system recover. A reading done from raw shock reads dread into everything.",
 "cta_text": "Take the 2-minute pattern check &rarr;",
}

PAGES["questions/career-work/am-i-in-the-right-career.html"] = {
 "evidence_h2": "The occupational science of career satisfaction",
 "at_a_glance_h2": "At a glance: what your career dissatisfaction shows, and what it doesn&rsquo;t settle",
 "at_a_glance": [
   ("Exhausted by Monday morning before the week starts", "Acute workplace burnout &mdash; the container depletes you faster than it restores", "A burnout signal where the work may be right but the context is wrong", "That the career field itself is the problem"),
   ("Bored and coasting on autopilot, skills going dull", "A growth plateau &mdash; you have outgrown the container", "A genuine signal the role no longer stretches you", "That you must leave the field entirely"),
   ("The work pays but it isn&rsquo;t &lsquo;you&rsquo;", "Structural values misalignment &mdash; climbing a mountain you don&rsquo;t want to summit", "A values-level signal distinct from burnout", "That your values are objectively right and the company is wrong"),
   ("Daydreaming about a &lsquo;passion&rsquo; career with no plan", "The passion fantasy &mdash; escaping current friction via an idealized alt path", "A real longing worth honoring &mdash; and a real risk of romanticizing", "That following your passion guarantees fulfillment"),
   ("You can&rsquo;t quit because of the pay or lifestyle", "The golden-handcuffs impasse &mdash; a binding trade that isn&rsquo;t freely chosen", "A legitimate structural constraint, not a moral failing", "That you are trapped forever with no renegotiation possible"),
 ],
 "quiz_title": "Career Check: Burnout, Stagnation, or Misalignment?",
 "quiz_sub": "Eight questions, about two minutes. It surfaces whether your career dissatisfaction is organizational burnout, structural values mismatch, a growth plateau, or the passion fantasy.",
 "ctx_desc": "Your career stage and what is pulling at you most right now.",
 "signal_desc": "Burnout-versus-mismatch separation, autonomy level, values-anchor alignment, and passion-fantasy fixation.",
 "patterns": "Structural Values Misalignment (Wrong Mountain), Acute Workplace Burnout (Right Work, Bad Context), The Growth Plateau (Outgrown the Container), The Passion Fantasy Trap, or The Golden Handcuffs Impasse",
 "bridge_h2": "If you still want outside perspective",
 "bridge_p1": "The framework above is what occupational science and honest self-audit can reach. Wanting an outside read on a decision this consequential is legitimate &mdash; a career resists being solved from inside the same mind that is tired.",
 "bridge_p2": "A tarot decision spread can surface what your conscious planning keeps avoiding; a psychic reading offers a fresh angle on a workplace dynamic you can&rsquo;t see past; an astrology reading can frame the timing of a pivot. Each answers a different facet &mdash; none tells you which job to take, and none replaces the slow work of values clarification.",
 "which_lead": "The career question maps differently depending on whether your real bottleneck is burnout (context), values misalignment (mountain), a plateau (container), or a passion fantasy (escape).",
 "which_rows": [
   ("You&rsquo;re burned out but the work itself fits", "A break + a context audit (manager, workload)", "The container is the problem &mdash; not necessarily the field"),
   ("You want a structured mirror for a pivot decision", "Tarot (decision or Two of Wands spread)", "Surfaces the trade you&rsquo;re avoiding &mdash; doesn&rsquo;t pick for you"),
   ("You want an outside read on a workplace dynamic", "Psychic reading", "A fresh angle on a blind spot &mdash; never a &lsquo;should I quit&rsquo; verdict"),
   ("The real issue is anxiety, depression, or trauma impairing work", "Licensed therapist", "Evidence-based treatment &mdash; burnout and depression share symptoms and a reading can&rsquo;t distinguish them"),
   ("Unsure what kind of support you need", "Do What Fits", "Seven questions that route your situation to the right tool"),
 ],
 "reading_well": "Ask about the pattern, not the verdict: <em>&ldquo;I&rsquo;m in my mid-30s, well-paid, and bored &mdash; what am I actually avoiding by not deciding?&rdquo;</em> Avoid <em>&ldquo;should I quit my job?&rdquo;</em> &mdash; no reader has your financial, familial, or professional context, and one who answers yes is overreaching.",
 "red_flags": "Readers who tell you a specific job title to pursue &middot; Anyone who claims to predict a &ldquo;rich&rdquo; outcome from your chart or cards &middot; Practitioners who advise quitting before you have spoken to a therapist about possible depression.",
 "when_to_wait": "If you&rsquo;re three months into a genuinely toxic job or a genuine reorganization, don&rsquo;t book a reading to decide whether to leave. Stabilize your nervous system, gather the facts, talk to a mentor or therapist. A reading done from burnout reads &lsquo;leave&rsquo; into everything.",
 "cta_text": "Take the 2-minute pattern check &rarr;",
}

PAGES["questions/dreams/dream-about-someone-dying.html"] = {
 "evidence_h2": "The neuroscience and psychology of death dreams",
 "at_a_glance_h2": "At a glance: what your death dream shows, and what it doesn&rsquo;t settle",
 "at_a_glance": [
   ("Dreaming a loved one died who is alive and well", "Continuity of attachment &mdash; the mind rehearses a feared loss of a real bond", "A genuine expression of how much the person matters", "That the dream predicts their actual death"),
   ("Dreaming your own death", "Symbolic ego-death &mdash; an old identity structure ending", "A healthy metamorphic signal that a self-version is closing", "That you are in physical danger"),
   ("A recurring death dream of someone you&rsquo;re in conflict with", "Suppressed relational friction seeking resolution", "An honest signal the relationship needs direct addressing", "That the person is &lsquo;wishing you away&rsquo; or cursed"),
   ("A vivid death dream after a real recent loss", "Grief processing in REM &mdash; the brain integrating an actual ending", "A normal and necessary mourning function", "That the deceased is &lsquo;trapped&rsquo; or needs your intervention"),
   ("Panicking that the dream is a premonition", "Apophenia and threat-appraisal bias on a vivid memory", "A real anxiety worth naming &mdash; not a forecast", "That you can prevent a death by performing a ritual"),
 ],
 "quiz_title": "Why Did You Dream Someone Died?",
 "quiz_sub": "Eight questions, about two minutes. It surfaces whether your dream reflects a relational transition, acute separation anxiety, suppressed friction, or catastrophic premonition panic.",
 "ctx_desc": "Who died in the dream and what is happening in that relationship.",
 "signal_desc": "Relational-transition load, separation-anxiety intensity, suppressed-friction level, and premonition-panic versus symbolic read.",
 "patterns": "Relational Transition &amp; Role Evolution, Acute Separation &amp; Caregiver Vulnerability, Suppressed Friction &amp; Shadow Boundaries, Symbolic Ego-Death &amp; Metamorphosis, or Premonition Panic &amp; Apophenic Dread",
 "bridge_h2": "If you still want outside perspective",
 "bridge_p1": "The framework above is what grief psychology and dream science can reach. Wanting a symbolic or spiritual lens on a dream this vivid is legitimate &mdash; death imagery deserves more than a dictionary gloss.",
 "bridge_p2": "A medium reading can offer a sense of continuing bond with someone who has actually passed; a tarot pull can surface what the dream is asking you to face; a psychic reading offers an outside read on a relational dynamic the dream may be processing. Each answers a different facet &mdash; none predicts an actual death, and none replaces grief work if the loss is real.",
 "which_lead": "The death-dream question maps differently depending on whether your real bottleneck is a relational transition, suppressed conflict, an identity metamorphosis, or premonition panic.",
 "which_rows": [
   ("The person who died in the dream has actually passed", "Medium reading", "A sense of continuing bond and closure &mdash; never a &lsquo;message from beyond&rsquo; guarantee"),
   ("You want to surface what the dream is asking you to face", "Tarot (Death card or shadow spread)", "A structured mirror for the transition &mdash; not a literal omen"),
   ("You want an outside read on the relationship the dream is processing", "Psychic reading", "A fresh angle on a dynamic &mdash; never a death verdict"),
   ("The real issue is traumatic grief, panic disorder, or PTSD from a loss", "Licensed grief therapist", "Evidence-based grief and trauma processing &mdash; a reading can&rsquo;t substitute"),
   ("Unsure what you need", "Do What Fits", "Seven questions that route your situation to the right tool"),
 ],
 "reading_well": "Ask about the meaning, not the omen: <em>&ldquo;I dreamed my mother died and we&rsquo;re estranged &mdash; what is this dream asking me to face?&rdquo;</em> Avoid <em>&ldquo;is this a warning she will die?&rdquo;</em> &mdash; no dream is a forecast, and a reader who treats it as one is exploiting fear.",
 "red_flags": "Mediums who promise to relay a &ldquo;warning&rdquo; about an imminent death &middot; Readers who tell you a death dream means you&rsquo;re cursed &middot; Anyone who charges extra to &ldquo;lift&rdquo; a dream&rsquo;s omen.",
 "when_to_wait": "If you woke from the dream within the last hour and your heart is still racing, don&rsquo;t book a reading. Drink water, turn on warm light, let the arousal settle. A reading done from raw fear reads premonition into ordinary grief.",
 "cta_text": "Take the 2-minute pattern check &rarr;",
}

PAGES["questions/life-direction/feeling-lost-in-life.html"] = {
 "evidence_h2": "The psychological science of feeling lost",
 "at_a_glance_h2": "At a glance: what your disorientation shows, and what it doesn&rsquo;t settle",
 "at_a_glance": [
   ("Disoriented without a clear next step after a transition", "A healthy liminal void &mdash; the old map is gone, the new one isn&rsquo;t drawn", "A normal developmental passage, not pathology", "That being lost means you&rsquo;re broken"),
   ("Numb, foggy, can&rsquo;t summon effort", "Nervous-system depletion and freeze &mdash; burnout masquerading as &lsquo;lost&rsquo;", "A clinical signal distinct from existential drift", "That the answer is to &lsquo;find your purpose&rsquo; faster"),
   ("Empty after achieving the thing you wanted", "The achievement hangover &mdash; the goal was the structure, not the meaning", "A real reorientation signal, not ingratitude", "That success was a mistake"),
   ("You were following someone else&rsquo;s script and it stopped working", "A discarded inherited script &mdash; the values weren&rsquo;t yours", "A healthy if painful re-owning of direction", "That you must reject everyone who shaped you"),
   ("Paralyzed waiting for a &lsquo;destiny&rsquo; to reveal itself", "Magical destiny paralysis &mdash; passivity dressed as spiritual waiting", "An honest stuckness worth naming", "That a reading will name your purpose for you"),
 ],
 "quiz_title": "What Kind of Lost Are You?",
 "quiz_sub": "Eight questions, about two minutes. It surfaces whether you are in a healthy liminal void, suffering physical burnout, facing an achievement hangover, or trapped in destiny paralysis.",
 "ctx_desc": "Where you are in life and what &lsquo;lost&rsquo; feels like for you.",
 "signal_desc": "Agency reserves, temporal orientation, somatic vitality, and identity flexibility.",
 "patterns": "The Healthy Liminal Reset, The Achievement Hangover, Nervous System Depletion &amp; Freeze, The Discarded Inherited Script, or The Magical Destiny Paralysis",
 "bridge_h2": "If you still want outside perspective",
 "bridge_p1": "The framework above is what existential psychology and self-reflection can reach. Wanting a symbolic read on a passage this disorienting is legitimate &mdash; &lsquo;lost&rsquo; resists being solved by the same mind that is disoriented.",
 "bridge_p2": "An astrology reading can frame the timing of a life-direction chapter; a tarot pull can surface what your planning mind keeps circling; a psychic reading offers an outside angle on a pattern you can&rsquo;t see from inside it. Each answers a different facet &mdash; none hands you a pre-formed purpose, and none substitutes for the slow work of choosing.",
 "which_lead": "The &lsquo;lost&rsquo; question maps differently depending on whether your real bottleneck is a healthy liminal passage, nervous-system depletion, an achievement hangover, or magical destiny paralysis.",
 "which_rows": [
   ("You&rsquo;re in a genuine transition between chapters", "Reflection + intentional structure", "A liminal void is a passage, not a problem to &lsquo;fix&rsquo;"),
   ("You want a structured mirror for what&rsquo;s pulling", "Tarot (Hermit or Fool spread)", "Surfaces the direction you keep avoiding &mdash; doesn&rsquo;t hand you a purpose"),
   ("You want an outside read on a long-standing pattern", "Psychic reading", "A fresh angle on a loop &mdash; never a &lsquo;destiny&rsquo; verdict"),
   ("The real issue is depression, burnout, or trauma presenting as &lsquo;lost&rsquo;", "Licensed therapist", "Evidence-based treatment &mdash; &lsquo;lost&rsquo; is sometimes a clinical word"),
   ("Unsure what you need", "Do What Fits", "Seven questions that route your situation to the right tool"),
 ],
 "reading_well": "Ask about the pattern, not the purpose: <em>&ldquo;I&rsquo;m 34 and nothing feels like mine &mdash; what am I actually circling around?&rdquo;</em> Avoid <em>&ldquo;what is my life purpose?&rdquo;</em> &mdash; no reader can hand you a purpose, and one who does is substituting their agenda for your work.",
 "red_flags": "Readers who name a specific &lsquo;destiny&rsquo; or &lsquo;soul mission&rsquo; for you &middot; Anyone selling a program to &lsquo;unlock&rsquo; your purpose for a high fee &middot; Practitioners who tell you not to see a therapist when &lsquo;lost&rsquo; comes with numbness, anhedonia, or sleep loss.",
 "when_to_wait": "If &lsquo;lost&rsquo; has arrived with persistent low mood, sleep loss, or an inability to feel pleasure, don&rsquo;t book a reading yet. Those are depression&rsquo;s language, and a reading can&rsquo;t distinguish &lsquo;existential drift&rsquo; from a treatable condition. See a licensed professional first.",
 "cta_text": "Take the 2-minute pattern check &rarr;",
}

# ── builder ───────────────────────────────────────────────────────────────────
def at_a_glance_block(d):
    rows = "".join(
        "            <tr><td class=\"row-label\">%s</td><td>%s</td><td>%s</td><td>%s</td></tr>\n" % r
        for r in d["at_a_glance"]
    )
    return (
        "      <h2>%s</h2>\n"
        "      <div class=\"cmp-scroll mt-4\">\n"
        "        <table class=\"cmp-table\">\n"
        "          <thead><tr><th>What you&rsquo;re noticing</th><th>Grounded psychological interpretation</th><th>Alternative perspective to weigh</th><th>What it cannot prove</th></tr></thead>\n"
        "          <tbody>\n"
        "%s"
        "          </tbody>\n"
        "        </table>\n"
        "      </div>\n\n"
    ) % (d["at_a_glance_h2"], rows)

def which_rows_block(d):
    rows = "".join(
        "            <tr><td class=\"row-label\">%s</td><td>%s</td><td>%s</td></tr>\n" % r
        for r in d["which_rows"]
    )
    return rows

def new_sections_block(d):
    quiz = (
        "<section class=\"section section-parchment\">\n"
        "  <div class=\"container\">\n"
        "    <div style=\"max-width:680px;margin:0 auto;text-align:center\">\n"
        "      <span class=\"eyebrow center\">Apply the framework to your situation</span>\n"
        "      <h2 class=\"mt-3\">%s</h2>\n"
        "      <p class=\"lead mt-3\" style=\"max-width:54ch;margin-inline:auto;color:var(--text-muted)\">%s</p>\n"
        "    </div>\n"
        "    <div class=\"key-takeaways mt-5\" style=\"max-width:680px;margin-inline:auto\">\n"
        "      <h3>What this pattern check looks at</h3>\n"
        "      <ul>\n"
        "        <li><strong>Context:</strong> %s</li>\n"
        "        <li><strong>Four signals:</strong> %s</li>\n"
        "        <li><strong>Intent:</strong> what you most want to know, and where that points you next.</li>\n"
        "      </ul>\n"
        "      <p style=\"margin:var(--s3) 0 0;font-size:0.92rem;color:var(--ink-700)\">Your answers produce one of five patterns &mdash; %s. It ends with the pattern, the read it cannot make, and the next step that fits yours.</p>\n"
        "    </div>\n"
        "    <div class=\"quiz-inline-cta mt-3\">\n"
        "      <a class=\"btn btn-gold btn-lg\" href=\"#pattern-check\" data-quiz-open>Take the 2-minute pattern check &rarr;</a>\n"
        "    </div>\n"
        "  </div>\n"
        "</section>\n\n"
    ) % (d["quiz_title"], d["quiz_sub"], d["ctx_desc"], d["signal_desc"], d["patterns"])

    bridge = (
        "<section class=\"section\">\n"
        "  <div class=\"container container-narrow\">\n"
        "    <div class=\"article-body\">\n"
        "      <span class=\"eyebrow\">When reflection runs out</span>\n"
        "      <h2 class=\"mt-3\">%s</h2>\n"
        "      <p>%s</p>\n"
        "      <p>%s</p>\n"
        "    </div>\n"
        "  </div>\n"
        "</section>\n\n"
    ) % (d["bridge_h2"], d["bridge_p1"], d["bridge_p2"])

    mid_cta = (
        "<section class=\"cta-band\">\n"
        "  <div class=\"container\">\n"
        "    <div class=\"quiz-inline-cta\">\n"
        "      <a class=\"btn btn-gold btn-lg\" href=\"#pattern-check\" data-quiz-open>Run the pattern check &rarr;</a>\n"
        "    </div>\n"
        "  </div>\n"
        "</section>\n\n"
    )

    which = (
        "<section class=\"section section-parchment\" id=\"which-practice\">\n"
        "  <div class=\"container\">\n"
        "    <div class=\"article-body\">\n"
        "      <span class=\"eyebrow\">If you decide to book something</span>\n"
        "      <h2 class=\"mt-3\">Which practice fits your question?</h2>\n"
        "      <p class=\"lead mt-3\">%s</p>\n"
        "      <div class=\"cmp-scroll mt-5\">\n"
        "        <table class=\"cmp-table\">\n"
        "          <thead><tr><th>Your actual core situation</th><th>Recommended starting point</th><th>What it can honestly offer</th></tr></thead>\n"
        "          <tbody>\n"
        "%s"
        "          </tbody>\n"
        "        </table>\n"
        "      </div>\n"
        "      <div class=\"direct-answer mt-5\">\n"
        "        <h3>How to use a reading well</h3>\n"
        "        <p style=\"margin:0;color:var(--ink-700)\">%s</p>\n"
        "      </div>\n"
        "      <p class=\"mt-5\"><strong>Red flags before you book:</strong> %s</p>\n"
        "      <p class=\"mt-4\"><strong>Not sure which question you&rsquo;re actually asking?</strong> Take <a href=\"/do-what-fits\" %s>Do What Fits</a> &mdash; the seven-question matcher.</p>\n"
        "    </div>\n"
        "  </div>\n"
        "</section>\n\n"
    ) % (d["which_lead"], which_rows_block(d), d["reading_well"], d["red_flags"], LINK)

    before = (
        "<section class=\"section\">\n"
        "  <div class=\"container container-narrow\">\n"
        "    <span class=\"eyebrow\">Before you spend anything</span>\n"
        "    <h2 class=\"mt-3\">Before you book a reading</h2>\n"
        "    <p class=\"lead mt-3\">Decided a reading fits your question? Four things to check first &mdash; from an independent guide that doesn&rsquo;t sell readings.</p>\n"
        "    <div class=\"grid grid-2 mt-5\" style=\"gap:var(--s3)\">\n"
        "      <div class=\"card\" style=\"padding:var(--s4)\"><span class=\"badge badge-gold\">1</span><h3 class=\"card-title mt-3\" style=\"font-size:1.1rem\">Read this first</h3><p class=\"card-text\"><a href=\"/guides/before-paying-psychic-reading\" %s>Before Paying for a Reading</a> &mdash; the vetting framework and the red flags.</p></div>\n"
        "      <div class=\"card\" style=\"padding:var(--s4)\"><span class=\"badge badge-gold\">2</span><h3 class=\"card-title mt-3\" style=\"font-size:1.1rem\">Separate symbolic from clinical</h3><p class=\"card-text\">If it comes with numbness, sleep loss, or anhedonia, a licensed therapist is the more honest match &mdash; see <a href=\"/guides/psychic-vs-tarot\" %s>Psychic vs Tarot</a>.</p></div>\n"
        "      <div class=\"card\" style=\"padding:var(--s4)\"><span class=\"badge badge-gold\">3</span><h3 class=\"card-title mt-3\" style=\"font-size:1.1rem\">Name the real question</h3><p class=\"card-text\">Pin down what you actually want to know before you pay &mdash; the framework above helps. See <a href=\"/guides/psychic-reading-cost\" %s>reading costs</a>.</p></div>\n"
        "      <div class=\"card\" style=\"padding:var(--s4)\"><span class=\"badge badge-gold\">4</span><h3 class=\"card-title mt-3\" style=\"font-size:1.1rem\">Use the free first steps</h3><p class=\"card-text\">Run the pattern check on this page, try the <a href=\"/tools/daily-card\" %s>Daily Tarot Card</a>, and write one honest paragraph about what is pulling at you.</p></div>\n"
        "    </div>\n"
        "    <div class=\"direct-answer mt-5\">\n"
        "      <h3>When to wait instead</h3>\n"
        "      <p style=\"margin:0;color:var(--ink-700)\">%s</p>\n"
        "    </div>\n"
        "  </div>\n"
        "</section>\n\n"
    ) % (LINK, LINK, LINK, LINK, d["when_to_wait"])

    end_cta = (
        "<section class=\"cta-band\">\n"
        "  <div class=\"container\">\n"
        "    <div class=\"quiz-inline-cta\">\n"
        "      <a class=\"btn btn-gold btn-lg\" href=\"#pattern-check\" data-quiz-open>Take the 2-minute pattern check &rarr;</a>\n"
        "    </div>\n"
        "  </div>\n"
        "</section>\n\n"
    )

    return quiz + bridge + mid_cta + which + before + end_cta

ORPHAN_CTA_RE = re.compile(
    r"\n[ \t]*<div class=\"quiz-inline-cta mt-3\">\s*\n"
    r"[ \t]*<a [^>]*data-quiz-open[^>]*>[^<]*</a>\s*\n"
    r"[ \t]*</div>\s*\n",
    re.S)

def build(rel, d):
    src = read(rel)
    if "cmp-table" in src:
        print("  skip (already complete): " + rel); return False

    # (A) at-a-glance before the evidence H2
    ev = "<h2>%s</h2>" % d["evidence_h2"]
    if ev not in src:
        print("  !! evidence H2 not found in " + rel + " — aborting this page"); return False
    src = src.replace(ev, at_a_glance_block(d) + ev, 1)

    # (B) remove the orphan in-section quiz-inline-cta
    new = ORPHAN_CTA_RE.sub("\n", src)
    if new == src:
        print("  !! orphan quiz-inline-cta not found in " + rel + " — aborting"); return False
    src = new

    # (C) insert the new sections right before the FAQ section
    faq_h2 = "<h2>Frequently asked questions</h2>"
    i = src.find(faq_h2)
    if i < 0:
        print("  !! FAQ H2 not found in " + rel + " — aborting"); return False
    # walk back to the nearest <section ...> opening before the FAQ H2
    sec_open = src.rfind("<section ", 0, i)
    if sec_open < 0:
        print("  !! section opening before FAQ not found in " + rel); return False
    src = src[:sec_open] + new_sections_block(d) + src[sec_open:]

    write(rel, src)
    return True

ok = 0
for rel, d in PAGES.items():
    print("building " + rel)
    if build(rel, d):
        ok += 1
print("\ncompleted %d / %d pages" % (ok, len(PAGES)))
