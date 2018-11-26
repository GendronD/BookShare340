module.exports = function(){
  var express = require('express');
  var router = express.Router();

  function getAuthor(res, mysql, context, complete){
    mysql.pool.query("SELECT author_id, fname, lname FROM Author", function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
      }
      context.authors = results;
      complete();
    })
  }

  router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deletebooks.js"];
    var mysql = req.app.get('mysql');
    getAuthor(res, mysql, context, complete);
    function complete(){
      callbackCount++;
      if(callbackCount >= 1){
        res.render('authorsform', context);
      }
    }
  });

    // Retrieves the Specific Genre to be Updated
    function getAuthorUpdate(res, mysql, context, id, complete){
      console.log('get author in update');
      mysql.pool.query("SELECT author_id, fname, lname FROM Author WHERE author_id = " + id, function(error, results, fields){
        if(error){
          console.log("why errors....");
          res.write(JSON.stringify(error));
        }
        context.updateAuthor = results;
        console.log("authorsUpdate Results:");
        console.log(context.updateAuthor);
        complete();
      })
    }

    // Gets genre to be updated
    router.get('/:id', function(req, res) {
      console.log("updater function for author");
      console.log("id passed: " + req.params.id);
      var callbackCount = 0;
      var context = {};
      var mysql = req.app.get('mysql');
      getAuthorUpdate(res, mysql, context, req.params.id, complete);
      function complete() {
        callbackCount++;
        if(callbackCount >= 1) {
          console.log("what is actually in context:");
          console.log(context);
          res.render('updateAuthor', context);
        }
      }
    });

  router.post('/', function(req,res){
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO Author (fname, lname) VALUES (?,?)';
    var inserts = [req.body.fname, req.body.lname];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }else{
        res.redirect('/authorsform');
      }
    });
  });

  router.delete('/:id', function(req, res){
    console.log('inside delete route');
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM Author WHERE author_id = ?";
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
    console.log('inside update route for author');
    console.log('req body: ' + req.body.fname);
    console.log('req body: ' + req.body.lname);
    console.log('req res: ' + req.body.author_id);
    var mysql = req.app.get('mysql');
    var sql = "UPDATE Author SET fname = ?, lname = ? WHERE author_id = ?";
    var inserts = [req.body.fname, req.body.lname, req.body.author_id];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
          console.log('inside update route error');
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }else{
            //res.status(202).end();
            res.redirect('/authorsform');
        }
    });
  });

  return router;
}();
