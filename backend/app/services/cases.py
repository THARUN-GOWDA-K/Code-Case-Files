from .. import models


def seed_sample_case():
    with models.session_scope() as sess:
        existing = sess.query(models.Case).filter_by(slug="vanishing-ledger").first()
        if existing:
            return existing

        case = models.Case(
            slug="vanishing-ledger",
            title="The Vanishing Ledger",
            summary="A ledger with suspicious transactions vanished from the server.",
            difficulty="beginner",
            content={"estimated_time_minutes":30},
        )
        sess.add(case)

        # Add 3 stages
        s1 = models.Stage(case_id=case.id, title="Stage 1: Ledger Parsing", order=1, prompt='A suspicious ledger was found on the server. Your first task: write a Python function that reads a list of integers and returns their sum. The ledger entries are stored as a list like [1, 2, 3, 4, 5].')
        s2 = models.Stage(case_id=case.id, title="Stage 2: Find Anomaly", order=2, prompt='The anomaly is hidden among consecutive transactions. Find the pair of numbers in the list that has the maximum absolute difference. Return the difference as an integer.')
        s3 = models.Stage(case_id=case.id, title="Stage 3: Decode Note", order=3, prompt='The decoded note contains a Caesar cipher. Write a function that takes a string and a shift integer and decodes the cipher by shifting each letter back by that amount.')
        sess.add_all([s1, s2, s3])

        # Visible test for stage1
        t1 = models.TestCase(stage_id=s1.id, input="[1,2,3]", expected_output="6", is_hidden=False)
        # Hidden test for stage1
        t2 = models.TestCase(stage_id=s1.id, input="[10,20]", expected_output="30", is_hidden=True)
        sess.add_all([t1, t2])

        # Hints
        h1 = models.Hint(stage_id=s1.id, text="Try summing the list.", unlock_after_attempts=1, order=1)
        h2 = models.Hint(stage_id=s1.id, text="Use sum(lst) in Python.", unlock_after_attempts=3, order=2)
        sess.add_all([h1, h2])

    return case
