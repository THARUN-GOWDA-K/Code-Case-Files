import unittest

from app.sql_cases.sandbox import SandboxError, compare_results, run_query


SCHEMA = "CREATE TABLE suspects (id INTEGER, name TEXT, attended INTEGER);"
SEED = "INSERT INTO suspects VALUES (1, 'Eleanor Voss', 1), (2, 'Gregory Nunn', 0);"


class SqlSandboxTests(unittest.TestCase):
    def test_select_returns_seeded_rows(self):
        rows, truncated = run_query(
            SCHEMA,
            SEED,
            "SELECT name FROM suspects WHERE attended = 1",
        )

        self.assertEqual(rows, [{"name": "Eleanor Voss"}])
        self.assertFalse(truncated)

    def test_rejects_mutating_queries(self):
        with self.assertRaises(SandboxError):
            run_query(SCHEMA, SEED, "DELETE FROM suspects")

    def test_rejects_multiple_statements(self):
        with self.assertRaises(SandboxError):
            run_query(SCHEMA, SEED, "SELECT * FROM suspects; SELECT * FROM suspects")

    def test_compare_results_is_order_insensitive_by_default(self):
        expected = [{"id": 1, "name": "Eleanor Voss"}, {"id": 2, "name": "Gregory Nunn"}]
        actual = [expected[1], expected[0]]

        self.assertTrue(compare_results(actual, expected))
        self.assertFalse(compare_results(actual, expected, order_sensitive=True))


if __name__ == "__main__":
    unittest.main()
