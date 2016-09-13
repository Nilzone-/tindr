module.exports = (function () {

    var request = require('request');
    var token = null;
    var last_activity_date = null;

    function Tindr() {}


    /**
     * The Options object that is passed in to the requests
     * @param  {string} method Specifies wether it's a GET POST PUT or DELETE
     * @param  {string} path   the endpoint
     * @param  {object} data   object passed with the request
     * @return {Promise}        
     */
    function configureOptions(method, path, data) {
        var options = {
            url: 'https://api.gotinder.com' + path,
            method: method,
            form: data,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['X-Auth-Token'] = token;
        }

        return options;
    }


    /**
     * Here we make the acutual requests
     * @param  {string} method Method type (GET POST PUT DELETE)
     * @param  {string} path   endpoint
     * @param  {object} data   Pass in data with a POST request
     * @return {Promise}        
     */
    function tinderRequest(method, path, data) {

        var options = configureOptions(method, path, data);

        return new Promise(function (resolve, reject) {
            return request(options, function (err, response, body) {
                var data = null;

                try {
                    data = JSON.parse(body);
                } catch (err) {
                    return reject('Unable to parse body => ' + err);
                }

                if (!err && response.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(err || data);
                }
            });
        });
    }



    /**
     * Setting up data for a GET request
     * @param  {path} the endpoint
     * @return {Promise}     
     */
    function tinderGet(path) {
        return tinderRequest('GET', path, null);
    }


    /**
     * Setting up data for a POST request
     * @param  {path} the endpoint
     * @param  {data} if you want to pass data with the request
     * @return {Promise}     
     */
    function tinderPost(path, data) {
        return tinderRequest('POST', path, data);
    }


    /**
     * A user needs to log in, in order to use the API
     * @param  {string} fb_token Facebook token
     * @param  {string} fb_id    Facebook id
     * @return {Promise}         Return a promise containing either data or error
     */
    Tindr.prototype.auth = function (fb_token, fb_id) {

        return tinderPost('/auth', {
                facebook_token: fb_token,
                facebook_id: fb_id
            })
            .then(function (data) {
                token = data.token;
                last_activity_date = data.create_date;

                return data;
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    };


    /**
     * Send a text message with token (needs to be done when the account is created)
     * @param  {number} phone_number The phone number you want the code to be sent to
     * @return {Promise} 
     */
    Tindr.prototype.sendToken = function (phone_number) {
        return tinderPost('/sendtoken', {
            phone_number: phone_number
        });
    };

    /**
     * Get object containing info in regards to your own profile
     * @return {Promise} 
     */
    Tindr.prototype.myProfile = function () {
        return tinderGet('/profile');
    };


    /**
     * Get profiles near your current location
     * @return {Promise} 
     */
    Tindr.prototype.getRecommendations = function () {
        return tinderGet('/recs/core');
    }


    /**
     * Get groups near your current location
     * @return {Promise} 
     */
    Tindr.prototype.getGroups = function () {
        return tinderGet('/recs/social');
    };

    /**
     * Like a person
     * @param  {string} user The profile you want to swipe right on
     * @return {Promise}     
     */
    Tindr.prototype.like = function (user) {
        return tinderGet('/like/' + user);
    };


    /**
     * Pass on a user
     * @param  {string} user The user you want to left-swipe
     * @return {Promise}      
     */
    Tindr.prototype.pass = function (user) {
        return tinderGet('/pass/' + user);
    };


    /**
     * Contains an object with info. People who liked you back,
     * the list over blocked people, last activity etc..
     * @return {Promise} 
     */
    Tindr.prototype.update = function () {
        return tinderPost('/updates', {
            last_activity_date: last_activity_date
        });
    };



    /**
     * For updating your profile
     * @param  {object} profile An Object Containing the new changes
     * @return {Promise}      
     */
    Tindr.prototype.updateProfile = function (profile) {
        if (typeof profile !== 'object') {
            return Promise.reject('Expected argument of type: Object');
        }

        return tinderPost('/profile', profile);
    };



    return new Tindr();

})();
