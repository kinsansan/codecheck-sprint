'use strict';
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    parser = require('body-parser'),
	knex = require('knex')({ //knexの使用
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

	//実装中
	app.delete('/api/projects/:id', function (req, res, next) {
    	var id = req.params.id;
		console.log(id);
		knex.select('*').from('projects').where('id',id)//*テーブルのすべての情報
			.then(function(projects){//projectsに配列でデータが入る
				if(projects.length==0){//値が存在しない
					res.status(404).json('NotFound');
					return next();
				}
				else{
					res.status(200).json('OK');
					return next();//次の処理へ
				}
			})
			.catch(function (err){//エラーcatch
				res.status(500).json(err);//サーバーエラー
				return next();
			});
    });

	app.get('/api/projects/:id', function (req, res, next) {
    	var id = req.params.id;
		knex.select('*').from('projects').where('id',id)//*テーブルのすべての情報
			.then(function(projects){//projectsに配列でデータが入る
				if(projects.length==0){//値が存在しない
					res.status(404).json('NotFound');
					return next();
				}
				else{
					res.json(projects);
					return next();//次の処理へ
				}
			})
			.catch(function (err){//エラーcatch
				res.status(500).json(err);//サーバーエラー
				return next();
			});
    });

    app.get('/api/ping', function (req, res, next) {
    	res.json('PONG');
		return next();
    });

    app.get('/api/notfound', function (req, res, next) {
    	res.status(404).json('NotFound');
		return next();
    });

    app.post('/api/projects', function (req, res, next) {
		var title = req.body.title,//postの場合はbodyに入る
		description = req.body.description,
		url = req.body.url;
		if(title===undefined||title===""||description===undefined||description===""){//titleかdescriptionが書かれていない場合400
			res.status(400).json('badRequest');
			return next();
		}
		knex('projects').insert({//projectsに対して
			title:title,
			description:description,
			url:url
		}).then(function (ids){
			res.json({
				id: ids[0],
				title: title,
				description: description,
				url: url
			})
			return next();
			}).catch(function (err){
				res.status(500).json(err);
				return next();
			});
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
