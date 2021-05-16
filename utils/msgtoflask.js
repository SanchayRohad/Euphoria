const fetch = require("node-fetch");

function sendmsgtoflask(message) {
  return new Promise((resolve, reject) => {
    var data = JSON.stringify(message);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: data,
    };
    fetch("http://127.0.0.1:5000/depression", options).then(
      async (response) => {
        const data = await response.json();
        if (data == "1") {
          resolve(1);
        } else if (data == "0") {
          resolve(0);
        } else if (data == "-1") {
          resolve(-1);
        }
      }
    );
  });
}

module.exports = sendmsgtoflask;
