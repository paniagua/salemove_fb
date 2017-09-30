var engagements = []

function createEngagement(senderId, operatorId, id, metadata, headers){
  return {
    visitorId: senderId,
    operatorId: operatorId,
    id: id,
    metadata: metadata,
    headers: headers
  }
}

function addEngagement(senderId, operatorId, id, metadata, headers) {
  engagements.push(createEngagement(senderId, operatorId, id, metadata, headers));
  console.log("Engagements ", engagements);
}

function findEngagementBySenderId(senderId){
  return engagements.find(function(engagement){
    return engagement.visitorId === senderId;
  })
}

function findEngagementById(id){
  return engagements.find(function(engagement){
    return engagement.id === id;
  })
}

exports.addEngagement = addEngagement
exports.findEngagementById = findEngagementById
exports.findEngagementBySenderId = findEngagementBySenderId