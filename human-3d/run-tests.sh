#!/bin/sh
# 平面の人体モデルの今までのテスト＋3Dのテストをまとめて実行
cd "$(dirname "$0")/../human-motion" || exit 1
fail=0
for f in test.cjs *.test.cjs; do node "$f" >/tmp/h3d.$$ 2>&1 || { echo "NG $f"; cat /tmp/h3d.$$; fail=1; }; grep 'OK' /tmp/h3d.$$ | tail -1; done
cd ../human-3d && { node human3d.test.cjs | tail -1; } && node twist.test.cjs || fail=1
rm -f /tmp/h3d.$$; exit $fail
