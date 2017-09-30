var engagement_requests = []

function createEngagementRequest(id, senderId, operatorId, headers){
  return {
    id: id,
    visitorId: senderId,
    operatorId: operatorId,
    headers: headers
  }
}

function addEngagementRequest(id, senderId, operatorId, headers) {
  engagement_requests.push(createEngagementRequest(id, senderId, operatorId, headers));
  console.log("Requests", engagement_requests);
}

function findEngagementRequestById(id){
  return engagement_requests.find(function(engagementRequest){
    return engagementRequest.id === id;
  })
}

exports.addEngagementRequest = addEngagementRequest
exports.findEngagementRequestById = findEngagementRequestById