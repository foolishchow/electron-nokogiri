const { ipcRenderer } = require('electron')
const random = (channel) => channel + Math.random().toString(16).toString(2);
const fetcher = function(channel, ...senderData) {
    return new Promise((resolve, reject) => {
        let backChanel = random(channel);
        ipcRenderer.send('electron-nokogiri-fetcher', {
            backChanel,
            senderData,
            channel
        });
        ipcRenderer.once(backChanel, function(event, { backArgv }) {
            resolve(...backArgv);
        });
    });
}

class socket {
    constructor(channel) {
        this.events = {
            message:[],
            error:[],
            close:[]
        };
        this.channel = channel;
        let backChanel = random('electron-nokogiri-socket-init')
        var event = {
            channel,
            backChanel 
        };
        ipcRenderer.send('electron-nokogiri-socket-init',  event);
        ipcRenderer.once(backChanel, (event, msg) => {
            if (this.onopen) {
                this.onopen();
                this.listen();
            }
        });
    }

    listen(){
        ipcRenderer.on(this.channel, (event, {type,msg}) => {
            this.emit(type,{ data: msg })
        });
    }

    send(data) {
        var event = { type:'message',msg:data};
        ipcRenderer.send(this.channel,  event );
    }

    emit(event,data){
        this.events[event].forEach(EV=>EV(data))
    }

    close(data) {
        ipcRenderer.send(this.channel,  {type:'close',msg:data} );
        this.emit('close',data);
    }

    addEventListener(name,cb){
        this.events[name].push(cb);
    }

    removeEventListener(name,cb){
        if(this.events[name] && this.events[name].indexOf(cb) > -1){
            let index = this.events[name].indexOf(cb);
            this.events[name].splice(index,1);
        }
    }
}
module.exports = {
    fetcher,
    webSocket: function(channel) {
        return new socket(channel);
    }
};