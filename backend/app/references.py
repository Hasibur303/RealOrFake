from __future__ import annotations


AUTHENTIC_REFERENCES = {
    "vaseline": (
        "Vaseline Lip Therapy Original Pure Petroleum Jelly White Petrolatum "
        "Soothes dry skin and lips, locks in moisture, hypoallergenic"
    ),
    "the ordinary": (
        "The Ordinary Niacinamide 10% + Zinc 1% High-Strength Vitamin and Mineral "
        "Blemish Formula Aqua Water Pentylene Glycol Zinc PCA Tamarindus Indica Seed Gum"
    ),
    "cerave": (
        "CeraVe Moisturizing Cream with 3 Essential Ceramides and Hyaluronic Acid "
        "Developed with dermatologists, helps restore the protective skin barrier"
    ),
    "banila": (
        "Banila Co Clean It Zero Cleansing Balm Original Hypoallergenic Sherbet-like texture "
        "Transforms into smooth oil to remove makeup"
    ),
    "cosrx": (
        "COSRX Advanced Snail 96 Mucin Power Essence Snail Secretion Filtrate Betaine "
        "Butylene Glycol 1,2-Hexanediol Sodium Hyaluronate"
    ),
    "la roche-posay": (
        "La Roche-Posay Anthelios UVMune 400 Invisible Fluid SPF50+ Ultra Long-UVA Protection "
        "Shake before use, very water resistant, non-perfumed"
    ),
    "beauty of joseon": (
        "Beauty of Joseon Relief Sun Rice + Probiotics SPF50+ PA++++ "
        "Oryza Sativa Rice Bran Water Niacinamide Lactobacillus Ferment"
    ),
    "paula": (
        "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant Salicylic Acid "
        "Unclogs and shrinks enlarged pores, smooths and evens skin tone"
    ),
    "default_cosmetic": (
        "Authentic cosmetic formulation, pure ingredients, dermatologically tested, "
        "verified batch code, manufacturing and expiration date included"
    ),
}


def select_reference(ocr_text: str) -> tuple[str, str]:
    normalized = str(ocr_text).lower()
    for key, reference in AUTHENTIC_REFERENCES.items():
        if key != "default_cosmetic" and key in normalized:
            return key, reference
    return "default_cosmetic", AUTHENTIC_REFERENCES["default_cosmetic"]


def reference_label(key: str) -> str:
    if key == "default_cosmetic":
        return "Default cosmetic reference from the training notebook"
    return f"{key.title()} authentic packaging reference"
