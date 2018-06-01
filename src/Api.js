import axios from 'axios';
import protobuf from 'protobufjs';
var root = new protobuf.Root();

const baseUrl = 'https://okjifie32e.execute-api.us-east-1.amazonaws.com/V1/ebs'
const headers = {
  'Content-Type': 'application/octet-stream',
  'x-api-key': 'wJY5fxOYY1rjs98RigsP8SVL3vKzbHG8pqWPf8T4'
}

export function getVehicleUpdate() {
  return axios({
    method: 'get',
    url: baseUrl + '/fetchupdate',
    headers: headers
  }).then(async (payload) => {
    let decodedJson = await decodeBuffer(root, payload)
    return decodedJson
  }).catch(err => {
    console.log(err)
  })
}

export function getVehiclePosition() {
  return axios({
    method: 'get',
    url: baseUrl + '/fetchposition',
    headers: headers
  }).then(async (payload) => {
    let decodedJson = await decodeBuffer(root, payload)
    return decodedJson
  }).catch(err => {
    console.log(err)
  })
}

let decodeBuffer = (root, payload) => {
  let promise = new Promise((resolve, reject) => {
    root.load("./test.proto", { keepCase: true }, function (err, root) {
      if (err)
        reject(err)
      var FeedMessage = root.lookupType("test_realtime.FeedMessage");
      let buffer = payload.data.body.data
      var demessage = FeedMessage.decode(buffer);
      var json = demessage.toJSON();
      console.log(JSON.stringify(json));
      resolve(json)
    })
  })
  return promise
}