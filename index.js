import commandLineArgs from 'command-line-args';
import { BlueskyClient } from './src/BlueskyClient.js'
import { Server } from './src/Server.js';


const optionDefinitions = [
    { name: 'port', defaultOption: 7969, type: Number },
    { name: 'blueskyidentifier', alias: 'u', type: String },
    { name: 'blueskypass', alias: 'p', type: String }, 
    { name: 'usetitle', alias: 't', type: Boolean  }
]

const options = commandLineArgs(optionDefinitions)


const valid =
    options.blueskyidentifier && options.blueskypass;

if (!valid) {
    throw new Exception('Invalid args provided - include --blueskyidentifier x --blueskypass y');
}

const defaultport = 7969

let port = options.port;
if (!port) {
    port = defaultport;
}

const blueskyClient = new BlueskyClient(options.blueskyidentifier, options.blueskypass);
const server = new Server(blueskyClient, !!options.usetitle);

server.start(port)