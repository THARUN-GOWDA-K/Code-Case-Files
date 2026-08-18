from .. import models


def seed_sample_case():
    sess = models.get_session()
    # Check existing
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
    sess.commit()

    # Add 3 stages
    s1 = models.Stage(case_id=case.id, title="Stage 1: Ledger Parsing", order=1)
    s2 = models.Stage(case_id=case.id, title="Stage 2: Find Anomaly", order=2)
    s3 = models.Stage(case_id=case.id, title="Stage 3: Decode Note", order=3)
    sess.add_all([s1, s2, s3])
    sess.commit()

    # Visible test for stage1
    t1 = models.TestCase(stage_id=s1.id, input="[1,2,3]", expected_output="6", is_hidden=False)
    # Hidden test for stage1
    t2 = models.TestCase(stage_id=s1.id, input="[10,20]", expected_output="30", is_hidden=True)
    sess.add_all([t1, t2])
    sess.commit()

    # Hints
    h1 = models.Hint(stage_id=s1.id, text="Try summing the list.", unlock_after_attempts=1, order=1)
    h2 = models.Hint(stage_id=s1.id, text="Use sum(lst) in Python.", unlock_after_attempts=3, order=2)
    sess.add_all([h1, h2])
    sess.commit()

    return case
