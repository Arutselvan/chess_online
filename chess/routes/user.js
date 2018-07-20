var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var IITMNetworkAuth = require('iitm-network-auth');

global.Buffer = global.Buffer || require('buffer').Buffer;

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str, 'binary').toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString('binary');
  };
}


var Adminsonline = [];

/* Authenticate User */
router.post('/auth', function(req, res, next) {
	var found = 0;
	var myres = {isAuthenticated: false, userId: "", sessionId: "" };

	/* Auth using iitm-network-auth */
	var user_id = req.body.user_id;
	var password = req.body.password;
	var auth = new IITMNetworkAuth(user_id, password, 'nfw');
	auth.login();
	if(auth.is_logged_in()){
		found = 1;
	}

	
	if(found == 0) 
	{ 
		re.json(myres); 
	}
	else
	{
		myres.isAuthenticated = true;


		// Adminsonline.push({userId: myres.userId, sessionId: myres.sessionId});
		User.Users.find({roll: req.body['userId']},function (err, founduser){
			if (err) return next(err);
			console.log(founduser);
			if(founduser.length == 0) 
			{
				User.Users.create({roll:req.body['userId']},function(err,createduser){
					if (err) return next(err);
					myres.userId = createduser._id;
					User.Useronline.create({userId:createduser._id},function(err,onlineuser){
						if (err) return next(err);
						myres.sessionId = onlineuser._id;
						res.json(myres);
					}); 
				});
			}
			else
			{
				myres.userId = founduser[0]._id;
				User.Useronline.find({userId:founduser[0]._id},function(err,onlineuser){
					if (err) return next(err);
					if(onlineuser.length == 0)
					{
						User.Useronline.create({userId:founduser[0]._id},function(err,nowonline){
							if (err) return next(err);
							myres.sessionId = nowonline._id;
							res.json(myres);
						});
					}
					else
					{
						myres.sessionId = onlineuser[0]._id;
						res.json(myres);
					}
				});
			}
		}); 	
	}
	
});

/* Logout User */
router.post('/logout', function(req, res, next) {
	var found = 0,index;
	if(typeof req.headers['userId'] == 'undefined') { return res.status(404).send('Not Found'); }

	User.Useronline.find({userId:req.headers['userId']},function(err,onlineuser){
		if (err) return next(err);
		if(onlineuser.length == 0) { return res.status(404).send('Not Found'); }
		User.Useronline.findByIdAndRemove(onlineuser[0]._id, function (err, post) {
			if (err) return next(err);
			var myres = {success: true};
			res.json(myres);
		});
	});
	
});

/* All Blogs */
router.get('/blog', function(req, res, next) {
	
	if(typeof req.headers['userId'] == 'undefined') { return res.status(404).send('Not Found'); }

	User.Useronline.find({userId:req.headers['userId']},function(err,onlineuser){
		if(onlineuser.length == 0) { return res.status(404).send('Not Found'); }
		User.Blog.find(function (err, products) {
			if (err) return next(err);
			var myres = [];
			for( var i=0; i< products.length ; i++)
			{
				myres.push({id: products[i]._id, title: products[i].title, subtitle: products[i].subtitle, stamp: products[i].stamp});
			}
			var jsonret = JSON.stringify(myres);
	      	res.json(jsonret);
		});
	});	
});

/* Single Blog By ID */
router.get('/blog/:id', function(req, res, next) {
	
	if(typeof req.headers['userId'] == 'undefined') { return res.status(404).send('Not Found'); }

	User.Useronline.find({userId:req.headers['userId']},function(err,onlineuser){
		if(onlineuser.length == 0) { return res.status(404).send('Not Found'); }
		User.Blog.findById(req.params.id, function (err, post) {
			if (err) return next(err);
			res.json(post);
		});
	});	
});

/* Display Profile */
router.get('/:id', function(req, res, next) {
	
	if(typeof req.headers['userId'] == 'undefined') { return res.status(404).send('Not Found'); }

	User.Useronline.find({userId:req.headers['userId']},function(err,onlineuser){
		if(onlineuser.length == 0) { return res.status(404).send('Not Found'); }

		User.Users.findById(req.params.id, function (err, post) {
			if (err) return next(err);
			if(post.matches.length > 10)
			  post.matches = post.matches.slice(0,11);
			res.json(post);
		});
	});	
});

/* Leaderboard */
router.get('/leaderboard',function(req, res, next) {
	var found = 0;
	if(typeof req.headers['userId'] == 'undefined') { return res.status(404).send('Not Found'); }

	User.Useronline.find({userId:req.headers['userId']},function(err,onlineuser){
		if(onlineuser.length == 0) { return res.status(404).send('Not Found'); }
		User.Users.find().sort({ instirating : -1 },function(err,userobj){
		    if (err) return next(err);
		    if(userobj.length == 0) { return res.status(404).send('Not Found'); }
		    if(userobj.length <= 10)
		    {
		    	var jsonret = JSON.stringify(userobj);
				res.json(jsonret);
		    }
		    var usertop = userobj.slice(0,10);
		    User.Users.findById(req.headers['userId'], function (err, post) {
				  if (err) return next(err);
				  usertop.push(post);
				  var jsonret = JSON.stringify(usertop);
				  res.json(jsonret);
		    });
	  	});
	});
});


router.post('/changeresult', function(req, res, next){
	var found = 0;
	if(typeof req.headers['userId'] == 'undefined') { return res.status(404).send('Not Found'); }

	User.Useronline.find({userId:req.headers['userId']},function(err,onlineuser){
		if(onlineuser.length == 0) { return res.status(404).send('Not Found'); }
		User.Allmatch.find({matchid: req.headers['matchid']}, function(err,match){
			if (err) return next(err);
			match[0].result = req.headers['result'];
			match[0].save();
			var matchid = req.headers['matchid'],result = req.headers['result'];
			var whiteplayer = matchid.slice(0,(matchid.length)/2);
			var blackplayer = matchid.slice((matchid.length)/2,matchid.length);
			User.Users.findById(whiteplayer, function (err, white) {
				User.Users.findById(blackplayer, function (err, black) {
					white.matchesplayed = white.matchesplayed + 1;
					black.matchesplayed = black.matchesplayed + 1;
					for(var i =0 ; i<white.matches.length; i++)
					{
						if(white.matches[i].matchid === matchid)
						{
							white.matches[i].result = result;
							break;	
						}
					}
					for(var i =0 ; i<black.matches.length; i++)
					{
						if(black.matches[i].matchid === matchid)
						{
							black.matches[i].result = result;
							break;	
						}
					}
					if(result == 1)
						white.matcheswon = white.matcheswon + 1;
					else if(result == 3)
						black.matcheswon = black.matcheswon + 1;
					changerating(white,black,result);
					white.save();
					black.save();
					
				});	
			});
		});
	});

	
});




module.exports = router;