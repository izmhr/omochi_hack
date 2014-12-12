# memo

## 1対1チャットルームの仕組み

### バリエーション

- 受け側が固有のルームを作成して、送り側がそのルーム名を指定してデータを送り込む
	- 既存のルーム名は取得できないようにする
		- これで「受け側が」偶然かぶることは回避できる。
	- 送り側はどうする？
		- 先着1名に限定すれば、セキュアさは保たれるけど、家でおもしろくない
		- 2名以上も受け入れるようにすれば、他人の家もハックできておもしろい。
- サーバがルーム名のリストを持っていて、受け側として入った時点でひとつ割り振られる。送り側はそれを読んで指定してデータを送り込む
	- 過去に割り振られたことのある…


### 実装

