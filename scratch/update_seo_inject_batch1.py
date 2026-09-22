# scratch/update_seo_inject_batch1.py
from pathlib import Path

seo_file = Path(r"c:\Users\samja\Desktop\site\mysticdo\seo_inject.py")
content = seo_file.read_text(encoding="utf-8")

# 1. QUIZ_TOOL_PAGES entries
tool_entries = """    "questions/loss-closure/signs-from-deceased-loved-ones.html": {
        "name": "Signs from Deceased Loved Ones Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions map how you interact with signs, whether the experience brings peace or sustains an anxious loop, and what kind of support fits your grief. Runs in your browser and never stores or sends anything.",
    },
    "questions/loss-closure/dream-about-deceased-loved-one.html": {
        "name": "Dream About a Deceased Loved One Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface whether your dream is serving emotional resolution, memory integration, or trauma replay, and matches you with a grounded next step. Runs in your browser and never stores or sends anything.",
    },
    "questions/loss-closure/is-my-loved-one-watching-over-me.html": {
        "name": "Is My Loved One Watching Over Me Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions read whether wondering if they are watching is bringing comfort or creating decision paralysis, and matches you with a grounded next step. Runs in your browser and never stores or sends anything.",
    },
    "questions/money-wealth/why-am-i-always-broke.html": {
        "name": "Why Am I Always Broke Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions read whether your financial depletion is mathematical, behavioral, or boundary-related, and ends on the next step that fits. Runs in your browser and never stores or sends anything.",
    },
    "questions/money-wealth/will-i-be-rich.html": {
        "name": "Will I Be Rich Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions read whether your desire for wealth is driven by safety deficits, status anxiety, or strategic ambition, and matches you with a grounded next step. Runs in your browser and never stores or sends anything.",
    },
}"""

old_quiz_tool_end = """    "questions/dreams/dream-about-teeth-falling-out.html": {
        "name": "Dream about teeth falling out Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
}"""

new_quiz_tool_end = """    "questions/dreams/dream-about-teeth-falling-out.html": {
        "name": "Dream about teeth falling out Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
""" + tool_entries

content = content.replace(old_quiz_tool_end, new_quiz_tool_end)

# 2. Tuple 1
tuple1_target = """            "questions/career-work/will-i-get-the-job.html",
        ):"""

tuple1_replacement = """            "questions/career-work/will-i-get-the-job.html",
            "questions/loss-closure/signs-from-deceased-loved-ones.html",
            "questions/loss-closure/dream-about-deceased-loved-one.html",
            "questions/loss-closure/is-my-loved-one-watching-over-me.html",
            "questions/money-wealth/why-am-i-always-broke.html",
            "questions/money-wealth/will-i-be-rich.html",
        ):"""

content = content.replace(tuple1_target, tuple1_replacement)

# 3. Tuple 2 (is_guide_article)
tuple2_target = """        "guides/what-are-chakras.html",
        "guides/what-are-synchronicities.html","""

tuple2_replacement = """        "guides/what-are-chakras.html",
        "guides/what-are-synchronicities.html",
        "questions/loss-closure/signs-from-deceased-loved-ones.html",
        "questions/loss-closure/dream-about-deceased-loved-one.html",
        "questions/loss-closure/is-my-loved-one-watching-over-me.html",
        "questions/money-wealth/why-am-i-always-broke.html",
        "questions/money-wealth/will-i-be-rich.html","""

content = content.replace(tuple2_target, tuple2_replacement)

seo_file.write_text(content, encoding="utf-8")
print("seo_inject.py updated successfully!")
