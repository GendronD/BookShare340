module.exports = function(){
  var express = require('express');
  var router = express.Router();

  // Retrieves Genres
  function getGenre(res, mysql, context, complete){
    console.log('get genre');
    mysql.pool.query("SELECT genre_id, genre_name FROM Genre", function(error, results, fields){
      if(error){
        console.log("why errors....");
        res.write(JSON.stringify(error));
      }
      context.genres = results;
      complete();
    })
  }

  // Retrieves the Specific Genre to be Updated
  function getGenreUpdate(res, mysql, context, id, complete){
    console.log('get genre in update');
    mysql.pool.query("SELECT genre_id, genre_name FROM Genre WHERE genre_id = " + id, function(error, results, fields){
      if(error){
        console.log("why errors....");
        res.write(JSON.stringify(error));
      }
      context.genresUpdate = results;
      console.log("genresUpdate Results:");
      console.log(context.genresUpdate);
      complete();
    })
  }

  // Gets genres for page
  router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deletebooks.js"];
    var mysql = req.app.get('mysql');
    getGenre(res, mysql, context, complete);
    function complete(){
      callbackCount++;
      if(callbackCount >= 1){
        res.render('genresform', context);
      }
    }
  });

  // Gets genre to be updated
  router.get('/:id', function(req, res) {
    console.log("updater function");
    console.log("id passed: " + req.params.id);
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    getGenreUpdate(res, mysql, context, req.params.id, complete);
    function complete() {
      callbackCount++;
      if(callbackCount >= 1) {
        console.log("what is actually in context:");
        console.log(context);
        res.render('updateGenre', context);
      }
    }
  });

  // Inserts into Genres
  router.post('/', function(req,res){
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO Genre (genre_name) VALUES (?)';
    var inserts = [req.body.genre_name];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }else{
        res.redirect('/genresform');
      }
    });
  });

  // Deletes Genre based on ID
  router.delete('/:id', function(req, res){
    console.log('inside delete route');
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM Genre WHERE genre_id = ?";
    var inserts = [req.params.id];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
          console.log('inside delete route error');
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }else{
            res.status(202).end();
        }
    });
  });

  // Updates Genre
  router.post('/update', function(req, res){
    console.log('inside update route');
    console.log('req body: ' + req.body.genre_name);
    console.log('req res: ' + req.body.genre_id);
    var mysql = req.app.get('mysql');
    var sql = "UPDATE Genre SET genre_name = ? WHERE genre_id = ?";
    var inserts = [req.body.genre_name, req.body.genre_id];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
          console.log('inside update route error');
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }else{
            res.redirect('/genresform');
        }
    });
  });

  return router;
}();
