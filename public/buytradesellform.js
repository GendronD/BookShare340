module.exports = function(){
  var express = require('express');
  var router = express.Router();

  function getUser(res, mysql, context, complete){
    mysql.pool.query("SELECT user_id, fname, lname, location, lat, lon FROM Users", function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
      }
      context.users = results;
      complete();
    });
  }

  function getBook(res, mysql, context, complete){
    mysql.pool.query("SELECT book_id, title, author, genre FROM Books", function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
      }
      context.books = results;
      complete();
    });
  }

  function getBuyTradeSell(res, mysql, context, complete){
    mysql.pool.query("SELECT id, CONCAT(u.fname, ' ', u.lname) AS name, b.title AS title, bst.search_radius, buy, trading, trading_for, sell FROM Buy_Trade_Sell bst INNER JOIN Users u ON u.user_id = bst.userID INNER JOIN Books b ON b.book_id = bst.book", function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }
      context.btsform = results;
      console.log(context.btsform);
      complete();
    });
  }

    // Retrieves the Specific BTS to be Updated
    function getBTSUpdate(res, mysql, context, id, complete){
      console.log('get bts in update');
      mysql.pool.query("SELECT id, u.fname, u.lname, b.title, bst.search_radius, buy, trading, trading_for, sell FROM Buy_Trade_Sell bst INNER JOIN Users u ON u.user_id = bst.userID INNER JOIN Books b ON b.book_id = bst.book WHERE id = " + id, function(error, results, fields){
        if(error){
          console.log("why errors....");
          res.write(JSON.stringify(error));
        }
        context.btsUpdate = results;
        console.log("btsUpdate Results:");
        console.log(context.btsUpdate);
        complete();
      })
    }

  router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deletebooks.js"];
    var mysql = req.app.get('mysql');
    getUser(res, mysql, context, complete);
    getBook(res, mysql, context, complete);
    getBuyTradeSell(res, mysql, context, complete);
    function complete(){
      callbackCount++;
      if(callbackCount >= 3){
        res.render('buytradesellform', context)
      }
    }
  });

    // Gets bts to be updated
    router.get('/:id', function(req, res) {
      console.log("updater function");
      console.log("id passed: " + req.params.id);
      var callbackCount = 0;
      var context = {};
      var mysql = req.app.get('mysql');
      getUser(res, mysql, context, complete);
      getBook(res, mysql, context, complete);
      getBTSUpdate(res, mysql, context, req.params.id, complete);
      function complete() {
        callbackCount++;
        if(callbackCount >= 3) {
          console.log("what is actually in context:");
          console.log(context);
          res.render('updateBTS', context);
        }
      }
    });

  router.post('/', function(req,res){
    var mysql = req.app.get('mysql');
    console.log(req.body);
    var sql = 'INSERT INTO Buy_Trade_Sell (userID, book, search_radius, buy, trading, trading_for, sell) VALUES (?,?,?,?,?,?,?)';
    var inserts = [req.body.userID, req.body.book, req.body.search_radius, req.body.buy, req.body.trading, req.body.trading_for, req.body.sell];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }else{
        res.redirect('/buytradesellform');
      }
    });
  });

  router.delete('/:id', function(req, res){
    console.log('inside delete route');
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM Buy_Trade_Sell WHERE id = ?";
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

    // Updates bts
    router.post('/update', function(req, res){
      console.log('inside update route');
      console.log('req userid: ' + req.body.userID);
      console.log('req book: ' + req.body.book);
      console.log('req search_radius: ' + req.body.search_radius);
      console.log('req buy: ' + req.body.buy);
      console.log('req trading: ' + req.body.trading);
      console.log('req trading_for: ' + req.body.trading_for);
      console.log('req sell: ' + req.body.sell);
      console.log('req id: ' + req.body.id);
      var mysql = req.app.get('mysql');
      var sql = "UPDATE Buy_Trade_Sell SET userID = ?, book = ?, search_radius = ?, buy = ?, trading = ?, trading_for = ?, sell = ? WHERE id = ?";
      var inserts = [req.body.userID, req.body.book, req.body.search_radius, req.body.buy, req.body.trading, req.body.trading_for, req.body.sell, req.body.id];
      sql = mysql.pool.query(sql, inserts, function(error, results, fields){
          if(error){
            console.log('inside update route error');
              res.write(JSON.stringify(error));
              res.status(400);
              res.end();
          }else{
              res.redirect('/buytradesellform');
          }
      });
    });

  return router;
}();
