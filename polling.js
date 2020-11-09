"use strict";

const ccxt = require('ccxt');
const fs = require('fs');
const symbol = 'BTC/EUR'

let kraken = new ccxt.kraken()

setInterval(async () => {

    let tmstmp_currentSys = new Date();
    let tmstmp_currentSysDate = tmstmp_currentSys.toJSON().slice(0, 10);

    Promise.all([kraken.fetchOrderBook(symbol), kraken.fetchTicker(symbol)])
        .then(values => {
            fs.appendFile('./logs/kraken_orderbook_' + tmstmp_currentSysDate + '.json', JSON.stringify(values) + '\n', (err) => {
                if (err) { console.log('error writing log files', err) }
            })
        })
        .catch(error => {
            console.error(error)
        });

}, 1000);