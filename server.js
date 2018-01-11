const qs = require("querystring");
const http = require("http");

const TOKEN = ""; //Personal API key to etherscan. Make here: https://etherscan.io/apis

const ADDRESS = "0x09BDC20d955850BC5F221c47057d603348A62b63"; //Address of COR token
const CREATE_COR = "0x0f3a00d58495487177470d25a329a604f9d54654ce0fe7ea1bf5bb808954abca"; //Hash of event signature, which is topic[0] Ex. keccak256(Transfer(address,address,uint256))
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

var lastBlock = 0;
var httpOptions = {
  host: "api.etherscan.io",
  port: "80",
  //path: "/api/?(parameters)",
  method: "GET"
};

var apiOptions = {
  module: "logs",
  action: "getLogs",
  fromBlock: lastBlock,
  toBlock: "latest",
  address: ADDRESS,
  apikey: TOKEN
}

function parseAddress(addr){
  return "0x" + addr.slice(-40)
}

function parseEvents(events){
  //console.log(events);
  if (events){
    for (let e of events){
      let topics = e.topics; //topics[1] and onward are indexed parameters to event in order. If indexed parameter is array (including string, bytes), kkccak-256 stored instead. All topics are 32 bytes (256 bits), regardless of actual parameter size.
      let data = e.data; //Non-indexed items in event (combined together)
      let eventType = topics[0]; //Hash of event signature, unless event is anonomyous.
      let from, to;
      switch (eventType){
        case CREATE_COR:
          let valueCreated = parseInt(data); //Amount of COR created
          from = parseAddress(topics[1]);
          console.log("COR created.");
          console.log("From: " + from);
          console.log("Value: " + valueCreated/(Math.pow(10,18)));
          console.log();
          break;

        case TRANSFER:
          let amount = parseInt(data); //Amount of COR transferred
          from = parseAddress(topics[1]); //Account that transferred COR
          to = parseAddress(topics[2]); //Account that recieved COR
          console.log("COR transferred.");
          console.log("Amount: " + amount/(Math.pow(10,18)));
          console.log("From: " + from);
          console.log("To: " + to);
          console.log();
          break;

        default:
          console.log("Unrecognized event processed.");
          console.log();
      }
      let height = parseInt(e.blockNumber);
      lastBlock = Math.max(height+1, lastBlock);
    }
  }
}

function updateEvents(){
  apiOptions.fromBlock = lastBlock;
  let path = "/api?"+qs.stringify(apiOptions);
  httpOptions.path = path;
  let req = http.request(httpOptions, function(response){
    //console.log("STATUS: " + response.statusCode);
    if (response.statusCode === 200){
      response.setEncoding('utf8');
      let raw = '';
      //console.log("Reading data");
      response.on("data", function(data){
        raw += data;
        //console.log(data);
      });
      response.on("end", function(){
        //console.log("Reading complete. Parsing data");
        try{
          const data = JSON.parse(raw);
          parseEvents(data.result);
        } catch (e){
          console.error(e.message);
        }
      });
      response.on("error", function(error){
        console.error(error.message);
      });
    } else{
      console.log("Unexpected status code: " + response.statusCode);
    }
  });
  req.end();
}

setInterval(updateEvents, 5000); //Asks for update from etherscan. Note: if there are more than 1000 responses, it will only show the first 1000
