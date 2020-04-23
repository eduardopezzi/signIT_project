const IPFSClient = require("ipfs-api");
const ipfs = IPFSClient({
    host: "ipfs.infura.io",
    port: "5001",
    protocol: "https"
});
//run with local daemon
// const ipfsApi = require(‘ipfs-api’);
// const ipfs = new ipfsApi(‘localhost’, ‘5001’, {protocol:‘http’});
export default ipfs;