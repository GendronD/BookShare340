module.exports = function(){
  var express = require('express');
  var router = express.Router();

  function getGenre(res, mysql, context, complete){
    console.log('getting genres');
    mysql.pool.query("SELECT genre_id as id, genre_name FROM Genre", function(error, results, fields){
      if(error){
        console.log('error genres');
        res.write(JSON.stringify(error));
      }
      context.genres = results;
      console.log(context.genres);
      complete();
    });
  }

  function getAuthor(res, mysql, context, complete){
    console.log('getting authors');
    mysql.pool.query("SELECT author_id, fname, lname FROM Author", function(error, results, fields){
      if(error){
        console.log('error authors');
        res.write(JSON.stringify(error));
      }
      context.authors = results;
      complete();
    });
  }

  function getBook(res, mysql, context, complete){
    console.log('getting books');
    mysql.pool.query("SELECT b.book_id, b.title, CONCAT(a.fname, ' ', a.lname) AS name, g.genre_name AS genre_name FROM Books b INNER JOIN Book_Author ba ON ba.book_id = b.book_id AND b.author = ba.author_id INNER JOIN Author a ON a.author_id = ba.author_id INNER JOIN Genre g ON b.genre = g.genre_id", function(error, results, fields){
      if(error){
        console.log('error books');
        res.write(JSON.stringify(error));
        res.end();
      }
      context.books = results;
      console.log(context.books);
      complete();
    });
  }

    // Retrieves the Specific Book to be Updated
    function getBookUpdate(res, mysql, context, id, complete){
      console.log('get genre in update');
      mysql.pool.query("SELECT book_id, title, author, genre FROM Books WHERE book_id = " + id, function(error, results, fields){
        if(error){
          console.log("why errors....");
          res.write(JSON.stringify(error));
        }
        context.bookUpdate = results;
        console.log("bookUpdate Results:");
        console.log(context.bookUpdate);
        complete();
      })
    }

  function getBookAuthor(res, mysql, context, complete){
    console.log('getting books author');
    mysql.pool.query("SELECT book_id, author_id FROM Book_Author", function(error, results, fields){
      if(error){
        console.log('error books');
        res.write(JSON.stringify(error));
        res.end();
      }
      context.book_author = results;
      complete();
    });
  }

  router.get('/', function(req, res){
    console.log('function is called with get functions');
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deletebooks.js"];
    var mysql = req.app.get('mysql');
    getBook(res, mysql, context, complete);
    getAuthor(res, mysql, context, complete);
    getGenre(res, mysql, context, complete);
    getBookAuthor(res, mysql, context, complete);
    function complete(){
      callbackCount++;
      if(callbackCount >= 4){
        res.render('booksform', context);
      }
    }
  });

    // Gets book to be updated
    router.get('/:id', function(req, res) {
      console.log("updater function");
      console.log("id passed: " + req.params.id);
      var callbackCount = 0;
      var context = {};
      var mysql = req.app.get('mysql');
      getBookUpdate(res, mysql, context, req.params.id, complete);
      getBook(res, mysql, context, complete);
      getAuthor(res, mysql, context, complete);
      getGenre(res, mysql, context, complete);
      getBookAuthor(res, mysql, context, complete);
      function complete() {
        callbackCount++;
        if(callbackCount >= 5) {
          console.log("what is actually in context:");
          console.log(context);
          res.render('updateBook', context);
        }
      }
    });
  
  router.post('/', function(req,res){
    console.log('before req body');
    console.log(req.body);
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO Books (title, author, genre) VALUES (?,?,?);';
    var sql2 = 'INSERT INTO Book_Author (book_id, author_id) VALUES (?,?);';
    var inserts = [req.body.title, req.body.author, req.body.genre];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }else{
        var inserts2 = [results.insertId, req.body.author];
        sql2 = mysql.pool.query(sql2, inserts2, function(error, results, fields) {
          if(error) {
            console.log('errors in second query')
            res.write(JSON.stringify(error));
            res.end();
          }
        });
        res.redirect('/booksform');
      }
    });
  }); 

      router.delete('/:id', function(req, res){
        console.log('inside delete route');
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Books WHERE book_id = ?";
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

        // Updates Book
  router.post('/update', function(req, res){
    console.log('inside update route');
    console.log('req body: ' + req.body.title);
    console.log('req author: ' + req.body.author);
    console.log('req genre: ' + req.body.genre);
    console.log('req id: ' + req.body.book_id);
    var mysql = req.app.get('mysql');
    var sql = "UPDATE Books SET title = ?, author = ?, genre = ? WHERE book_id = ?";
    var inserts = [req.body.title, req.body.author, req.body.genre, req.body.book_id];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
          console.log('inside update route error');
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }else{
            res.redirect('/booksform');
        }
    });
  });

  return router;
}();