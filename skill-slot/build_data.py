#!/usr/bin/env python3
"""skills.sh の人気ランキングと新着を集めて skills.js を作る（スキルスロット用）。
使い方: python3 build_data.py   → 同じフォルダに skills.js を書き出す。再実行で最新データに更新。
"""
import re, json, html, subprocess, concurrent.futures as cf, pathlib, datetime

UA = "Mozilla/5.0"
PAT = re.compile(r'\{"source":"([^"]+)","skillId":"([^"]+)","name":"([^"]+)","installs":(\d+)(?:,"installsYesterday":(\d+))?')

def get(url):
    return subprocess.run(["curl", "-sL", "-m", "20", "-A", UA, url], capture_output=True, text=True).stdout.replace('\\"', '"')

def board(view):
    seen, out = set(), []
    for m in PAT.finditer(get("https://skills.sh/" + view)):
        k = m.group(1) + "/" + m.group(2)
        if k in seen: continue
        seen.add(k)
        out.append({"id": k, "name": m.group(3), "source": m.group(1), "installs": int(m.group(4)),
                    "yesterday": int(m.group(5)) if m.group(5) else None})
    return out

def desc(s):
    t = get("https://skills.sh/" + s["id"])
    m = re.search(r'<meta name="description" content="([^"]*)"', t)
    s["desc"] = html.unescape(m.group(1)).strip() if m else ""
    return s

top = sorted(board(""), key=lambda s: -s["installs"])          # 累計インストール数ランキング
for i, s in enumerate(top): s["rank"] = i + 1
topids = {s["id"] for s in top}
new = [s for s in board("hot") if s["yesterday"] == 0 and s["id"] not in topids][:80]  # 昨日は0件＝出てきたばかり

with cf.ThreadPoolExecutor(16) as ex:
    list(ex.map(desc, top + new))

def slim(s, extra=()):
    d = {"n": s["name"], "src": s["source"], "i": s["installs"], "d": s["desc"][:160]}
    for k in extra: d[k] = s[k]
    return d

data = {
    "updated": datetime.date.today().isoformat(),
    "tiers": {
        "gold":   [slim(s, ["rank"]) for s in top[:10]],
        "silver": [slim(s, ["rank"]) for s in top[10:50]],
        "bronze": [slim(s, ["rank"]) for s in top[50:200]],
        "blue":   [slim(s, ["rank"]) for s in top[200:400]],
        "low":    [slim(s, ["rank"]) for s in top[400:]],
        "new":    [slim(s) for s in new],
    },
}
out = pathlib.Path(__file__).with_name("skills.js")
out.write_text("window.SKILLS=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("wrote", out, {k: len(v) for k, v in data["tiers"].items()}, "no-desc:", sum(1 for s in top + new if not s["desc"]))
