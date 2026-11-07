#!/bin/sh
# 平面の人体モデルの今までのテスト＋3Dのテストをまとめて実行。1本でも失敗したら終了コード1（R9：パイプで失敗を見落とさないよう、結果は一度ファイルに書く）
cd "$(dirname "$0")/../human-motion" || exit 1
fail=0; tmp="${TMPDIR:-/tmp}/h3d.$$"
run(){ node "$1" >"$tmp" 2>&1 || { echo "NG $1"; cat "$tmp"; fail=1; }; grep 'OK' "$tmp" | tail -1; }
for f in test.cjs *.test.cjs; do run "$f"; done
cd ../human-3d || exit 1
for f in human3d.test.cjs twist.test.cjs wrist.test.cjs twohand.test.cjs; do run "$f"; done
node chain.test.cjs >"$tmp" 2>&1 || { echo "NG chain.test.cjs"; fail=1; }; cat "$tmp"
rm -f "$tmp"; [ $fail = 0 ] && echo "ALL OK" || echo "FAILED"; exit $fail
