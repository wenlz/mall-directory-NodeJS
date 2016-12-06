var express 	= require('express');
var session 	= require('express-session');
var app			= express();
var cookieParser = require('cookie-parser');
var bodyParser	= require('body-parser');
var mongoose	= require('mongoose');
var morgan      = require('morgan');
var bcrypt 		= require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var models			= require('./app/model');
var passport = require('passport');
var emailValidator = require("email-validator");

// var path = __dirname + '/views/';
var path = require('path')

app.use(morgan('dev'));
// Model
var db			= require('./app/model')

// set our port
var port = process.env.PORT || 3000;

// set the static files location /public/img will be /img for users
app.use(express.static(path.join(__dirname + '/public')))

app.use('views', express.static(__dirname + 'views'));
app.use('/js', express.static(__dirname + '/bower_components/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/bower_components/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/js', express.static(__dirname + '/bower_components/angular')); // redirect CSS bootstrap

var config = require('./config/config-local');

//require passport
require('./app/passport.js')(passport,emailValidator,config,models);

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//using api
app.use('/api', require('./routes/apiRoute')(models, express, passport, config, jwt));

app.get('/user', function(req, res){
	console.log('I received a GET request');
	//res.send('YOYOI');
	// db.Friend.find({}, function (err, friends){
	// 	if(err) return console.error(err);
	// 	//return res.sendFile(path + 'index.html', friends);
	// 	console.log(friends);
	// 	return res.json(friends);
	// 	//return res.render('user', {friend : 'friends.address'});
	// 	//res.render('/user', { title: 'Express' });

	// });
	db.Friend.find().exec(function (err, friends){
		if(err){
			return res.json({
				err: err
			})
		}

		console.log(friends);

		return res.json({
			success: true,
			friends: friends
		})
	})
});

app.get('/friends', function(req, res){
	console.log('I received a GET request');
	//db.Friend.find({ _id : {$lt : req.body} }).exec(function (err, friends){
	db.Friend.find().exec(function (err, friends){
		if(err){
			return res.json({
				err: err
			})
		}

		console.log(friends);

		return res.json({
			success: true,
			friends: friends
		})
	})
});

app.get('/friend/:id', function(req, res){
	console.log('1 friends');
	db.Friend.findById(req.params.id, function (err, friend){
		if(err){
			return res.json({
				err: err
			})
		}

		console.log(friend);

		return res.json({
			success: true,
			friend 	: friend
		})
	})
});

app.put('/friend/:id', function(req, res){
	//console.log(req.params);
	console.log(req.body);
	db.Friend.findById(req.params.id, function (err, friend){
		if(err){
			return res.json({
				err: err
			})
		}
		//console.log(req.body);
		friend.name = req.body.name;
		friend.birthday = req.body.birthday;
		friend.email = req.body.email;
		friend.address = req.body.address;
		friend.updated_at = new Date();

		 // save the bear
        friend.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'success' });
            });
	})
});


app.delete('/friend/:id', function (req, res) {
  var id = req.params.id;
  console.log(id);
  db.Friend.findById(id).remove().exec(function (err, doc) {
  	if(err){
		return
			res.json({
				err: err
			})
	}

    res.json(doc);
  });
});


app.delete('/friend', function (req, res) {
  db.Friend.remove().exec(function (err, doc) {
  	if(err){
		return
			res.json({
				err: err
			})
	}

    res.json(doc);
  });
});

app.post('/', function(req, res){
	var body = req.body;

	console.log(body);

	var newFriend = new db.Friend();
	console.log(newFriend);
	//newFriend = body;
	newFriend.name = body.name;
	newFriend.birthday = body.birthday;
	newFriend.email = body.email;
	newFriend.address = body.address;
	newFriend.phone = body.phone;

	newFriend.save(function (err, savedFriend){
		if(err){
			return res.json({
				success: false,
				err: err
			});
		}
		return res.json({
			success: true,
			friend: savedFriend
		})
	})
});

app.get('/detail/:id', function(req, res){
	console.log('1 friend detail');
	db.Friend.findById(req.params.id, function (err, friend){
		if(err){
			return res.json({
				err: err
			})
		}

		console.log(friend);

		return res.json({
			success: true,
			friend 	: friend
		})
	})
});

app.get('/login', function(req, res){
	console.log('I received a GET request');
	res.send('LOGIN');
});

app.get('/login/:name', function(req, res){
	console.log('I received a GET request');
	res.send('YOUR NAME : ' + req.params.id);
});

app.get('/company', function(req, res){
	db.Company.find().exec(function(err, companies){
		if(err)
		{
			return res.json({
				success : false,
				err : err
			})
		}

		return res.json({
			success : true,
			companies : companies
		})
	})
})

app.post('/company', function(req, res){
	var body = req.body;

	var newCompany = new db.Company();
	newCompany.name = body.name;
	newCompany.address = body.address;

	newCompany.save(function (err, savedCompany){
		if(err){
			return res.json({
				success: false,
				err: err
			});
		}
		return res.json({
			success: true,
			company: savedCompany
		})
	})
})

app.put('/company/:companyId', function(req, res){
	var body = req.body;

	db.Company.findById(req.params.companyId, function(err, company){
		if(err){
			return res.json({
				success: false,
				err: err
			})
		}

		company.name = body.name;
		company.address = body.address;

		company.save(function (err, savedCompany){
			return res.json({
				success: true
			})
		})
	})
})

app.post('/signup', function(req, res){

	var body = req.body;
	//console.log(body);

		bcrypt.hash(body.password, bcrypt.genSaltSync(8), null, function(err, hash) {
	    // Store hash in your password DB.
	    var user = new db.User();
			// console.log(body);

	    user.fullname = body.fullname;
	    user.email = body.email;
	    user.password = hash;
			console.log(user);

	    user.save(function(err, savedUser){
	    	if(err)
	    	{
	    		return res.json({
	    			err: err
	    		})
	    	}
	    	return res.json({
	    		success : true
	    	})
	    })

		});

});

app.post('/login', function(req, res){
	var body = req.body;

	db.User.findOne({ 'email': body.email }).select('-password').exec(function(err, user){
	//db.User.findOne({ 'email': body.email }, (function(err, user){
	if(err)
		return console.error(err)

	// Load hash from your password DB.
	bcrypt.compare(body.password, user.password, function(err, res2) {

    if(res2 == true){
    	return res.json({
    		success : res2
    	});
    }else if( res2 == false){
    	return res.json({
    		success : res2
    	});
    }else{
    	return console.error(err);
    }
	});

	})
});

app.get('*', function(req, res){
	res.sendFile(__dirname+'/public/views/index.html')
})
// routes ==================================================
//require('./app/routes')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:3000
app.listen(port, function(){
	console.log("Server running on port 3000");
});
