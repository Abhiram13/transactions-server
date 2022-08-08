// import {Worker, isMainThread, workerData, parentPort, threadId, MessageChannel, MessagePort} from 'worker_threads';
const {workerData, parentPort} = require("worker_threads");

function loop(t) {
   const x = 1000000000;
   for (var i = 0; i < x; i++) {}
   return `${t} million finished`;
}

parentPort.once('message', (value) => {
   if (workerData === "one") {
      value.dasdassdasd.postMessage(loop("10"));
      value.dasdassdasd.close();
   } else if (workerData === "three") {
      value.threed.postMessage(loop("30"));
      value.threed.close();
   } else {
      value.seconded.postMessage(loop("20"));
      value.seconded.close();
   }
});