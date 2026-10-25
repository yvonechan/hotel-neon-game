# Hotel NEON

[English](#english) · [日本語](#日本語)

## English

### Purpose

Hotel NEON is an anime-style cooperative mystery game for engineering teams. It brings communication, evidence-based reasoning and light cybersecurity learning into a shared investigation.

Your team arrives at a hotel for a well-earned holiday. Then PIP, the hotel's robot, disappears. Interview the staff, compare conflicting accounts and follow the digital trail to solve the case—and finally get back to the hot spring.

- **Players:** 1–7, including the Host. Solo play is supported.
- **Language:** English or Japanese, selected by the Host for the whole room.
- **Duration:** Designed for approximately 90 minutes; there is no countdown. Actual play time has not yet been measured in a blind playtest.
- **Format:** Entirely online. No printed clues or physical materials are required.

### Game content

The investigation combines RPG-style conversations, private discoveries and interactive hotel systems. Players explore equipment records, chat with the KUMA concierge, inspect photographs, search service documents and compare maintenance and audiovisual logs.

Five investigation chapters cover SQL injection, prompt injection, social engineering, digital forensics and path traversal. A final team deduction brings the evidence together. Incorrect suspects, routes, explanations or motives trigger character counter-arguments with optional follow-up questions; the team can compare records and revise its answers. Hints are available throughout, and the ending includes an illustrated holiday celebration.

The SQL exercise runs against a separate SQLite challenge database containing fictional records. The other security exercises are scripted simulations. KUMA does not use an external AI service or require an AI API key.

### Playing together

1. One player creates a room and shares the game URL and room code.
2. Other players join using their own browser sessions and nicknames.
3. Explore independently, discuss discoveries and pin useful records to the shared Evidence board. Private observations can be shared with the team.
4. Important dialogue choices wait for eligible online players to vote. The Host confirms the majority proposal or chooses an override; solo votes resolve immediately.
5. Submit deductions together and continue to the next chapter after each finding.

Room progress, shared records, pins, notes and dialogue decisions synchronize over WebSockets. Browsing and dialogue reading pace remain individual. Conversation replay does not reset the room's progress.

### Run locally

Prerequisites: **Node.js 24** and **npm**.

```sh
git clone https://github.com/yvonechan/hotel-neon-game.git
cd hotel-neon-game
npm ci
npm run dev
```

Open the URL printed by Wrangler, normally `http://localhost:8787`. The development command builds the frontend before starting the local Cloudflare Worker. After editing frontend source, restart `npm run dev` to rebuild it.

No Cloudflare login, Docker container, external database or API key is needed for local play. Wrangler runs the room storage and the separate SQL challenge locally.

To test multiple players on one computer, use a normal window and an incognito window, separate browser profiles, or different browsers. Tabs in the same browser profile share the saved player session and resume the same seat.

### Build and test

```sh
npm run build
npm test
```

- `npm run build` checks TypeScript and builds the frontend into `dist/`.
- `npm test` runs the automated suite, including local Cloudflare workerd/SQLite, full English/Japanese game journeys for 1–7 players, shared evidence, room lifecycle, votes, reconnects, concurrent WebSocket clients and SQL challenge containment.
- Test results are written to `test-report.json` and `sqlite-test-report.json`.

The automated suite does not replace browser or mobile visual testing. Before an event, check the deployed game with separate player sessions and run a small-group playthrough.

### Deploy to Cloudflare Workers

The repository includes the static-asset and Durable Object configuration in `wrangler.jsonc`.

For deployment from your computer:

```sh
npx wrangler login
npm run deploy
```

For automatic deployment from GitHub, connect this repository through **Cloudflare Dashboard → Workers & Pages → Create application → GitHub** and use:

| Setting | Value |
| --- | --- |
| Worker name | `hotel-neon` |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Build environment variable | `NODE_VERSION=24` |

A Cloudflare account is required for public deployment. The Worker name must match `wrangler.jsonc`. Wrangler creates the configured SQLite-backed Durable Object namespaces for room state and the SQL challenge through the included migrations. Use the public URL returned by Cloudflare to invite players.

### Project reference

| Path | Contents |
| --- | --- |
| `src/client/` | Game interface, dialogue, exploration and evidence displays |
| `src/server/` | Game rules, bilingual content, rooms and isolated SQL challenge |
| `src/shared/` | Shared evidence presentation types and helpers |
| `public/art/` | Character, location, evidence and ending artwork |
| `tests/` | Automated engine, multiplayer and SQL checks |
| `SQL-CHALLENGE.md` | SQL exercise behavior and containment boundaries |
| `ART-DIRECTION.md` | Artwork guidance and continuity |

## 日本語

### 目的

Hotel NEONは、エンジニアリングチーム向けのアニメ調・協力型ミステリーゲームです。仲間との情報共有、証拠に基づく推理、身近なサイバーセキュリティの学びを、一つの事件の捜査を通して楽しめます。

休暇を楽しむためにホテルへ到着したチーム。しかし、ホテルのロボット「PIP」が姿を消してしまいます。スタッフへの聞き込み、食い違う証言の照合、デジタル記録の調査を通じて事件を解決し、今度こそ温泉でくつろぎましょう。

- **人数：** Hostを含む1〜7人。ソロプレイにも対応しています。
- **言語：** 英語または日本語。Hostがルーム全体の言語を選びます。
- **所要時間：** 約90分を想定しています。時間制限はありません。初見プレイヤーによる所要時間の実測は未実施です。
- **形式：** すべてオンラインで完結します。印刷物や実物の手掛かりは不要です。

### ゲーム内容

RPG形式の会話、探索中に見つかる個別の手掛かり、操作できるホテルのシステムを組み合わせた捜査です。機材予約の調査、案内役KUMAとのチャット、写真の確認、保守文書の検索、設備・映像記録の照合などを行います。

5つの調査チャプターで、SQLインジェクション、プロンプトインジェクション、ソーシャルエンジニアリング、デジタルフォレンジック、パストラバーサルを扱います。最後に、集めた証拠をもとにチームで最終推理を提出します。人物、搬出経路、映像の説明、動機に誤りがあると、登場人物が反証を示します。追加の質問をし、資料を照合して回答を修正できます。ヒントを利用でき、エンディングには休暇の再開を祝うイラストと会話が用意されています。

SQLの問題は、架空の記録を格納した専用のSQLiteデータベースで実行します。それ以外のセキュリティ問題は、ゲーム内の模擬システムです。KUMAは外部AIサービスを利用せず、AIのAPIキーも不要です。

### 仲間と遊ぶ

1. 一人がルームを作成し、ゲームのURLとルームコードを共有します。
2. 他のプレイヤーは、それぞれのブラウザーセッションとニックネームで参加します。
3. 手分けして探索し、発見した内容を話し合い、重要な資料を共有の証拠ボードにピン留めします。個別の観察もチームへ共有できます。
4. 重要な会話の選択肢では、投票対象のオンラインプレイヤー全員が投票します。Hostが多数決の案を確定するか、別の選択肢を指定します。ソロの場合は即座に確定します。
5. チームで推理を提出し、各チャプターの調査結果を確認してから次へ進みます。

進捗、共有資料、ピン、メモ、会話の決定はWebSocketで同期します。資料を開く操作や会話を読むペースはプレイヤーごとに独立しています。会話を再生しても、ルームの進捗はリセットされません。

### ローカルで起動する

必要なもの：**Node.js 24**、**npm**。

```sh
git clone https://github.com/yvonechan/hotel-neon-game.git
cd hotel-neon-game
npm ci
npm run dev
```

Wranglerが表示するURL（通常は `http://localhost:8787`）を開きます。開発用コマンドは、フロントエンドをビルドしてからローカルのCloudflare Workerを起動します。フロントエンドのソースを変更した場合は、`npm run dev` を再起動してビルドし直してください。

ローカル起動にCloudflareへのログイン、Docker、外部データベース、APIキーは不要です。ルームの保存先とSQL問題の専用環境も、Wranglerがローカルで動かします。

一台のPCで複数人の動作を確認する場合は、通常ウィンドウとシークレットウィンドウ、別のブラウザープロファイル、または別のブラウザーを使用してください。同じプロファイルのタブは保存済みのプレイヤーセッションを共有し、同じ参加枠に戻ります。

### ビルドとテスト

```sh
npm run build
npm test
```

- `npm run build`：TypeScriptの検査とフロントエンドのビルドを行い、`dist/` に出力します。
- `npm test`：ローカルのCloudflare workerd／SQLiteを使用して自動テストを実行します。英語・日本語それぞれの1〜7人での全チャプター進行、証拠共有、ルームのライフサイクル、投票、再接続、複数WebSocketクライアントの同時操作、SQL問題の実行範囲などを検証します。
- テスト結果は `test-report.json` と `sqlite-test-report.json` に出力されます。

自動テストは、ブラウザーやモバイル端末での表示確認を代替するものではありません。イベント前には、公開環境で別々のプレイヤーセッションから操作を確認し、少人数で通しプレイを行ってください。

### Cloudflare Workersへデプロイする

静的ファイルとDurable Objectsの設定は、`wrangler.jsonc` に含まれています。

手元のPCからデプロイする場合：

```sh
npx wrangler login
npm run deploy
```

GitHubから自動デプロイする場合は、**Cloudflare Dashboard → Workers & Pages → Create application → GitHub** からこのリポジトリを接続し、次の値を設定します。

| 設定 | 値 |
| --- | --- |
| Worker名 | `hotel-neon` |
| 本番ブランチ | `main` |
| ルートディレクトリ | リポジトリのルート |
| ビルドコマンド | `npm run build` |
| デプロイコマンド | `npx wrangler deploy` |
| ビルド環境変数 | `NODE_VERSION=24` |

公開にはCloudflareアカウントが必要です。Worker名は `wrangler.jsonc` と一致させてください。ルーム状態とSQL問題に使用するSQLiteベースのDurable Object名前空間は、同梱のマイグレーションに従ってWranglerが作成します。デプロイ後は、Cloudflareが発行した公開URLを参加者に共有します。

### プロジェクト構成

| パス | 内容 |
| --- | --- |
| `src/client/` | ゲーム画面、会話、探索、証拠の表示 |
| `src/server/` | ゲームルール、英日コンテンツ、ルーム管理、独立したSQL問題環境 |
| `src/shared/` | 証拠表示の共通型とヘルパー |
| `public/art/` | キャラクター、背景、証拠、エンディングの画像 |
| `tests/` | ゲーム進行、マルチプレイ、SQLの自動テスト |
| `SQL-CHALLENGE.md` | SQL問題の動作と実行範囲 |
| `ART-DIRECTION.md` | アートの方針と一貫性 |
