const express = require('express');
const cors = require('cors');
var path = require('path');
const WebSocket = require('ws');
const app = express();
var http = require('http').createServer(app);
const wss = new WebSocket.Server({ server: http });
const SWITCH = require('./models/switch');
const SwitchBoard = require('./models/switchboard');

/**---------------------------------------------------------------------------
 *  Setting up website
 * ---------------------------------------------------------------------------
 */
app.use('/static', express.static(path.join(__dirname, 'client', 'build', 'static')));
app.use('/src', express.static(path.join(__dirname, 'client', 'build', 'src')));

app.use(express.json({ extended: false }));
app.use(cors());
const PORT = process.env.PORT || 80;



/**---------------------------------------------------------------------------
 *  Front End Router
 * ---------------------------------------------------------------------------
 */
const reactFrontEnd = (req, res) => {
    var options = {
        root: path.join(__dirname, "client", "build"),
    };
    res.sendFile("index.html", options);
}
app.get('/', reactFrontEnd);
app.get('/:ignore', reactFrontEnd);



/**---------------------------------------------------------------------------
 *  Adding Router
 * ---------------------------------------------------------------------------
 */
app.use('/api/user', require('./router/user'));
app.use('/api/switch-board', require('./router/switchBoard'));
app.use('/api/switch', require('./router/switch'));
app.use('/api/ota', require('./router/ota'));
app.get('/api/socket', (req, res) => {
    var options = {
        root: path.join(__dirname, "public"),
    };
    res.sendFile("index.html", options);
});

app.get('api/test', async (req, res) => {
    // [{"id":1,"value":1,"switch_id":0,"user_id":1},
    // {"id":2,"value":0,"switch_id":1,"user_id":1},
    // {"id":4,"value":0,"switch_id":2,"user_id":1}]

    let token = "abc";

    SwitchBoard.hasMany(SWITCH, {
        foreignKey: 'switch_board_id'
    });

    const switchBoard = await SwitchBoard.findOne({
        where: {
            user_id: 1,
            token: token
        },
        include: SWITCH
    });


    let initialdata = switchBoard.Switches.map((d, i) => {
        return { "id": d.id, "value": d.value, "switch_id": i, "user_id": d.user_id };
    });


    res.json(initialdata);


});

/**---------------------------------------------------------------------------
 *  Hadling 404 page
 * ---------------------------------------------------------------------------
 */
// app.use('', (req, res) => res.send('Ooops 404'));



/**---------------------------------------------------------------------------
 *  Socket connection for live connection 
 * ---------------------------------------------------------------------------
 */
var webSockets = [];


function noop() {}

function heartbeat() {
  this.isAlive = true;
  console.log('got pong from device');
  
}

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

wss.on('close', function close() {
  clearInterval(interval);
});


wss.on('connection', async function connection(ws, req) {

    ws.isAlive = true;
    ws.on('pong', heartbeat);

    ws.on('ping', function() {
        console.log("sending pong to device");
        ws.pong();
    });

    // setInterval(() => ws.ping(), 2000 );

    createClientDeviceSocketConnection(ws, req);

    var params = new URL("http://test" + req.url).searchParams;
    var clientFrom = params.get('from');
    var token = params.get('token');

    if (clientFrom == 'device') {

        SwitchBoard.hasMany(SWITCH, {
            foreignKey: 'switch_board_id'
        });

        const switchBoard = await SwitchBoard.findOne({
            where: {
                user_id: 1,
                token: token
            },
            include: SWITCH
        });

        try{
            let initialdata = switchBoard.Switches.map((d, i) => {
                return { "id": d.id, "value": d.value, "switch_id": i, "user_id": d.user_id, "naaz": "test" };
            });
     
            // res.json();
            return ws.send(JSON.stringify(initialdata));
        } catch(err){
            console.log("err online 154");
        }
    }
    ws.send(`connected to server`);
});

function old_createClientDeviceSocketConnection(ws, req) {

    //Build URL
    var params = new URL("http://test" + req.url).searchParams;
    var clientFrom = params.get('from');
    var token = params.get('token');
    var clientTo = (clientFrom == "device") ? "client" : "device";

    // jwt decode and get board id 
    var uid = token; // Decoded token

    webSockets[clientFrom + uid] = ws;

    webSockets[clientFrom + uid].on("message", function message(msg) {
        if (webSockets[clientTo + uid] !== undefined)
            webSockets[clientTo + uid].send(msg);
    });
}

function createClientDeviceSocketConnection(ws, req) {

    //Build URL
    var params = new URL("http://test" + req.url).searchParams;
    var clientFrom = params.get('from');
    var token = params.get('token');
    var clientTo = (clientFrom == "device") ? "client" : "device";

    // jwt decode and get board id 
    var uid = token; // Decoded token

    webSockets[uid] = { ...webSockets[uid], [clientFrom]: ws };
    oneToManyConnectio(uid);
}


function oneToManyConnectio(uid) {

    var device = null;
    var clients = [];
    for (x in webSockets[uid]) {
        // console.log(webSockets[uid][x]);
        if (x == "device") {
            device = webSockets[uid][x];
        } else {
            clients.push(webSockets[uid][x]);
        }
    }

    if (clients.length > 0 && device != null) {

        for (client in clients) {
            var clnt = clients[client];

            device.on("message", async function message(msg) {
                // if (webSockets[clientTo + uid] !== undefined)
                clnt.send(msg);

                try {
                    let msgnew = JSON.parse(msg);
                    await SWITCH.update({ value: msgnew.value }, {
                        where: {
                            id: msgnew.id
                        }
                    });
                } catch (err) {
                    console.warn("Json error");
                }

            });

            clnt.on("message", async function message(msg) {
                // if (webSockets[clientTo + uid] !== undefined)

                device.send(msg);

                let msgnew = JSON.parse(msg);
                for (x in msgnew) {
                    await SWITCH.update({ value: msgnew[x].value }, {
                        where: {
                            id: msgnew[x].id
                        }
                    });
                }
            });

        }

    }


}



/**---------------------------------------------------------------------------
 *  Serving the site 
 * ---------------------------------------------------------------------------
 */
http.listen(PORT, (err) => {
    console.log(`Server is listining on port ${PORT}..`);
});