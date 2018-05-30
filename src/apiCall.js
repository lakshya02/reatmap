import axios from 'axios';
import protobuf from 'protobufjs';

let getUpdate = ()=>{
    return axios({
        method:'get',
        url:'http://localhost:3000/fetchupdate',
        headers: {'Content-Type': 'application/octet-stream'}
    }).then(payload=>{
      protobuf.load("./test.proto", function(err, root) {
          payload = atob(payload.data);
          var FeedMessage = root.lookupType("test_realtime.FeedMessage");
          // var errMsg = FeedMessage.verify(payload);
          // if (errMsg)
          //   throw Error(errMsg);
          console.log(FeedMessage.decode(payload).toJSON())
      })

        // protobuf.load("./test.proto", function(err, root) {
        //     if (err)
        //       throw err;
        //     //   var FeedMessage = root.lookupType("test_realtime.FeedMessage");
        //     //   var errMsg = FeedMessage.verify(payload);
        //     //   if (errMsg)
        //     //     throw Error(errMsg);
        //     //   console.log(FeedMessage.decode(payload).toJSON())
        //     })  
        })

      }
export default getUpdate;