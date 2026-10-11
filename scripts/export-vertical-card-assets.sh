#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
source_root=${1:-"$project_root/../vertical_credit_card"}
flutter_bin=${FLUTTER_BIN:-flutter}
export_root=$(mktemp -d)
trap 'rm -rf "$export_root"' EXIT
mkdir -p "$export_root/test"
cp -R "$source_root/lib" "$export_root/lib"
cp "$source_root/pubspec.yaml" "$export_root/pubspec.yaml"
cp "$project_root/scripts/vertical-card-export.dart" "$export_root/test/export_test.dart"
export VERTICAL_CARD_OUTPUT="$project_root/miniprogram/modules/vertical-credit-card/assets"
(cd "$export_root" && "$flutter_bin" test test/export_test.dart)
python3 "$project_root/scripts/vertical-card-assets.py" "$source_root"
