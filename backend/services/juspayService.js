

const fs = require("fs");
const config = require("../config.json");
const { Juspay } = require("expresscheckout-nodejs");
const SANDBOX_BASE_URL = "https://smartgatewayuat.hdfcbank.com";
const PRODUCTION_BASE_URL = "https://smartgateway.hdfcbank.com";

const publicKey = fs.readFileSync(config.PUBLIC_KEY_PATH);
const privateKey = fs.readFileSync(config.PRIVATE_KEY_PATH);

const JuspaySetup = new Juspay({
  merchantId: config.MERCHANT_ID,
  baseUrl: SANDBOX_BASE_URL,
  jweAuth: {
    keyId: config.KEY_UUID,
    publicKey,
    privateKey,
  },
});



module.exports = { JuspaySetup };
