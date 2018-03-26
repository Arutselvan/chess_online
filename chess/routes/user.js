var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');

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

/* Authenticate Admin */
router.get('/auth', function(req, res, next) {
	var found = 0;
	if(typeof req.headers['userid'] == 'undefined') { return res.status(404).send('Not Found'); }

	if(req.headers['ldap'] === btoa("admin1starks") && req.headers['userid'] === btoa("admin1")){found = 1;}
	if(req.headers['ldap'] === btoa("admin2lannisters") && req.headers['userid'] === btoa("admin2")){found = 1;}
	if(req.headers['ldap'] === btoa("admin3targaryans") && req.headers['userid'] === btoa("admin3")){found = 1;}
	if(req.headers['ldap'] === btoa("admin4tyrells") && req.headers['userid'] === btoa("admin4")){found = 1;}

	var myres = {isauthenticated: false, userid: "", sessionid: "" };

	if(found == 0) 
	{ 
		myres.isauthenticated = false;
		myres.userid = "random";
		myres.sessionid = "random"; 
	}
	else
	{
		myres.isauthenticated = true;
		myres.userid = req.headers['userid'];
		myres.sessionid = btoa(atob(req.headers['userid']) + atob(req.headers['userid']));
		Adminsonline.push({userid: myres.userid, sessionid: myres.sessionid}); 	
	}
	res.json(myres);
});

/* Logout Admin */
router.post('/auth', function(req, res, next) {
	var found = 0,index;
	if(typeof req.headers['userid'] == 'undefined') { return res.status(404).send('Not Found'); }

	for(var i=0; i< Adminsonline.length; i++)
	{
		if(Adminsonline[i].userid === req.headers['userid']) { found = 1; index = i; break; }
	}
	var myres = {success: true};
	if(found == 0) { return res.status(404).send('Not Found'); }
	else { Adminsonline.splice(index,1); return res.json(myres);}
});

module.exports = router;