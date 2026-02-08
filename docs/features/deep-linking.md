# 📱 ディープリンク実装

## ディープリンクとは

アプリケーション内の特定の画面や機能に直接リンクするURL。
AI Drive Buddyでは、Googleマップアプリを起動し、既に経路が設定された状態でユーザーに提供します。

## 実装方法

### URL生成関数

```python
def generate_google_maps_url(origin, destination, waypoints=None):
    """
    Googleマップアプリを起動するためのディープリンクURLを生成

    Args:
        origin: 出発地
        destination: 目的地
        waypoints: 経由地のリスト（オプション）

    Returns:
        Googleマップアプリ起動用URL
    """
    base_url = "https://www.google.com/maps/dir/?api=1"

    params = {
        "origin": origin,
        "destination": destination,
        "travelmode": "driving"
    }
    if waypoints:
        params["waypoints"] = "|".join(waypoints)

    return base_url + "&" + urllib.parse.urlencode(params)
```

### 使用例

```python
url = generate_google_maps_url(
    origin="東京駅",
    destination="箱根湯本駅",
    waypoints=["小田原駅"]
)
# → https://www.google.com/maps/dir/?api=1&origin=東京駅&destination=箱根湯本駅&travelmode=driving&waypoints=小田原駅
```

## URLスキーム

### ベースURL

```text
https://www.google.com/maps/dir/?api=1
```

### パラメータ

| パラメータ | 説明 | 必須 | 例 |
| ---------- | ------ | ------ | ----- |
| `origin` | 出発地 | はい | 東京駅 |
| `destination` | 目的地 | はい | 箱根湯本駅 |
| `travelmode` | 移動手段 | いいえ | driving, walking, bicycling, transit |
| `waypoints` | 経由地 | いいえ | 小田原駅\|箱根神社（`\|`で区切る） |

### 座標指定

座標で指定することも可能です：

```python
origin="35.681236,139.767125"  # 緯度,経度
```

## UI統合

### Streamlitボタン

```python
url = generate_google_maps_url(origin, dest, waypoints)

st.link_button(
    "🚀 Googleマップアプリでナビ開始",
    url,
    type="primary",
    use_container_width=True
)
```

### ボタンのスタイル

- **アイコン**: 🚀（ロケットの絵文字）
- **タイプ**: primary（青色の目立つボタン）
- **幅**: 100%（フルワイド）
- **テキスト**: 「Googleマップアプリでナビ開始」

## 動作環境

### デスクトップブラウザ

- クリックでGoogleマップのWebバージョンが開く
- 経路が自動設定された状態で表示

### モバイルブラウザ

- クリックでGoogleマップアプリが起動
- アプリがインストールされていない場合は、Webバージョンが開く
- 経路が自動設定された状態でナビゲーション開始可能

## ユーザー体験

### 従来の方法（手動入力）

1. Googleマップアプリを開く
2. 出発地を入力
3. 目的地を入力
4. 経由地を1つずつ追加
5. ルート検索
6. ナビゲーション開始

⏱️ **所要時間**: 約2-3分

### AI Drive Buddy（ディープリンク）

1. 「🚀 Googleマップでナビ開始」をタップ
2. Googleマップアプリが自動起動
3. ナビゲーション開始

⏱️ **所要時間**: 約5秒

## 利点

### 1. シームレスなハンドオフ

- プランニング（AI Drive Buddy）→ 実行（Googleマップ）がワンタップ
- 手動での転記作業が不要

### 2. エラー防止

- 住所の入力ミスがない
- 経由地の順序を間違えない

### 3. ユーザビリティ

- 高齢者やスマホ操作が苦手な方にも優しい
- 運転直前の操作が簡単

### 4. リアルタイム連携

- AI Drive Buddyで計算した最新のルートがそのまま反映
- 交通情報を考慮した最適ルート

## 制限事項

### 経由地の数

Googleマップアプリでは、経由地は最大8箇所までサポートされています。

### URLエンコーディング

特殊文字や日本語は自動的にURLエンコードされます：

```python
urllib.parse.urlencode(params)
```

例:

```text
東京駅 → %E6%9D%B1%E4%BA%AC%E9%A7%85
```

### モバイルOSの違い

- **iOS**: Googleマップアプリが優先的に起動
- **Android**: Googleマップアプリがデフォルトで起動
- **両OS**: アプリ未インストール時はWebブラウザで開く

## トラブルシューティング

### ディープリンクが動作しない

**原因**: URLエンコーディングの問題

**解決方法**:

```python
# 正しい方法
url = base_url + "&" + urllib.parse.urlencode(params)

# 間違った方法（日本語が正しくエンコードされない）
url = f"{base_url}&origin={origin}&destination={destination}"
```

### 経由地が反映されない

**原因**: 経由地の区切り文字が誤っている

**解決方法**:

```python
# 正しい方法
params["waypoints"] = "|".join(waypoints)  # パイプ文字で区切る

# 間違った方法
params["waypoints"] = ",".join(waypoints)  # カンマは不可
```

### アプリが開かずWebブラウザで開く

**原因**: モバイルアプリがインストールされていない

**解決方法**: Googleマップアプリをインストール、またはWebバージョンを使用

## 参考資料

- [Google Maps URLs Documentation](https://developers.google.com/maps/documentation/urls/get-started)
- [Deep Linking Best Practices](https://developer.android.com/training/app-links)
