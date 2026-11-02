import unittest

from app.references import reference_label, select_reference


class ReferenceSelectionTests(unittest.TestCase):
    def test_selects_named_reference_case_insensitively(self):
        key, text = select_reference("CeraVe MOISTURIZING CREAM")
        self.assertEqual(key, "cerave")
        self.assertIn("Essential Ceramides", text)

    def test_falls_back_to_notebook_default(self):
        key, text = select_reference("Unknown brand and packaging text")
        self.assertEqual(key, "default_cosmetic")
        self.assertIn("verified batch code", text)
        self.assertIn("training notebook", reference_label(key).lower())


if __name__ == "__main__":
    unittest.main()
