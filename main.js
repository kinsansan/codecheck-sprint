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
	
	//projectのリストを返す
	app.get('/api/projects', function (req, res, next) {
    	knex.select('*').from('projects')
			.then(function(projects){
				res.status(200).json(projects);//
				return next();//次の処理へ
			})
			.catch(function (err){
				res.status(500).json(err);//500サーバーエラーを返す
				return next();
			});
    });

	//指定したidのデータを削除
	app.delete('/api/projects/:id', function (req, res, next) {
    	var id = req.params.id;
		knex.select('*').from('projects').where('id',id).del()//指定したidのデータを削除
			.then(function(projects){//projectsに配列でデータが入る
				if(projects===0){//値が存在しない
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

	//指定したidのデータを取得
	app.get('/api/projects/:id', function (req, res, next) {
    	var id = req.params.id;
		knex.select('*').from('projects').where('id',id)
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

	//データの追加
    app.post('/api/projects', function (req, res, next) {
		var title = req.body.title,//postの場合はbodyに入る
		description = req.body.description,
		url = req.body.url;
		if(title===undefined||title===""||description===undefined||description===""){//titleかdescriptionが書かれていない場合400
			res.status(400).json('badRequest');
			return next();
		}
		knex('projects').insert({//projectsに対して挿入
			title:title,
			description:description,
			url:url
		}).then(function (ids){
			res.status(200).json({
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
/** 
  * Initialize database
  * this is for 'in-memory' database and should be removed
  */
var sqls = require('fs')//ファイルシステム使用
  .readFileSync(__dirname + '/specifications/database.sql')//database.sqlをread
  .toString();//String変換

knex.raw(sqls)//生のsql実行
  .then(function () {
    /** 
      * Run server after database initialization
      * this is for 'in-memory' database and should be removed
      */
    app.listen(port, function () {
      console.log("Server running with port", port)
    });
  });
