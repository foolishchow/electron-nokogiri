const { EventEmitter } = require('events');
const { app, ipcMain } = require('electron');
const UrlPattern = require('./pattern')
const SOCKETS = [];
const FETCHER = [];

class socket extends EventEmitter {
    constructor(channel, event, backChanel) {
        super();
        this.channel = channel;
        this.Event = event;
        this.backChanel = backChanel;
        // this.Event.sender.send(this.backChanel);

        ipcMain.on(channel, (event, { type, msg }) => {
            this.Event = event;
            this.emit(type, msg);
        });

    }

    send(msg) {
        this.Event.sender.send(this.channel, { type: 'message', msg });
    }
}

const use = (name, cb) => {
    FETCHER.push({
        url: new UrlPattern(name),
        cb
    })
};
const sockets = (name, cb) => {
    SOCKETS.push({
        url: new UrlPattern(name),
        cb: cb
    })
};
app.on('ready', () => {
    ipcMain.on('electron-nokogiri-socket-init', (event, { backChanel, channel }) => {
        let has = false;
        SOCKETS.forEach((s) => {
            let match = s.url.match(channel);
            if (match != null && match != {}) {
                has = true;
                event.sender.send(backChanel, { type: 'open', msg: '' });
                let $s = new socket(channel, event, backChanel);
                s.cb({ socket: $s, params: match })
            }
        })
        if (!has) event.sender.send(backChanel, { type: 'error', msg: 'no websocket found!' });
    });

    ipcMain.on('electron-nokogiri-fetcher', (event, { backChanel, senderData, channel }) => {
        FETCHER.forEach((s) => {
            let match = s.url.match(channel);
            if (match != null && match != {}) {
                s.cb(function(...backArgv) {
                    event.sender.send(backChanel, { backArgv })
                }, ...senderData, match, event);
            }
        })
    });
});

module.exports = {
    use,
    sockets
}