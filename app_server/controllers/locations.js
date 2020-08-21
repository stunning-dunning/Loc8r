const request = require('request');
const { response } = require('express');
const apiOptions = {
  server: 'http://localhost:3000'
};
if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://vast-brook-90950.herokuapp.com/';
}
const showError = (req, res, status) =>  {
  let title = '';
  let content = '';
  if (status === 404) {
    title = '404, page not found';
    content = 'Oh dear. Looks like you can\'t find this page. Sorry.';
  } else {
    title = `${status}, something's gone wrong`;
    content = 'Something, somewhere, has gone just a little bit wrong.';
  }
  res.status(status);
  res.render('generic-text', {
    title,
    content
  });
};
const renderHomepage = function (req, res, responseBody) {
  let message = null;
  //console.log("length", responseBody.length);
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    if (!responseBody.length) {
      message = "No places found nearby";
    }
  }
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
    locations: responseBody,
    message
  });
};
const isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};
const formatDistance = function (distance) {
  distance = parseFloat(distance);
  if (distance && isNumeric(distance)) {
    let thisDistance = 0;
    let unit = 'm';
    if (distance > 1000) {
      thisDistance = parseFloat(distance / 1000).toFixed(1);
      unit = 'km';
    } else {
      thisDistance = Math.floor(distance);
    }
    return thisDistance + unit;
  } else {
    return '?';
  }
};
const homelist = function (req, res) {
  const path = '/api/locations';
  const requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {},
    qs: {
      lng: -94.581515,
      lat: 39.024153,
      maxDistance: 20
    }
  };
  request(
    requestOptions,
    (err, response, body) => {
      let data = body;
      //let data = [];
      //console.log(data[0].distance);
      if (response.statusCode === 200 && data.length) {
        for (let i = 0; i < data.length; i++) {
          console.log("first data", data[i].distance);
          data[i].distance = formatDistance(data[i].distance);
          console.log("second data", data[i].distance);
        }
      }
      renderHomepage(req, res, data);
    }
  );
};

const renderDetailPage = (req, res, location) => {
  res.render('location-info',
    {
      title: location.name,
       pageHeader: {
        title: location.name,
      },
      sidebar: {
        context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
        callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
      },
      location
    }
  );
};

const getLocationInfo = (req, res, callback) => {
  const path = `/api/locations/${req.params.locationid}`;
  const requestOptions = {
    url : `${apiOptions.server}${path}`,
    method : 'GET',
    json : {}
  };
  request(
    requestOptions,
    (err, {statusCode}, body) => {
      let data = body;
      if (statusCode === 200) {
        data.coords = {
          lng : body.coords[0],
          lat : body.coords[1]
        };
        callback(req, res, data);
      } else {
        showError(req, res, statusCode);
      }
    }
  );
};
const locationInfo = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderDetailPage(req, res, responseData)
  );
};
const renderReviewForm = (req, res,{name}) => {
  res.render('location-review-form', {
    title: `Review ${name} on Loc8r`,
    pageHeader: { title: `Review ${name}` },
    error: req.query.err
  });
};
/* GET 'Add review' page */
const addReview = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderReviewForm(req, res, responseData)
  );
};
const doAddReview = (req, res) => {
  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;
  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  const requestOptions = {
    url: apiOptions.server + path,
    method: 'POST',
    json: postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else {
    request(
      requestOptions,
      (err, {statusCode},{name}) => {
        if (statusCode === 201) {
          res.redirect(`/location/${locationid}`);
        } else if (statusCode === 400 && name && name === 'ValidationError' ) {
          res.redirect(`/location/${locationid}/review/new?err=val`);
        } else {
          showError(req, res, statusCode);
        }
      }
    );
  }
};
module.exports = {
  renderHomepage,
  homelist,
  locationInfo,
  addReview,
  doAddReview
};

/* const request = require('request');
const apiOptions = {
  server: 'http://localhost:3000'
};
if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://vast-brook-90950.herokuapp.com';
}

const showError = (req, res, status) => {
  let title = '';
  let content = '';

  if (status === 404) {
    title = '404, page not found';
    content = 'Oh dear, Looks like we can\'t find this page. Sorry';
  } else {
    title = `${status}, something's gone wrong`;
    content = 'Something, somewhere, has gone just a little bit wrong.';
  }
  res.status(status);
  res.render('generic-text', {
    title,
    content
  });
};

const renderHomepage = (req, res, responseBody) => {
  let message = null;
  //console.log(res)
  if (!(responseBody instanceof Array)) {
    message = 'API lookup error';
    responseBody = [];
  } else {
    if (!responseBody.length) {
      message = 'No places found nearby';
    }
  }
  res.render('locations-list',
    {
      title: 'Loc8r - find a place to work with wifi',
      pageHeader: {
        title: 'Loc8r',
        strapLine: 'Find places to work with wifi near you!'
      },
      sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
      locations: responseBody,
      message
    }
  );
};

const isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const formatDistance = function (distance) {
  distance = parseFloat(distance);
  if (distance && isNumeric(distance)) {
    let thisDistance = 0;
    let unit = 'm';
    if (distance > 1000) {
      thisDistance = parseFloat(distance / 1000).toFixed(1);
      unit = 'km';
    } else {
      thisDistance = Math.floor(distance);
    }
    return thisDistance + unit;
  } else {
    return '?';
  }
};

const homelist = function (req, res) {
  const path = '/api/locations';
  const requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {},
    qs: {
      lng: -0.9690884,
      lat: 51.455041,
      maxDistance: 20
    }
  };
  request(
    requestOptions,
    (err, response, body) => {
      let data = body;
      //let data = [];
      //console.log(response);
      if (response.statusCode === 200 && data.length) {
        for (let i = 0; i < data.length; i++) {
          console.log(data[i].distance);
          data[i].distance = formatDistance(data[i].distance);
          //console.log(data[i].distance);
        }
      }
      renderHomepage(req, res, data);
    }
  );
};

const renderDetailPage = (req, res) => {
  res.render('location-info',
    {
      title: 'Location Info',
      pageHeader: {
        title: 'Starcups',
        strapline: 'Good Coffee while you work over Wifi'
      },
      sidebar: {
        context: 'Starcups is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
        callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
      },
      Location: {
        Name: 'Starcups',
        address: '125 High street, reading RG6 1PS',
        rating: 3,
        facilities: ['Hot drinks', 'Food', 'Premium wifi', 'Pet friendly'],
        coords: { lat: -0.9690884, lng: 51.455041 },
        openingTimes: [{
          days: 'Monday-Friday',
          opening: '7:00am',
          closing: '7:00pm',
          closed: false
        }, {
          days: 'Saturday',
          opening: '8:00am',
          closing: '5:00pm',
          closed: false
        }, {
          days: 'Sunday',
          Closed: true
        }],
        reviews: [{
          author: 'Simon Holmes',
          rating: 5,
          timestamp: '16 July 2013',
          reviewText: 'What a great place.  I can\'t say enough good things about it.'
        }, {
          author: 'Charlie Chaplin',
          rating: 3,
          timestamp: '16 July 2013',
          reviewText: 'It was okay.  Coffee wasn\'t great, but the wifi was fast.'
        }]
      }
    }
  );
};

const locationInfo = (req, res) => {
  renderDetailPage(req, res, responseData)
};

const addReview = (req, res) => {
  res.render('location-review-form',
    {
      title: 'Review Starcups on Loc8r',
      pageHeader: { title: 'Review Starcups' }
    }
  );
};

const doAddReview = (req, res) => {
  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;
  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'POST',
    json: postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else {
    request(
      requestOptions,
      (err, {statusCode}, {name}) => {
        if (statusCode === 201) {
          res.redirect(`/location/${locationid}`);
        } else if (statusCode === 400 && name && name === 'ValidationError') {
          res.redirect(`/location/${locationid}/review/new?err=val`);
        } else {
          showError(req, res, statusCode);
        }
      }
    );
  }
};

module.exports = {
  homelist,
  locationInfo,
  addReview,
  doAddReview,
};

//const homelist = (req, res) => {
  //res.render('locations-list',
    //{
      //title: 'Loc8r - find a place to work with wifi',
      //pageHeader: {
        //title: 'Loc8r',
        //strapline: 'Find places to work with wifi near you!'
      //},
      //sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
      //locations: [
        //{
          //name: 'Starcups',
          //address: '25 High Street, Reading, RG6 1PS',
          //rating: 3,
          //facilities: ['Hot drinks', 'Food', 'Premium wifi'],
          //distance: '100m'
        //},
        //{
          //name: 'Cafe Hero',
          //address: '325 High Street, Reading, RG6 1PS',
          //rating: 4,
          //facilities: ['Hot drinks', 'Food', 'Premium wifi'],
          //distance: '200m'
        //},
        //{
          //name: 'Burger Queen',
          //address: '515 High Street, Reading, RG6 1PS',
          //rating: 2,
          //facilities: ['Food', 'Premium wifi'],
          //distance: '250m'
        //},
        //{
          //name: 'Starcups',
          //address: '25 High Street, Reading, RG6 1PS',
          //rating: 3,
          //facilities: ['Hot drinks', 'Food', 'Premium wifi'],
          //distance: '100m'
        //},
        //{
          //name: 'Cafe Hero',
          //address: '325 High Street, Reading, RG6 1PS',
          //rating: 4,
          //facilities: ['Hot drinks', 'Food', 'Premium wifi'],
          //distance: '200m'
        //},
        //{
          //name: 'Burger Queen',
          //address: '515 High Street, Reading, RG6 1PS',
          //rating: 2,
          //facilities: ['Food', 'Premium wifi'],
          //distance: '250m'
        //}
      //]
    //}
  //); 
//};


//const locationInfo = (req, res) => {
  //res.render('location-info', 
   //{ 
      //title: 'Location Info',
      //pageHeader: {
        //title: 'Starcups',
        //strapline: 'Good Coffee while you work over Wifi'  
      //},
      //sidebar: {
        //context: 'Starcups is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
        //callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
      //},
      //Location: {
        //Name: 'Starcups',
        //address: '125 High street, reading RG6 1PS',
        //rating: 3,
        //facilities: ['Hot drinks', 'Food', 'Premium wifi', 'Pet friendly'],
        //coords: {lat: 39.248680, lng: -94.573250},
        //openingTimes: [{
          //days: 'Monday-Friday',
          //opening: '7:00am',
          //closing: '7:00pm',
          //closed: false
        //},{
          //days: 'Saturday',
          //opening: '8:00am',
          //closing: '5:00pm',
          //closed: false
        //},{
          //days: 'Sunday',
          //Closed: true
        //}],
        //reviews: [{
          //author: 'Simon Holmes',
          //rating: 5,
          //timestamp: '16 July 2013',
          //reviewText: 'What a great place.  I can\'t say enough good things about it.'
        //},{
          //author: 'Charlie Chaplin',
          //rating: 3,
          //timestamp: '16 July 2013',
          //reviewText: 'It was okay.  Coffee wasn\'t great, but the wifi was fast.'
        //}]
      //}
    //}
  //);
//};

//const addReview = (req, res) => {
  //res.render('location-review-form', 
  //{
     //title: 'Add review',
     //pageHeader: {
       //title: 'Review Starcups'
     //}
    //}
  //);
//};

//module.exports = {
    //homelist,
    //locationInfo,
    //addReview
//}; */