module.exports = function(){
    var express = require('express');
    var router = express.Router();
  
    function getUser(res, mysql, context, complete){
      console.log('get user');
      mysql.pool.query("SELECT user_id, fname, lname, location, lat, lon FROM Users", function(error, results, fields){
        if(error){
          console.log("why errors....");
          res.write(JSON.stringify(error));
        }
        context.users = results;
        complete();
      })
    }

      // Retrieves the Specific User to be Updated
  function getUserUpdate(res, mysql, context, id, complete){
    console.log('get genre in update');
    mysql.pool.query("SELECT user_id, fname, lname, location, lat, lon FROM Users WHERE user_id = " + id, function(error, results, fields){
      if(error){
        console.log("why errors....");
        res.write(JSON.stringify(error));
      }
      context.usersUpdate = results;
      console.log("usersUpdate Results:");
      console.log(context.usersUpdate);
      complete();
    })
  }

    router.get('/', function(req, res){
    console.log('in router get');
      var callbackCount = 0;
      var context = {};
      context.jsscripts = ["deletebooks.js"];
      var mysql = req.app.get('mysql');
      getUser(res, mysql, context, complete);
      function complete(){
        callbackCount++;
        if(callbackCount >= 1){
          res.render('usersform', context);
        }
      }
    });

      // Gets user to be updated
  router.get('/:id', function(req, res) {
    console.log("updater function");
    console.log("id passed: " + req.params.id);
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    getUserUpdate(res, mysql, context, req.params.id, complete);
    function complete() {
      callbackCount++;
      if(callbackCount >= 1) {
        console.log("what is actually in context:");
        console.log(context);
        res.render('updateUser', context);
      }
    }
  });
  
    router.post('/', function(req,res){
      console.log('in post for user');
      var mysql = req.app.get('mysql');
      var sql = 'INSERT INTO Users (fname, lname, location, lat, lon) VALUES (?, ?, ?, ?, ?)';
      var inserts = [req.body.fname, req.body.lname, req.body.location, req.body.lat, req.body.lon];
      sql = mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
           console.log("in error for post");
          res.write(JSON.stringify(error));
          res.end();
        }else{
          res.redirect('/usersform');
        }
      });
    });

    router.delete('/:id', function(req, res){
      console.log('inside delete route');
      var mysql = req.app.get('mysql');
      var sql = "DELETE FROM Users WHERE user_id = ?";
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

      // Updates User
  router.post('/update', function(req, res){
    console.log('inside update route');
    console.log('req body: ' + req.body.fname);
    console.log('req body: ' + req.body.lname);
    console.log('req body: ' + req.body.location);
    console.log('req body: ' + req.body.lat);
    console.log('req body: ' + req.body.lon);
    console.log('req res: ' + req.body.user_id);
    var mysql = req.app.get('mysql');
    var sql = "UPDATE Users SET fname = ?, lname = ?, location = ?, lat = ?, lon = ? WHERE user_id = ?";
    var inserts = [req.body.fname, req.body.lname, req.body.location, req.body.lat, req.body.lon, req.body.user_id];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
          console.log('inside update route error');
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }else{
            res.redirect('/usersform');
        }
    });
  });
    return router;
}();