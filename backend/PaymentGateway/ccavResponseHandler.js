var http = require('http'),
	fs = require('fs'),
	ccav = require('./ccavutil.js'),
	crypto = require('crypto'),
	qs = require('querystring');

exports.postRes = function (request, response) {
	var ccavEncResponse = '',
		ccavResponse = '',
		workingKey = '24D77D318BC6B367D66B0D251AFA280E',	//Put in the 32-Bit key shared by CCAvenues.
		ccavPOST = '';

	//Generate Md5 hash for the key and then convert in base64 string
	var md5 = crypto.createHash('md5').update(workingKey).digest();
	var keyBase64 = Buffer.from(md5).toString('base64');

	//Initializing Vector and then convert in base64 string
	var ivBase64 = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]).toString('base64');

	request.on('data', function (data) {
		ccavEncResponse += data;
		ccavPOST = qs.parse(ccavEncResponse);
		var encryption = ccavPOST.encResp;
		ccavResponse = ccav.decrypt(encryption, keyBase64, ivBase64);

		var orders_id = ccavResponse.orders_id,
			tracking_id = ccavResponse.tracking_id,
			bank_ref_no = ccavResponse.bank_ref_no,
			order_status = ccavResponse.order_status,
			failure_message = ccavResponse.failure_message,
			payment_mode = ccavResponse.payment_mode,
			card_name = ccavResponse.card_name,
			status_code = ccavResponse.status_code,
			status_message = ccavResponse.status_message

		console.log(orders_id, tracking_id, bank_ref_no, order_status)

	});

	request.on('end', function () {
		var pData = '';
		pData = '<table border=1 cellspacing=2 cellpadding=2><tr><td>'
		pData = pData + ccavResponse.replace(/=/gi, '</td><td>')
		pData = pData.replace(/&/gi, '</td></tr><tr><td>')
		pData = pData + '</td></tr></table>'

		// htmlcode = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><center><font size="4" color="blue"><b>Tushar  Page</b></font><br>' + pData + '</center><br></body></html>';
		htmlcode = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><a href="https://www.w3schools.com">Visit W3Schools</a><center><font size="4" color="blue"><b>Tushar  Page</b></font><br>' + pData + '</center><br></body></html>';
		response.writeHeader(200, { "Content-Type": "text/html" });
		response.write(htmlcode);
		response.end();
	});
};
