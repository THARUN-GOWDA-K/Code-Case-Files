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
        s1 = models.Stage(
            case_id=case.id,
            title="Stage 1: Ledger Parsing",
            order=1,
            prompt='Read a JSON list of integers from stdin and print their sum. The ledger entries may look like [1, 2, 3, 4, 5].',
            description="Parse one JSON integer list and print its total.",
            starter_code="import json\nimport sys\n\nvalues = json.load(sys.stdin)\nprint(sum(values))\n",
        )
        s2 = models.Stage(
            case_id=case.id,
            title="Stage 2: Find Anomaly",
            order=2,
            prompt='Read a JSON list of integers. Compare consecutive entries and print the maximum absolute difference between adjacent values.',
            description="Scan neighboring ledger entries once and report the largest absolute jump.",
            starter_code="import json\nimport sys\n\nvalues = json.load(sys.stdin)\nprint(max(abs(right - left) for left, right in zip(values, values[1:])))\n",
        )
        s3 = models.Stage(
            case_id=case.id,
            title="Stage 3: Decode Note",
            order=3,
            prompt='Read a JSON object with message and shift fields. Decode the Caesar cipher by shifting each letter backward and print the result.',
            description="Decode a Caesar-shifted message while preserving case and non-letter characters.",
            starter_code="import json\nimport sys\n\ndata = json.load(sys.stdin)\nmessage = data['message']\nshift = data['shift'] % 26\nresult = []\nfor character in message:\n    if character.islower():\n        result.append(chr((ord(character) - ord('a') - shift) % 26 + ord('a')))\n    elif character.isupper():\n        result.append(chr((ord(character) - ord('A') - shift) % 26 + ord('A')))\n    else:\n        result.append(character)\nprint(''.join(result))\n",
        )
        sess.add_all([s1, s2, s3])
        sess.flush()

        # Visible test for stage1
        t1 = models.TestCase(stage_id=s1.id, input="[1,2,3]", expected_output="6", is_hidden=False)
        # Hidden test for stage1
        t2 = models.TestCase(stage_id=s1.id, input="[10,20]", expected_output="30", is_hidden=True)
        t3 = models.TestCase(stage_id=s2.id, input="[1,5,2]", expected_output="4", is_hidden=False)
        t4 = models.TestCase(stage_id=s2.id, input="[10,1,7]", expected_output="9", is_hidden=True)
        t5 = models.TestCase(stage_id=s3.id, input='{"message":"Khoor","shift":3}', expected_output="Hello", is_hidden=False)
        t6 = models.TestCase(stage_id=s3.id, input='{"message":"abc XYZ!","shift":2}', expected_output="yza VWX!", is_hidden=True)
        sess.add_all([t1, t2, t3, t4, t5, t6])

        # Hints
        hints = [
            ("Look for the operation that combines every ledger entry into one total.", 0),
            ("Python's built-in sum function can consume the input list directly.", 2),
            ("Return sum(values); do not alter the list or print the total.", 5),
        ]
        sess.add_all([
            models.Hint(stage_id=s1.id, text=text, cost_points=cost, order=order)
            for order, (text, cost) in enumerate(hints, start=1)
        ])
        sample_hints = {
            s2.id: [
                ("Compare neighboring transaction values rather than every possible pair.", 0),
                ("Track the largest absolute difference while scanning consecutive values.", 2),
                ("For each adjacent pair, use abs(next_value - current_value), then return the greatest difference.", 5),
            ],
            s3.id: [
                ("A Caesar cipher moves letters by a fixed amount around the alphabet.", 0),
                ("Decode by rotating alphabetic characters backward while preserving case and punctuation.", 2),
                ("Wrap the shifted character positions at the alphabet boundary and return the decoded string.", 5),
            ],
        }
        for stage_id, stage_hints in sample_hints.items():
            sess.add_all([
                models.Hint(stage_id=stage_id, text=text, cost_points=cost, order=order)
                for order, (text, cost) in enumerate(stage_hints, start=1)
            ])

    return case
