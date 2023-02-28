import net from 'net';
import { WebSocket, WebSocketServer } from 'ws';

const TCP_PORT = parseInt(process.env.TCP_PORT || '12000', 10);

const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: 8080 });

//Temperate range, time and max number of incidents constants
const MAX_TEMP = 80;
const MIN_TEMP = 20;
const MAX_NUMBER_INCIDENTS = 3;
const INCIDENT_TIMEFRAME = 5000; //ms

//Initialise incident counter and time start
let IncidentNumber = 0;
let IncidentStartTime = 0;

tcpServer.on('connection', (socket) => {
    console.log('TCP client connected');
    
    socket.on('data', (msg) => {
        console.log(msg.toString());

        // HINT: what happens if the JSON in the received message is formatted incorrectly?
        // HINT: see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
        //Used try...catch to catch errors and log an error message to console
        try {
        let currJSON = JSON.parse(msg.toString());
        let currTemp = currJSON.battery_temperature; //getting battery temp from json
        let currTime = currJSON.timestamp; //getting timestamp from json  
        //If the current temperature is out of range, increase the incident counter   
        if(currTemp > MAX_TEMP || currTemp < MIN_TEMP) {
                IncidentNumber++;
                //If this is the first incident, set the start time
                if(IncidentNumber === 1) {
                    IncidentStartTime = currTime;
                }
                //If the number of incidents is equal to the max number of incidents, check if the time is within the timeframe
                if(IncidentNumber === MAX_NUMBER_INCIDENTS) {
                    if(currTime - IncidentStartTime < INCIDENT_TIMEFRAME) {
                        //If the number of incidents is equal to the max number of incidents and the time is within the timeframe, log current timestamp to a file named 'incidents.log'
                        let fs = require('fs');
                        fs.appendFile('incidents.log', currTime + '\n', function (Exceeded_temperature_range: any) {
                            if (Exceeded_temperature_range) throw Exceeded_temperature_range;
                            console.log('Exceeded temperature range, saved to incidents.log');
                        });
                    }
                    //Reset the incident counter and start time
                    IncidentNumber = 0;
                    IncidentStartTime = 0;
                }
            }

                    

        websocketServer.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(msg.toString());
            }
          });
        } catch(error) {
            console.error('Error parsing JSON message, unexpected token:', error);
        }
    });

    socket.on('end', () => {
        console.log('Closing connection with the TCP client');
    });
    
    socket.on('error', (err) => {
        console.log('TCP client error: ', err);
    });
});

websocketServer.on('listening', () => console.log('Websocket server started'));

websocketServer.on('connection', async (ws: WebSocket) => {
    console.log('Frontend websocket client connected to websocket server');
    ws.on('error', console.error);  
});

tcpServer.listen(TCP_PORT, () => {
    console.log(`TCP server listening on port ${TCP_PORT}`);
});


