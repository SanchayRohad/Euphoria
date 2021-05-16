const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const userMongo = require("./models/user.js");
const flask = require("./utils/msgtoflask");
const sendmsgtoflask = require("./utils/msgtoflask");
const creds = require("./creds");
const auth = creds();
//Connecting to MongoDB
mongoose.connect(auth, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "CareTaker";

// Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    //Adding the user to the DataBase
    const newUser = new userMongo({
      _id: mongoose.Types.ObjectId(),
      sid: user.id,
      name: username,
      score: 0,
    });
    newUser
      .save()
      .then((result) => {
        console.log("User Added!");
      })
      .catch((err) => {
        console.log(err);
      });
    //User joins the room
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to Euphoria!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));

    //Send the message to flask
    msgwords = msg.split(" ");
    if (msgwords.length > 2) {
      sendmsgtoflask(msg)
        .then((score) => {
          if (score < 0) {
            userMongo
              .find({ sid: user.id })
              .then((curr_user) => {
                var userScore = curr_user[0].score;
                userScore = score + userScore;
                userMongo
                  .updateOne({ sid: user.id }, { $set: { score: userScore } })
                  .then((result) => {
                    console.log(
                      `Updated Score of ${user.username} with id ${user.id} to ${userScore}`
                    );
                    if (userScore === -8) {
                      io.to(user.id).emit(
                        "message",
                        formatMessage(
                          botName,
                          "(This message can only be seen by you)\nHey There!\n You are emanating an aura we're not sure is very healthy for you and your mental health :( \n Please take better care of yourself, love yourself, be kinder to yourself,\n and see the magic happen ! We wish you best of luck and lots of love !\nDon't worry, there's always light at the end of the dark tunnel, and if you need a hand in finding that light, you can reach out to these guys over at iCall.\niCall is an email and telephone-based counselling service run by Tata Institute of Social Sciences \n and they offer free services with the help of a team of qualified and trained mental health professionals.\nThey are available Monday to Saturday between 8 am and 10 pm \n Helpline Number: +91 22 2552111 and +91 91529 87821"
                        )
                      );
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              })
              .catch((err) => {
                console.log(err);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      userMongo
        .deleteOne({ name: user.username })
        .then((result) => {
          console.log(`Deleted ${user.username} from the database`);
        })
        .catch((err) => {
          console.log(err);
        });

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
