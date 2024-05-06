# 必要なデータ

## ディレクトリ構造
    
```
.
├── README.md
├── sight_seeing_spot.csv
├── driving_data
│   ├── departure_spot.csv
│   ├── route.csv
|   
├── sightseeing_data
    ├── around_spot.csv

```


### 各ファイルのデータの説明
- sight_seeing_spot.csv
    - id
    - name: 観光地の名前
    - place_id: googleの場所ID
    - latitude: 緯度
    - longitude: 経度
    - user_ratings_total: レビュー数
    - ratings: レビューの星の数
    - googlemap_link: googlemapのリンク
    - image_path: 表示画像のパス

- driving_data/departure_spot.csv
    - id
    - name: 出発地の名前
    - latitude: 緯度
    - longitude: 経度

- driving_data/route.csv
    - departure_spot_id: 出発地のid
    - sight_seeing_spot_id: 観光地のid
    - departure_spot_name: 出発地の名前
    - sight_seeing_spot_name: 観光地の名前
    - distance: 距離
    - time: 所要時間
    - fee: 高速料金

- sightseeing_data/around_spot.csv
    - sight_seeing_spot_id: 観光地のid
    - around_spot_id: 周辺の観光地のid
    - total_around_review: 周囲の観光地のレビュー数
    