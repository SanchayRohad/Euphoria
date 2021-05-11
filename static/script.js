const button = document.getElementById("btn");
button.addEventListener("click", async (event) => {
  var message = document.getElementById("inputText").value;
  var data = JSON.stringify(message);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: data,
  };
  console.log("Sending a request!");
  fetch("http://127.0.0.1:5000/depression", options).then(async (response) => {
    const data = await response.json();
    console.log(data);
    if (data == "1") {
      document.getElementById("printer").innerHTML = "Happy!";
    } else if (data == "0") {
      document.getElementById("printer").innerHTML = "Neutral";
    } else if (data == "-1") {
      document.getElementById("printer").innerHTML = "Depressed :(";
    }
  });
});
