# Capstone-project-A-SHIMA
## 概要
- ドライブの目的地決定のためのアプリケーション
- 時間、料金を入れてそれをもとにいける観光地を地図に可視化
- 追加機能として、行き先の観光地から行ける表示できるようにしておく

## ディレクトリ構造
```
.
├── README.md
├── backend
|   ├── data
├── frontend
```

## ビルド方法
```
#クローン
git clone 
cd DSN

#フロント
cd frontend
make install
make

# Reactプロジェクトをデプロイできる形に
npm run deploy

localhost:3000にアクセス


```

## TODO(フロント)
- [ ] ピンの大きさの設定
- [ ] 拡大率によって表示するスポットの数を変える
- [ ] グルメ観光地の絞り込み
- [ ] サイドバーの上のスペース
- [ ] サイドバーの上の部分は残すやつ
- [ ] 周辺の観光地のみスライドするようにする
- [ ] 色
- [ ] 言語選択

## TODO(バック)
- [ ] 東京駅以外の出発地点設定
- [ ] 観光地リンク
