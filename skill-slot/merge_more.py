"""skills.js に desc_more.json（検索で集めた追加スキル＋説明）を混ぜて、人気順にレア度を振り直す。
build_data.py の最後から呼ばれる。単体でも `python3 merge_more.py` で実行できる（何度実行しても同じ結果）。
レア度: 赤=1〜10位 / 黄=11〜50位 / 紫=51〜200位 / 青=201〜1000位 / 緑=1001位〜 / グレー=新着"""
import json, pathlib
here = pathlib.Path(__file__).parent
js = here / "skills.js"
data = json.loads(js.read_text()[len("window.SKILLS="):].rstrip().rstrip(";"))
T = data["tiers"]
new = T["new"]
newkeys = {s["src"] + "/" + s["n"] for s in new}
ranked = {}
for t in ("gold", "silver", "bronze", "blue", "low"):
    for s in T[t]:
        ranked[s["src"] + "/" + s["n"]] = s
for s in json.loads((here / "desc_more.json").read_text()):
    k = s["src"] + "/" + s["n"]
    if k not in ranked and k not in newkeys:
        ranked[k] = dict(s)
allr = sorted(ranked.values(), key=lambda s: -s["i"])
for r, s in enumerate(allr, 1):
    s["rank"] = r
CUT = [("gold", 0, 10), ("silver", 10, 50), ("bronze", 50, 200), ("blue", 200, 1000), ("low", 1000, None)]
data["tiers"] = {t: allr[a:b] for t, a, b in CUT}
data["tiers"]["new"] = new
js.write_text("window.SKILLS=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("merged", {k: len(v) for k, v in data["tiers"].items()}, "total", sum(len(v) for v in data["tiers"].values()))
