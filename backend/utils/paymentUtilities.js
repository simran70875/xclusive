// Utility functions
function makeError(message) {
  return { message: message || "Something went wrong" };
}

function makeJuspayResponse(successRspFromJuspay) {
  if (successRspFromJuspay?.http) delete successRspFromJuspay.http;
  return successRspFromJuspay;
}



module.exports = { makeError, makeJuspayResponse };