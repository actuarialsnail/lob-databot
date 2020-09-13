const fs = require('fs');
const CoinbasePro = require('coinbase-pro');
const product_list = ['BTC-GBP', 'ETH-GBP'];

const websocket = new CoinbasePro.WebsocketClient(product_list, 'wss://ws-feed.pro.coinbase.com', null, { channels: ['ticker', 'level2'] });
let tmstmp;
let heartbeat_timeout;

websocket.on('open', (data) => {
    tmstmp = Date.now();
    console.log(data);
    console.log(`coinbase websocket connected at ${tmstmp}`)
})

websocket.on('message', data => {
    /* work with data */
    // console.log(data);
    if (data.type === 'heartbeat') {
        // clears old timeout
        clearTimeout(heartbeat_timeout);
        // sets new timeout
        heartbeat_timeout = setTimeout(() => {
            console.log('ERROR', 'Websocket error', 'No heartbeat for 10s... reconnecting');
            try { websocket.disconnect() } catch (err) { };
            websocket.connect();
        }, 10 * 1000);
    }

    if (data.type === 'subscriptions') {
        console.log('subscriptions:', data);
    }

    if (data.type === 'snapshot') {

    }

    if (data.type === 'l2update' || data.type === 'ticker' || data.type === 'snapshot') {
        fs.appendFile('./logs/orderbooks/' + [data.product_id, data.type, tmstmp].join('_') + '.json', JSON.stringify(data) + '\n', (err) => {
            if (err) { console.log('error writing log files', err) }
        })
    }
});
websocket.on('error', err => {
    /* handle error */
});
websocket.on('close', () => {
    console.log('ERROR', 'Websocket Error', `websocket closed. Attempting to re-connect.`);

    // try to re-connect the first time...
    setTimeout(() => {
        websocket.connect();
    }, 3000)
    // let count = 1;
    // // attempt to re-connect every 30 seconds.
    // // TODO: maybe use an exponential backoff instead
    // const interval = setInterval(() => {
    //     if (!websocket.socket) {
    //         count++;

    //         // send me a email if it keeps failing every 30/2 = 15 minutes
    //         if (count % 30 === 0) {
    //             const time_since = 30 * count;
    //             console.log('CRIT', 'Websocket Error', `Attempting to re-connect for ${count} times. It has been ${time_since} seconds since we lost connection.`);
    //         }
    //         websocket.connect();
    //     }
    //     else {
    //         clearInterval(interval);
    //     }
    // }, 30000);
});
