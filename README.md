# electron-nokogiri

- in main 

```javascript
const nokogiri = require("electron-nokogiri");

nokogiri.use('terminals', (next, params, event) => {
    // params => your params
    // event  => hook of  ipcMain event
    // next  callback 
    //after done your things 
    next(result)
});
    
nokogiri.sockets('terminals/:pid',({socket,params}) => {
    
    socket.send('hello electron');

    socket.on('message', function(msg) {
       
    });

    socket.on('close', function() {
        
    });
})
```

- in render
```javascript
const {fetcher,webSocket} = require("electron-nokogiri/lib/web");

fetcher('terminals',params).then((data)=>{
    console.info(data)
});


socket = new webSocket('terminals/11111');
socket.on('open',(data)=>{
    
})
//...
```