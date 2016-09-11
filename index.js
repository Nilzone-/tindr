require('dotenv').config();

var tindr = require('./tindr');
var facebook_token = process.env.FB_TOKEN;
var facebook_id = process.env.FB_ID;

//TESTING...

tindr.auth(facebook_token, facebook_id)
    .then(function (data) {
        console.log(['1st then', data]);
        return tindr.getRecommendations()
    })
    .then(function (recs) {
        console.log(['2nd then', recs]);
    })
    .catch(function (err) {
        console.log(['Catch', err]);;
    });
