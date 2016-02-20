'use strict';
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    parser = require('body-parser');
var knex = require('knex')({ //knexの使用
  		client: 'sqlite3',
  		connection: {
    		filename: ":memory:"
  		}
	});

	app.use(parser.urlencoded({extended:false}));
    app.use(parser.json());
    app.use(express.static(__dirname + '/public'))
	
	app.get('/api/projects', function (req, res, next) {//projectのリストを持ってくる
    	knex.select('*').from('projects')//*テーブルのすべての情報
			.then(function(projects){//projectsに配列でデータが入る
				res.json(projects);
				return next();//次の処理へ
			})
			.catch(function (err){//エラーcatch
				res.status(500).json(err);//サーバーエラー
				return next();
			});
    });

	app.get('/api/projects:id', function (req, res, next) {
    	var id = req.params.id;
		res.json(id);
		return next();
    });

    app.get('/api/ping', function (req, res, next) {
    	res.json('PONG');
	return next();
    });

    app.get('/api/notfound', function (req, res, next) {
    	res.status(404).json('NotFound');
	return next();
    });

    app.post('/api/badrequest', function (req, res, next) {
    	res.status(400).json('BadRequest');
	return next();
    });

/*
    app.listen(port, function () {
		console.log('Server running with port', port);
    });
*/	
/** @ToDo
  * Initialize database
  * this is for 'in-memory' database and should be removed
  */
var sqls = require('fs')//ファイルシステム使用
  .readFileSync(__dirname + '/specifications/database.sql')//自分がいる場所のdatabase.sql
  .toString();//String変換

knex.raw(sqls)//生のsql実行
  .then(function () {//終わった時に実行、つまり読みこみ終わったら動く
    /** @ToDo
      * Run server after database initialization
      * this is for 'in-memory' database and should be removed
      */
    app.listen(port, function () {
      console.log("Server running with port", port)
    });
  });
