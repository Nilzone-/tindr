var request = require('request');

module.exports = (function () {
    return new Tindr();
})();


function Tindr() {
    this.token = null;
    this.last_activity_date = null;
}

function configureOptions(path, data) {
    var options = {
        url: 'https://api.gotinder.com' + path,
        form: data,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (this.token) {
        options.headers['X-Auth-Token'] = this.token;
    }

    return options;
}

function handleReponse(data) {
    return data;
}

function handleError(err) {
    return Promise.reject(err);
}

function tinderPromise (options) {
    return new Promise(function (resolve, reject) {
        return request(options, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                try {
                    return resolve(JSON.parse(body));
                } catch (err) {
                    return reject(err);
                }
            }

            return reject(err || JSON.parse(body));
        });
    });
};



/**
 * Setting up data for a GEt request
 * @param  {path} the endpoint
 * @return {Promise}     
 */
function tinderGet (path) {
    var opts = configureOptions(path, null);
    opts.method = 'GET';

    return tinderPromise(opts)
        .then(handleReponse)
        .catch(handleError);
};


/**
 * Setting up data for a POST request
 * @param  {path} the endpoint
 * @param  {data} if you want to pass data with the request
 * @return {Promise}     
 */
function tinderPost (path, data) {
    var opts = configureOptions(path, data);
    opts.method = 'POST';

    return tinderPromise(opts)
        .then(handleReponse)
        .catch(handleError);
};


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
            this.token = data.token;
            this.last_activity_date = data.create_date;

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
        last_activity_date: this.last_activity_date
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
