const { ipcRenderer } = require('electron')
const floor = Math.floor,R = Math.random;
const random = (channel) => channel + floor(R() * R() * R() * R() * 10000);
const fetcher = function(channel, ...senderData) {
    return new Promise((resolve, reject) => {
        let backChanel = random(channel);
        ipcRenderer.send(channel, {
            backChanel,
            senderData
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
        let backChanel = random('electron-socket-init')
        var event = {
            channel,
            backChanel 
        };
        ipcRenderer.send('electron-socket-init',  event);
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