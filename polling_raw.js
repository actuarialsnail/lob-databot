"use strict";

const ccxt = require('ccxt');
const fs = require('fs');
const symbol = "ETH/BTC"
let binance = new ccxt.binance();
let count = 0;

setInterval(async () => {

    let tmstmp_currentSys = new Date();
    let tmstmp_currentSysDate = tmstmp_currentSys.toJSON().slice(0, 10);
    let tmstmp = Date.now();

    Promise.all([binance.fetchOrderBook(symbol, 500), binance.fetchTicker(symbol)])
        .then(values => {
            fs.appendFile('./logs/binance_orderbook_' + tmstmp_currentSysDate + '.json', JSON.stringify(values) + '\n', (err) => {
                if (err) { console.log('error writing log files', err) }
            })
            // log the processed file
            const dataset = flatten_dataset(values, tmstmp).join(',');
            fs.appendFile('./logs/binance_dataset_' + tmstmp_currentSysDate + '.csv', dataset + '\n', (err) => {
                if (err) { console.log('error writing log files', err) }
            })
        })
        .catch(error => {
            console.error(error)
        });
    count++;
}, 1000);

const flatten_dataset = (data, _tmstmp) => {
    
    // console.time("process");

    const bids = arr_sort(data[0].bids, false);
    const flattened_bids = bids.reduce(
        (accumulator, currentValue) => accumulator.concat(currentValue),
        []
    )
    const asks = arr_sort(data[0].asks, true);
    const flattened_asks = asks.reduce(
        (accumulator, currentValue) => accumulator.concat(currentValue),
        []
    )
    const time = data[1].timestamp;
    const price = data[1].last;

    // if (last_bid / mid_price > level_increment * level_max ||)
    if (count % (60 * 5) === 0) {
        const mid_price = (bids[0][0] + asks[0][0]) / 2;
        const last_bid = bids.slice(-1)[0][0];
        const last_ask = asks.slice(-1)[0][0];
        console.log('bid range', (last_bid / mid_price - 1).toFixed(3) * 100, '% ask range', (last_ask / mid_price - 1).toFixed(3) * 100, '%');
    }

    const dataset = [time, price, _tmstmp, ...flattened_bids, ...flattened_asks];

    // console.timeEnd("process");

    return dataset;
}

const arr_sort = (arr, ascend) => {
    return arr.sort((a, b) => {
        return ascend ? a[0] - b[0] : b[0] - a[0];
    })
}