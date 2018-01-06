const express = require('express');
const request = require('request');
const mongodb = require('mongoose');
const path = require('path');
const app = express();
const schema = mongodb.Schema;

const dbUrl = "mongodb://localhost:27017/coinDb";
const btcUrl = 'https://api.coinone.co.kr/ticker/?currency=btc';
const xrpUrl = 'https://api.coinone.co.kr/ticker/?currency=xrp';

const coinSchema = new schema(
{
	time: {
		type: String,
		default: `${Math.floor(Date.now() / 1000)}`
	},
	price: {
		type: String,
		default: '0'
	},
	error: {
		type: String,
		default: 'none'
	},
	lastPrice: {
		type: Boolean,
		default: false
	}
}, {
	 versionKey: false
});

const btcPrice = mongodb.model('btcPrice', coinSchema);
const xrpPrice = mongodb.model('xrpPrice', coinSchema);

const PORT = 3000;
const INTERVAL = 1000 * 10;

app.listen(PORT, function() {
	console.log(`Server start on port ${PORT} : ${new Date().getTime()}`);
  if (process.argv[2] === '-r') {
    btcPrice.remove({}, function(err) {
      if (err) console.log(err);
      console.log('BTC DB removed successfully');
    });
    xrpPrice.remove({}, function(err) {
      if (err) console.log(err);
      console.log('XRP DB removed successfully');
    });
  }
  mongodb.connect(dbUrl, function(err, client) {
    if (err) console.log(err);;
    console.log("DB connected successfully");
	  getInfo(btcUrl, btcPrice);
  	getInfo(xrpUrl, xrpPrice);
  	setInterval(getInfo, INTERVAL, btcUrl, btcPrice);
  	setInterval(getInfo, INTERVAL, xrpUrl, xrpPrice);
	});
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/client.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.js'));
});

app.get('/server', (req, res) => {
  res.sendFile(path.join(__dirname, 'server.log'));
});

app.get('/get/:coin/:func', (req, res) => {	
	res.header('Content-Type', 'text/html');
	if (req.params.coin !== 'btc' && req.params.coin !== 'xrp') {
		res.status(500);
		res.end(`Not Supported coin: ${req.params.coin}, Allowed values: btc, xrp`);
	} else {
		let database = undefined;
		if (req.params.coin === 'btc') {
			database = btcPrice;
		}	else if (req.params.coin === 'xrp') {
			database = xrpPrice;
		}
		if (req.params.func === 'history') {
			database.find({}, function(err, doc) {
				if(!err && doc) res.end(JSON.stringify(doc));
				else console.log(err);
			});
		} else if (req.params.func.match('day')) {
			const day = Number(req.params.func.slice(0, -3));
			database.find({}, function(err, doc) {
				if(!err && doc) {
					const firstTime = doc[doc.length - 1].time - 60 * 60 * 24 * day;
					const nDayData = [];
					if (doc[0].time > firstTime) {
						const diffTime = String((new Date().getTime() - doc[0].time * 1000) / 
							(1000 * 3600 * 24));
						res.status(500);
						res.end(`Not enough Data received: required ${req.params.func}` +
						` but ${diffTime.substr(0,5)} day Data get.`);
					} else {
						doc.forEach(function(object)	{
							if (object.time >= firstTime) nDayData.push(object);
						});
						res.end(JSON.stringify(nDayData));
					}
				} else {
					console.log(err);
				}
			});
		} else {
			res.status(500);
			res.end(`Not Support function: ${req.params.func},` +
				`Allowed values: history, 'N'day`);
		}
	}
});

const getInfo = function(url, dataBase) {
	try {
		request.get(url, function(error, response, body) {
			const readDB = new dataBase();
			if (error) {
				console.log(`Request error: ${error}`);
			} else if (!body.match('doctype')) {
				const data = JSON.parse(body);
				if (data.result === 'error') {
					readDB.error = data.errorMsg;
					readDB.save(function(err) {
						if (err) console.log(err);
					});
				}
				if (data.result === 'success') {
					dataBase.find({}, function(err, doc) {
						if (!err) {
							readDB.time = data.timestamp;
							readDB.price = data.last;
							if (parseInt((doc.length + 1) % (60000 / INTERVAL)) === 0) {
								readDB.lastPrice = true;
							}
							readDB.save(function(err) {
								if (err) console.log(err);
							});
						} else {
							console.log(err);
						}
					});	
				}
			}	
		});
	} catch (error) {
		console.log(error);
	};
};
