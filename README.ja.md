#  LEIA アシスタント

<div align="center">

**🌍 Язык / Language / 言語**

[![Russian](https://img.shields.io/badge/Русский-blue)](README.md)
[![English](https://img.shields.io/badge/English-green)](README.en.md)
[![Japanese](https://img.shields.io/badge/日本語-red)](README.ja.md)

---

![LEIA](frontend/images/leia.jpg)

**Japan Digital University向け 3D リビングAIアシスタント**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Three.js](https://img.shields.io/badge/Three.js-r150+-orange.svg)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[デモ](#-デモ) • [インストール](#-インストール) • [機能](#-機能) • [プレゼンテーション](presentation.ja.md) • [技術](#️-技術)

</div>

---

## 🏢 プロジェクトについて

**LEIA** (Living Educational Interactive Assistant) — **AIYM Company** の製品です。

AIDE (LEIA) は、学生、スタッフ、ゲスト、顧客がリアルタイムで回答や情報を得ることを支援する3Dホログラフィック・リビングAIアシスタントです。

> 📊 **[投資家向けプレゼンテーション →](presentation.ja.md)**

### LEIAの機能

| 機能 | 説明 |
|------|------|
| 👁️ **見る** | カメラ + 存在検知 |
| 👂 **聞く** | マイク、音声認識 |
| 🧠 **考える** | AI処理 (Gemini) |
| 🗣️ **話す** | TTS + 多言語音声 |
| 😊 **感じる** | 10種類の感情、9種類のアニメーション |
| 🌍 **多言語** | RU / UZ / EN / JP |

---

## 🎯 ターゲット市場

| セグメント | 用途 |
|------------|------|
| 🏫 大学 | 情報、時間割、ナビゲーション |
| 🏦 銀行 | 相談、待ち行列管理 |
| 🏨 ホテル | 24時間レセプション |
| 🛒 スーパーマーケット | ナビゲーション、プロモーション |
| 🏛️ 政府機関 | 書類、証明書 |
| 🏢 ビジネスセンター | レセプション、ナビゲーション |

**ステップ1:** Japan Digital University (JDU) — パイロットプロジェクト

---

## ✨ 機能

### 🎭 10種類の感情

| 感情 | トリガー | アニメーション |
|------|----------|----------------|
| 😊 `happy` | 嬉しい、素晴らしい | nod |
| 😢 `sad` | ごめんなさい | idle |
| 🤔 `thinking` | 考え中、うーん | thinking |
| 😮 `surprised` | わあ、すごい | wave |
| 🎉 `excited` | やった、最高 | happy_jump |
| 😐 `neutral` | (デフォルト) | talking |
| 👋 `greeting` | こんにちは | wave |
| 👋 `farewell` | さようなら | bow |
| 🙏 `grateful` | ありがとう | bow |
| ✅ `agreeing` | わかりました、OK | nod |

### 🏃 9種類のアニメーション

- 👋 **wave** — 手を振る
- 🙇 **bow** — お辞儀
- 😊 **nod** — うなずき
- 🤔 **thinking** — 顎に手を当てる
- 🗣️ **talking** — ジェスチャー
- 👆 **pointing** — 指差し
- 🎉 **happy_jump** — 喜びのジャンプ
- 😌 **idle** — 呼吸しながら休憩
- 👁️ **blink** — 自動まばたき

### 🖼️ 画像表示

```
👤: キャンパスを見せて
🤖: こちらが私たちの美しいキャンパスです！ [写真を表示]

👤: 101号室はどこですか？
🤖: 101号室は1階にあります [写真を表示]
```

---

## 🎬 デモ

### 対話例

```
👤: こんにちは！
🤖: こんにちは！👋 私はLEIAです。何かお手伝いしましょうか？
    [アニメーション: wave, 感情: greeting]

👤: JDUについて教えて
🤖: Japan Digital Universityは現代的な大学で...
    [アニメーション: talking, 感情: neutral]

👤: ありがとう！
🤖: お役に立てて嬉しいです！🙏
    [アニメーション: bow, 感情: grateful]

👤: さようなら！
🤖: またお会いしましょう！良い一日を！👋
    [アニメーション: bow, 感情: farewell]
```

---

## 🚀 インストール

### 要件

- Python 3.11+
- Node.js 18+ (オプション)
- Google Gemini APIキー

### バックエンド

```bash
# リポジトリをクローン
git clone https://github.com/GAMaksim/leia-assistant.git
cd leia-assistant

# 仮想環境を作成
cd backend
python -m venv venv

# アクティベート
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 依存関係をインストール
pip install -r requirements.txt

# 環境変数を設定
cp .env.example .env
# .envにGEMINI_API_KEYを追加

# サーバーを起動
uvicorn app.main:app --port 8000
```

### フロントエンド

```bash
cd frontend

# ローカルサーバーを起動
python -m http.server 3000
# または
npx serve -p 3000
```

### アクセス

```
http://localhost:3000
```

---

## 🛠️ 技術

### アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                   フロントエンド                     │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│   │ Three.js  │  │    VRM    │  │   Web     │       │
│   │  WebGL    │  │  Avatar   │  │  Speech   │       │
│   └───────────┘  └───────────┘  └───────────┘       │
└─────────────────────────┬───────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────┐
│                   バックエンド                       │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│   │  FastAPI  │  │  Gemini   │  │ Context   │       │
│   │  Python   │  │    AI     │  │   Data    │       │
│   └───────────┘  └───────────┘  └───────────┘       │
└─────────────────────────────────────────────────────┘
```

### 技術スタック

| コンポーネント | 技術 |
|----------------|------|
| 3Dグラフィックス | Three.js, WebGL |
| 3Dアバター | VRM (VRoidStudio) |
| アニメーション | GSAP |
| バックエンド | FastAPI (Python) |
| AI | Google Gemini API |
| 音声 | Web Speech API |

---

## 🔧 API

### POST `/api/chat`

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "こんにちは！", "language": "ja"}'
```

**レスポンス:**

```json
{
  "response": "こんにちは！私はLEIAです。何かお手伝いしましょうか？",
  "emotion": "greeting",
  "animation": "wave",
  "image": null
}
```

### エンドポイント

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| POST | `/api/chat` | メッセージ送信 |
| POST | `/api/speech/stt` | 音声認識 |
| POST | `/api/speech/tts` | 音声合成 |
| GET | `/health` | ヘルスチェック |

---

## 🌍 対応言語

| コード | 言語 | UI | STT | TTS | 感情 |
|--------|------|----|----|-----|------|
| 🇷🇺 ru | ロシア語 | ✅ | ✅ | ✅ | ✅ |
| 🇺🇿 uz | ウズベク語 | ✅ | ✅ | ⚠️ | ✅ |
| 🇬🇧 en | 英語 | ✅ | ✅ | ✅ | ✅ |
| 🇯🇵 ja | 日本語 | ✅ | ✅ | ✅ | ✅ |

> ⚠️ ウズベク語TTSはブラウザの機能により制限されています

---

## 📊 プレゼンテーション

投資家向け完全プレゼンテーション:

### 📄 [presentation.ja.md](presentation.ja.md)

内容:
- 🎯 問題と解決策
- 💎 顧客価値
- 💰 ビジネスモデル
- 🚀 ロードマップ
- 📊 現在の進捗
- 💵 投資
- 🎬 プレゼンテーション台本

---

## 🚀 ロードマップ

- [x] ✅ **ステップ1:** JDUプロトタイプ (MVP)
- [ ] 🔄 **ステップ2:** ビジネス向けベータ (2026年Q1)
- [ ] 📋 **ステップ3:** 商用リリース (2026年Q3)
- [ ] 📋 **ステップ4:** 国際市場 (2027年)

---

## 👥 チーム

**AIYM Company**

- 👨‍💻 リードデベロッパー — [@GAMaksim](https://github.com/GAMaksim)
- 🏫 パートナー — Japan Digital University

---

## 📄 ライセンス

MIT License — [LICENSE](LICENSE) を参照

---

<div align="center">

**⭐ 気に入ったらスターをお願いします！**

[![GitHub stars](https://img.shields.io/github/stars/GAMaksim/leia-assistant?style=social)](https://github.com/GAMaksim/leia-assistant)

---

**🏢 AIYM Company** | **🤖 LEIA** | **🎓 JDU**

*Made with ❤️ in Tashkent*

</div>