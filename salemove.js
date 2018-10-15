const request = require('request')
const engagement_request = require('./engagement_request')
const engagement = require('./engagement')
const uuidv4 = require('uuid/v4');
require('dotenv').config();

function config () {
  return {
    server: process.env.SERVER,
    token: process.env.TOKEN,
    applicationToken: process.env.APPLICATION_TOKEN,
    incomingUrl: process.env.INCOMING_URL,
    siteId: process.env.SITE_ID
  }
};

function getEngagementRequestInformation(requestId){
  return engagement_request.findEngagementRequestById(requestId);
}

function getEngagementInformation(id){
  return engagement.findEngagementById(id);
}

function getEngagementBySenderId(senderId){
  return engagement.findEngagementBySenderId(senderId);
}

function engagementStart(senderId, operatorId, id, metadata, headers){
  engagement.addEngagement(senderId, operatorId, id, metadata, headers);
}

function visitorAuthentication(visitor) {
  return {
    'Accept': 'application/vnd.salemove.v1+json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${visitor.access_token}`
  };
}

function pickOperator(callback) {
  var options = {
    uri: `https://${config().server}/operators?include_offline=false&site_ids[]=${config().siteId}`,
     headers: {
      'Authorization': `Token ${config().token}`,
      'Accept': 'application/vnd.salemove.v1+json'
    },
    method: 'GET'
  }
  request(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      var operators = JSON.parse(body).operators
      if (operators.length > 0 ) {
        callback(operators[0])
      }else{
        callback({})
      }
    } else{
      callback({})
    }
  });
};

function sendMessage(engagement, message, callback){
  var messageId = uuidv4();
  var headers = engagement.headers;
  var options = {
    uri: `https://${config().server}/engagements/${engagement.id}/chat_messages/${messageId}`,
    headers: headers,
    method: 'PUT',
    json: {
      content: message
    }
  }
  request(options, function (error, response, body) {
    callback(!error);
  });
}

function startEngagementRequest(senderId, callback){
  createVisitor(function(visitor) {
    pickOperator(function(operator){
      requestEngagement(visitor, operator, function(success, engagementRequest) {
        if (success) {
          engagement_request.addEngagementRequest(engagementRequest.id, senderId, operator.id, visitorAuthentication(visitor));
          callback(operator);
        }
        else {
          callback({});
        }
      });
    });
  });
}

function createVisitor(callback) {
  var options = {
    uri: `https://${config().server}/visitors`,
    headers: {
      'Authorization': `ApplicationToken ${config().applicationToken}`,
      'Accept': 'application/vnd.salemove.v1+json'
    },
    method: 'POST'
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(JSON.parse(body));
    } else {
      callback({});
    }
  });
}

function requestEngagement(visitor, operator, callback) {
  var options = {
    uri: `https://${config().server}/engagement_requests`,
    headers: visitorAuthentication(visitor),
    method: 'POST',
    json: {
      media: 'text',
      operator_id: operator.id,
      source: 'visitor_integrator',
      site_id: config().siteId,
      webhooks: [{
        url: config().incomingUrl,
        method: 'POST',
        events: [
          'engagement.request.failure',
          'engagement.start',
          'engagement.transfer',
          'engagement.end',
          'engagement.chat.message',
          'engagement.chat.message_status'
        ]
      }]
    }
  }
  request(options, function (error, response, body) {
    callback(!error, body);
  });
};

exports.startEngagementRequest = startEngagementRequest
exports.pickOperator = pickOperator
exports.getEngagementRequestInformation = getEngagementRequestInformation
exports.engagementStart = engagementStart
exports.getEngagementInformation = getEngagementInformation
exports.sendMessage = sendMessage
exports.getEngagementBySenderId = getEngagementBySenderId