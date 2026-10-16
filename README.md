# AQUA NAVI 非公式イベント配信

公式の期間別PDFを人が照合し、日時・場所の事実をJSONとして配信します。公式APIや公式配信ではありません。公式PDF・画像・説明文の転載は含みません。写真・観察記録をこの公開リポジトリに保存しないでください。

## 初回公開

GitHubリポジトリの Settings → Pages → Build and deployment → Source を **GitHub Actions** に設定します。Actions の「Validate and publish events」を実行し、緑の完了表示を確認してください。

- 配信ページ: https://desolateacorn45.github.io/aqua-navi-events/
- アプリ用: https://desolateacorn45.github.io/aqua-navi-events/events.json
- 編集画面: https://desolateacorn45.github.io/aqua-navi-events/editor.html

アプリ「イベント → AQUA NAVI配信を使う」で同意後に取得します。既存の独自URL設定は自動変更しません。

## 毎回の更新

1. 公式カレンダー・期間別PDF・臨時変更のお知らせを確認します。PDFのファイル名だけで対象期間を判断しません。
2. 編集画面で公開中JSONを読み込みます。予定の時刻・場所・日付・所要時間を照合し、チェックを付けて反映します。チェックなしの変更は確認待ちになります。
3. 時刻変更・中止は同一eventIdでstatusをchanged / cancelledにします。IDを作り直すと既存のお気に入りが追従できません。
4. 対象期間を設定し、検証してevents.jsonを書き出します。部分追加・部分修正はcompleteRangeをオフ、期間内をすべて入れ替える場合だけオンにします。対象期間を短くしただけでは期間外の過去キャッシュは消えませんが、別の日の予定には使われません。
5. GitHubの site/events.json を置き換えてコミットします。新たな展示IDが必要なら検証器のvenuesも公式配置と照合して追加してください。SOURCE_REVIEW.jsonにも確認方法・差異を記録します。
6. Actionsの検証・公開が成功し、公開JSONの更新を確認後、アプリで「再取得」を実行します。

公開日時だけ更新しても各予定の確認日は延長されません。確認から7日超の予定はアプリで要確認となり、通知・計画対象から外れます。対象日終了後は当日の予定に流用されません。継続運用には定期的な人の照合が必要です。自動収集・定期的な確認日更新は実装していません。

## ローカル検証

Node.js 22以降で `node validate.cjs` と `node --test test.cjs`。公開用ファイルはsite/だけです。編集画面はファイル内の処理で、GitHubトークンを要求・保存しません。ダウンロードしたJSONは自動アップロードされません。

初回データの範囲と制約はSOURCE_REVIEW.jsonを参照。開館や開催を保証するものではなく、当日の公式・館内案内を優先してください。
