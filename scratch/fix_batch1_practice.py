# scratch/fix_batch1_practice.py
from pathlib import Path

quizzes_file = Path(r"c:\Users\samja\Desktop\site\mysticdo\assets\js\quizzes.js")
content = quizzes_file.read_text(encoding="utf-8")

# Fix why-am-i-always-broke practice block
old_broke_practice = """    practice: {
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
    },"""

new_broke_practice = """    practice: window.topicPracticeSet({ topic: 'your money patterns and financial friction', cluster: 'money-wealth' }),"""

# Fix will-i-be-rich practice block
old_rich_practice = """    practice: {
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
    },"""

new_rich_practice = """    practice: window.topicPracticeSet({ topic: 'your wealth and career trajectory', cluster: 'money-wealth' }),"""

old_rich_match = """    matchPractice: function (a) {
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
    },"""

new_rich_match = """    matchPractice: function (a) {
      if (a.help === 'astrology' || a.career_stage === 'crossroads') {
        return 'tarot_deep';
      }
      if (a.help === 'career_coach') {
        return 'tarot_decision';
      }
      if (a.help === 'financial_advisor' && a.savings_rate === 'high_save') {
        return 'closure';
      }
      if (a.wealth_driver === 'rest' || a.wealth_driver === 'safety') {
        return 'free_first';
      }
      return 'free_first';
    },"""

content = content.replace(old_broke_practice, new_broke_practice)
content = content.replace(old_rich_practice, new_rich_practice)
content = content.replace(old_rich_match, new_rich_match)

quizzes_file.write_text(content, encoding="utf-8")
print("Practice sets updated successfully!")
