import axios from 'axios';
import protobuf from 'protobufjs';

let getUpdate = () => {
  return axios({
    method: 'get',
    url: 'http://localhost:3000/fetchupdate',
    headers: { 'Content-Type': 'application/octet-stream' }
  }).then(payload => {

    var root = new protobuf.Root();

    root.load("./test.proto", { keepCase: true }, function (err, root) {
      var FeedMessage = root.lookupType("test_realtime.FeedMessage");
      let buffer = payload.data.body.data
      var demessage = FeedMessage.decode(buffer);
      var json = demessage.toJSON();
      console.log(JSON.stringify(json));

    })
  })

}
export default getUpdate;