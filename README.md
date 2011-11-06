# まとめてどーん！
### (MATOMETE DOOOOOOOOOOOOOOON!)

#### version 0.1

## 何をするためのアプリか
複数台のWEBサーバーをLBでバランシングしているような構成の場合、
Apacheのログなどがそれぞれのサーバー毎にロギングされます。

複数のログファイルを別々のウィンドウやペインで流すなんてのは、
アプローチとしては楽だけど、実に面倒くさい。

そこで、複数台の特定のファイルのtailを、
同時にべろべろ流してくれるような物が欲しかったので作りました。

アイディアの元は会社の人達です。
どうみてもパクリです。本当にありがとうございます。

## 動作環境

* 注意点
	* node.js関連のモジュールとか特に、バージョンが違ったら動かない可能性があるので注意してください
	* Ruby関連は全然詳しくないのですが、特に変なことはしてないので他のバージョンでも動くといいなぁ
	* 接続先はLinux（主にFedora >= 14）しか想定してないのでWindowsとかシラネ

* 用意するもの
	* Ruby >= 1.9.2
	* Capistrano
		> $ gem install capistrano
	* Node.js 0.5.7
	* Node.js モジュール類
		* express
		* forever
		* socket.io
		* ejs
			> $ npm install -g express forever socket.io ejs
			* Node.jsのモジュールは、app/node_modules の中のものをrequireしていますが念の為。
			* モジュールのバージョン等は app/node_modules を参照してください

## 使い方

* $ cd ~/ && git clone git@github.com:takyam-git/matometedo-n.git mdon
* $ cd mdon/config
* $ cp server1.rb.sample server1.rb
* server1.rb の内容をファイル内のコメントを参考に修正
* $ cd ../libs/capistrano/
* $ ssh-agent $SHELL
* $ ssh-add /path/to/.ssh/id_dsa
* 次のコマンドでCapistranoが動作するか確認
	* $ cap -f tail.rb tail config=server1
	* 問題なければTailの結果が帰ってくるはずです
	* 別にブラウザで見なくていいならこれで十分です。
	* ブラウザで確認したい人だけ次に進んでください
* $ cd ../../app
* $ forever start app.js
	* 3000番ポートが開いてる必要があります。
		* 3000番以外がよければ、app.jsの下から2行目あたりにある listen を以下のように変えてください。
		> //3333番ポートで開きたい場合
		> app.listen(3000);
		> ↓
		> app.listen(3333);
	* foreverはNode.jsのモジュールのNode-foreverです。
		* npmでインストールしたにもかかわらず、forever コマンドがないよ！
		  と言われちゃう人は、ログインしなおすと幸せになれるかも。
		  その際、もう一度 ssh-agent && ssh-add するのを忘れずに。
* ブラウザで、 http://your.server.address:3000/ にアクセス
	* ポート番号変えてたら :3000 をその数字に変更
	* your.server.address は適当に置き換えてください

## もっと使う

「使い方」で説明した「server1.rb」は「server2.rb」「server3.rb」と増やしても大丈夫です。
node.js側で勝手に読み込んで、ブラウザ側で出力します。

node.js側はcapコマンドを叩いてるだけなので、
当然この config/ 以下のファイルに問題があると動作しません。

## 何をしているのか

* Capistranoを使って各サーバーに接続後、指定されたファイルを tail -f するようにしている
* CapistranoをNode.jsのChild_processとして起動させ、STDOUTを拾っている
* 拾ったSTDOUTを、Socket.ioを使ってブラウザに流している

## 今後の拡張予定

* サーバーサイド
	* Capistranoのconfigファイルが、複数のサーバーの同一ファイルパスを
	  参照するような作りになっているので、
	  サーバー毎に読みにくファイルを変えれるようにしたい。
* クライアントサイド
	* JSが糞実装すぎるので、軽量化させる。
	* 検索機能
	* フィルタリング機能
	* 新しいのが上に出てくるか下に出てくるか選べるように
	* ALLを選択するとマージされたものが出てくるように
	* 表示件数の切り替えをシームレスに
	* 見た目を良くする
  