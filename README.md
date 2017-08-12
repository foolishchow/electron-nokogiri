# electron-nokogiri

- in main 

```javascript
const {main} = require("electron-nokogiri");

message.use('terminals', (next, params, event) => {
    // params => your params
    // event  => hook of  ipcMain event
    // next  callback 
    //after done your things 
    next(result)
});
    
message.sockets('terminals/:pid',({socket,params}) => {
    
    socket.send('hello electron');

    socket.on('message', function(msg) {
       
    });

    socket.on('close', function() {
        
    });
})
```

- in render
```javascript
const {web} = require("electron-nokogiri");

web.fetcher('terminals',params).then((data)=>{
    console.info(data)
});


socket = new webSocket('terminals/11111');
socket.on('open',(data)=>{
    
})
//...
```