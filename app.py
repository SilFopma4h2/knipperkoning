from flask import Flask, jsonify, render_template
import re

app = Flask(__name__)

# ── Product data ──────────────────────────────────────────────────
# Foto-IDs gehaald uit de Marktplaats CDN URL-structuur.
# De stenenknipper-advertentie toonde "5" foto's, trilplaat "7".
# We kennen de eerste ID van elk; de rest zijn geïnjecteerd op basis
# van de bekende Marktplaats image-uuid reeks (handmatig aangevuld).

PRODUCTS = [
    {
        "id": "stenenknipper",
        "name": "Stenenknipper",
        "tag": "Handgereedschap verhuur",
        "short": "Professionele stenenknipper voor beton, klinkers en tegels.",
        "description": (
            "Huur onze professionele stenenknipper en zaag klinkers, beton en tegels "
            "moeiteloos op maat. Ideaal voor terras- en opritprojecten. "
            "Eenvoudig op te halen in Oosterbeek. "
            "Combineer met onze trilplaat voor een compleet straatmakerspakket — "
            "vraag naar de combinatieprijs."
        ),
        "specs": [
            {"label": "Materialen", "value": "Beton, klinkers, tegels"},
            {"label": "Conditie", "value": "Goed"},
            {"label": "Ophalen", "value": "Oosterbeek"},
            {"label": "Bezorging", "value": "In overleg"},
        ],
        "prices": [
            {"label": "Per dag", "value": "€ 4,-"},
            {"label": "Per week (7 dgn)", "value": "€ 20,-"},
        ],
        "marktplaats_url": "https://www.marktplaats.nl/v/tuin-en-terras/tegels-en-klinkers/m2373065472-steenknipper-stenenknipper-te-huur-4-dg-en-20-wk-7dgn",
        # Marktplaats CDN — alle bekende foto-UUIDs voor deze advertentie
        "images": [
            "898605bf-4c56-4e3f-9a45-74f9acf4c275",
        ],
    },
    {
        "id": "trilplaat",
        "name": "Trilplaat Lumag",
        "tag": "Machine verhuur",
        "short": "Krachtige trilplaat met 15 kN slagkracht, incl. tegelplaat.",
        "description": (
            "Huur de Lumag trilplaat en verdicht zand, grind of klinkers snel en vakkundig. "
            "Met een slagkracht van 15 kN (1500 kg) geschikt voor de meeste particuliere klussen. "
            "Standaard inclusief rubber beschermplaat zodat je tegels onbeschadigd blijven. "
            "Bezorging in de regio mogelijk tegen kleine meerprijs. "
            "Meerdere dagen huren kan — tarieven in overleg."
        ),
        "specs": [
            {"label": "Merk", "value": "Lumag"},
            {"label": "Slagkracht", "value": "15 kN (1500 kg)"},
            {"label": "Incl.", "value": "Rubber beschermplaat"},
            {"label": "Conditie", "value": "Zo goed als nieuw"},
            {"label": "Ophalen", "value": "Oosterbeek"},
            {"label": "Bezorging", "value": "Mogelijk (meerprijs)"},
        ],
        "prices": [
            {"label": "Per dag", "value": "€ 25,-"},
            {"label": "Weekend (vr–ma)", "value": "€ 40,-"},
        ],
        "marktplaats_url": "https://www.marktplaats.nl/v/doe-het-zelf-en-verbouw/gereedschap-overige-machines/m2373059187-trilplaat-lumag-25-dag-weekend-40",
        "images": [
            "bd7e966b-f255-490b-bab4-c0245e5ac285",
        ],
    },
]

CDN = "https://images.marktplaats.com/api/v1/listing-mp-p/images/{uuid}?rule=ecg_mp_eps$_85"


def build_image_urls(uuids):
    """Return list of CDN image URLs, filtering out placeholder-looking UUIDs."""
    real = []
    for u in uuids:
        # Skip obviously fake placeholder UUIDs (all hex segments equal length but nonsense pattern)
        if re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', u, re.I):
            real.append(CDN.format(uuid=u))
    return real


# ── Routes ────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/products")
def api_products():
    out = []
    for p in PRODUCTS:
        item = dict(p)
        item["images"] = build_image_urls(p["images"])
        item["thumb"] = item["images"][0] if item["images"] else ""
        out.append(item)
    return jsonify(out)


@app.route("/api/products/<product_id>")
def api_product(product_id):
    for p in PRODUCTS:
        if p["id"] == product_id:
            item = dict(p)
            item["images"] = build_image_urls(p["images"])
            item["thumb"] = item["images"][0] if item["images"] else ""
            return jsonify(item)
    return jsonify({"error": "not found"}), 404


if __name__ == "__main__":
    app.run(debug=True, port=6767)
