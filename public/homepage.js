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

    function getBuyTradeSell(res, mysql, context, complete){
      mysql.pool.query("SELECT id, CONCAT(u.fname, ' ', u.lname) AS name, b.title AS title, bst.search_radius, buy, trading, trading_for, sell FROM Buy_Trade_Sell bst INNER JOIN Users u ON u.user_id = bst.userID INNER JOIN Books b ON b.book_id = bst.book", function(error, results, fields){
        if(error){
          res.write(JSON.stringify(error));
          res.end();
        }
        context.btsform = results;
        //console.log(context.btsform);
        complete();
      });
    }
  
    router.get('/', function(req, res){
      var callbackCount = 0;
      var context = {};
      context.jsscripts = ["deletebooks.js"];
      var mysql = req.app.get('mysql');
      getUser(res, mysql, context, complete);
      getBuyTradeSell(res, mysql, context, complete);
      function complete(){
        callbackCount++;
        if(callbackCount >= 2){
          res.render('homepage', context)
        }
      }
    });

    router.post('/', function(req, res){
      //console.log("in proper post method");
      //console.log(req.body);
      var context = {};
      var mysql = req.app.get('mysql');
      if(req.body.choice == 1) {           //buy
        //console.log("in choice 1");
        var sql = "SELECT 	CONCAT(matches.fname,' ', matches.lname) AS name, " +
        "b.title, matches.location, a.sell, " + "( 3959 * acos( cos( radians(searcher.lat) ) * cos( radians( matches.lat ) ) * cos( radians( matches.lon ) - radians(searcher.lon) ) + sin( radians(searcher.lat) ) * sin(radians(matches.lat)) ) ) as distance" +
        " FROM Buy_Trade_Sell a " +
        "INNER JOIN Users matches ON matches.user_id = a.userID " +
        "INNER JOIN Users searcher ON searcher.user_id = " + req.body.user_id + " " + 
        "INNER JOIN Buy_Trade_Sell z ON z.userID = searcher.user_id " +
        "INNER JOIN Books b ON b.book_id = a.book AND b.book_id = z.book " +
        "WHERE b.book_id = (SELECT book FROM Buy_Trade_Sell WHERE id = " + req.body.id + ") " + 
        "AND a.sell = 1" +
        " AND ( 3959 * acos( cos( radians(searcher.lat) ) * cos( radians( matches.lat ) ) " + 
        "* cos( radians( matches.lon ) - radians(searcher.lon) ) + sin( radians(searcher.lat) ) " +
        "* sin(radians(matches.lat)) ) ) < z.search_radius ORDER BY distance;";
      } else if(req.body.choice == 2) {    // trading
        var sql = "SELECT 	CONCAT(matches.fname,' ', matches.lname) AS name, " +
        "b.title, matches.location, a.trading_for, " + "( 3959 * acos( cos( radians(searcher.lat) ) * cos( radians( matches.lat ) ) * cos( radians( matches.lon ) - radians(searcher.lon) ) + sin( radians(searcher.lat) ) * sin(radians(matches.lat)) ) ) as distance" +
        " FROM Buy_Trade_Sell a " +
        "INNER JOIN Users matches ON matches.user_id = a.userID " +
        "INNER JOIN Users searcher ON searcher.user_id = " + req.body.user_id + " " + 
        "INNER JOIN Buy_Trade_Sell z ON z.userID = searcher.user_id " +
        "INNER JOIN Books b ON b.book_id = a.book AND b.book_id = z.book " +
        "WHERE b.book_id = (SELECT book FROM Buy_Trade_Sell WHERE id = " + req.body.id + ") " + 
        "AND a.trading_for = 1" +
        " AND ( 3959 * acos( cos( radians(searcher.lat) ) * cos( radians( matches.lat ) ) " + 
        "* cos( radians( matches.lon ) - radians(searcher.lon) ) + sin( radians(searcher.lat) ) " +
        "* sin(radians(matches.lat)) ) ) < z.search_radius ORDER BY distance;";
      } else if(req.body.choice == 3) {    // trading_for
        var sql = "SELECT 	CONCAT(matches.fname,' ', matches.lname) AS name, " +
        "b.title, matches.location, a.trading, " + "( 3959 * acos( cos( radians(searcher.lat) ) * cos( radians( matches.lat ) ) * cos( radians( matches.lon ) - radians(searcher.lon) ) + sin( radians(searcher.lat) ) * sin(radians(matches.lat)) ) ) as distance" +
        " FROM Buy_Trade_Sell a " +
        "INNER JOIN Users matches ON matches.user_id = a.userID " +
        "INNER JOIN Users searcher ON searcher.user_id = " + req.body.user_id + " " + 
        "INNER JOIN Buy_Trade_Sell z ON z.userID = searcher.user_id " +
        "INNER JOIN Books b ON b.book_id = a.book AND b.book_id = z.book " +
        "WHERE b.book_id = (SELECT book FROM Buy_Trade_Sell WHERE id = " + req.body.id + ") " + 
        "AND a.trading = 1" +
        " AND ( 3959 * acos( cos( radians(searcher.lat) ) * cos( radians( matches.lat ) ) " + 
        "* cos( radians( matches.lon ) - radians(searcher.lon) ) + sin( radians(searcher.lat) ) " +
        "* sin(radians(matches.lat)) ) ) < z.search_radius ORDER BY distance;";
      } else if(req.body.choice == 4) {    // sell
        var sql = "SELECT 	CONCAT(matches.fname,' ', matches.lname) AS name, " +
        "b.title, matches.location, a.buy, " + "( 3959 * acos( cos( radians(searcher.lat) ) * cos( radians( matches.lat ) ) * cos( radians( matches.lon ) - radians(searcher.lon) ) + sin( radians(searcher.lat) ) * sin(radians(matches.lat)) ) ) as distance" +
        " FROM Buy_Trade_Sell a " +
        "INNER JOIN Users matches ON matches.user_id = a.userID " +
        "INNER JOIN Users searcher ON searcher.user_id = " + req.body.user_id + " " + 
        "INNER JOIN Buy_Trade_Sell z ON z.userID = searcher.user_id " +
        "INNER JOIN Books b ON b.book_id = a.book AND b.book_id = z.book " +
        "WHERE b.book_id = (SELECT book FROM Buy_Trade_Sell WHERE id = " + req.body.id + ") " + 
        "AND a.buy = 1" +
        " AND ( 3959 * acos( cos( radians(searcher.lat) ) * cos( radians( matches.lat ) ) " + 
        "* cos( radians( matches.lon ) - radians(searcher.lon) ) + sin( radians(searcher.lat) ) " +
        "* sin(radians(matches.lat)) ) ) < z.search_radius ORDER BY distance;";
      }
    
      sql = mysql.pool.query(sql, function(error, results, context, fields){
          if(error){
              res.write(JSON.stringify(error));
              res.status(400);
              res.end();
          }else{
              context.matches = results;
              res.render('matches', context);
          }
      });
      }); 
    
  router.get('/:id', function(req, res){
    var context = {};
    var mysql = req.app.get('mysql');
    var sql = "SELECT CONCAT(u.fname, ' ', u.lname) AS name, b.title AS title, bst.search_radius, buy, trading, trading_for, sell FROM Buy_Trade_Sell bst INNER JOIN Users u ON u.user_id = bst.userID INNER JOIN Books b ON b.book_id = bst.book WHERE bst.id = ?";
    var inserts = [req.params.id];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }else{
            //console.log("YOU CAN BUILD THE TABLE");
            context.showtable = results;
            //console.log(context.showtable);
            res.send(context);
        }
    });
    }); 
    router.get('/filter/:user_id', function(req, res){
      console.log("in new router for filter");
      var context = {};
      var mysql = req.app.get('mysql');
      var sql = "SELECT id, CONCAT(u.fname, ' ', u.lname) AS name, b.title AS title, bst.search_radius, buy, trading, trading_for, sell FROM Buy_Trade_Sell bst INNER JOIN Users u ON u.user_id = bst.userID INNER JOIN Books b ON b.book_id = bst.book WHERE bst.userID = ?";
      var inserts = [req.params.user_id];
      sql = mysql.pool.query(sql, inserts, function(error, results, fields){
          if(error){
              console.log("error in filtering");
              res.write(JSON.stringify(error));
              res.status(400);
              res.end();
          }else{
              console.log("Filtering possible");
              context.filteredBooks = results;
              console.log(context.filteredBooks);
              res.send(context);
          }
      });
      }); 
    

    return router;
  }();
