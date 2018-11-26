var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var app = express();

// Set up handlebars view engine
var handlebars = require('express-handlebars').create({ defaultLayout:'main' });

// Set handlebars engine
app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');

// Set port
app.set('port', process.env.PORT || 6091);
app.set('mysql', mysql);

app.use('/authorsform', require('./public/authorsform.js'));
app.use('/booksform', require('./public/booksform.js'));
app.use('/buytradesellform', require('./public/buytradesellform.js'));
app.use('/genresform', require('./public/genresform.js'));
app.use('/usersform', require('./public/usersform.js'));
app.use('/homepage', require('./public/homepage.js'));
app.use('/updateGenre', require('./public/genresform.js'));
app.use('/updateAuthor', require('./public/authorsform.js'));
app.use('/updateUser', require('./public/usersform.js'));
app.use('/updateBook', require('./public/booksform.js'));
app.use('/updateBTS', require('./public/buytradesellform.js'));

app.use('/', express.static('public'));

// Web Pages
app.get('/homepage', function(req, res) {
    res.render('homepage');
})

app.get('/booksform', function(req, res) {
    res.render('booksform');
})

app.get('/usersform', function(req, res) {
    res.render('usersform');
})

app.get('/authorsform', function(req, res) {
    res.render('authorsform');
})

app.get('/genresform', function(req, res) {
    res.render('genresform');
})

app.get('/buytradesellform', function(req, res) {
    res.render('buytradesellform');
})

app.get('/matches', function(req, res) {
    res.render('matches');
})

app.get('/updateGenre', function(req, res) {
    res.render('updateGenre');
})

app.get('/updateAuthor', function(req, res) {
    res.render('updateAuthor');
})

app.get('/updateBook', function(req, res) {
    res.render('updateBook');
})

app.get('/updateUser', function(req, res) {
    res.render('updateUser');
})

app.get('/updateBTS', function(req, res) {
    res.render('updateBTS');
})

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://flip3.engr.oregonstate.edu:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});
