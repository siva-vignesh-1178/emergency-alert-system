require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");

const {
  Server
} = require("socket.io");


const {
  connectDatabase
} = require("./config/database");


const authRoutes =
  require("./routes/authRoutes");

const alertRoutes =
  require("./routes/alertRoutes");

const responderRoutes =
  require("./routes/responderRoutes");


const app = express();

const server =
  http.createServer(app);


const io =
  new Server(server, {

    cors: {

      origin:
        process.env.FRONTEND_URL || "*",

      methods: [
        "GET",
        "POST",
        "PATCH"
      ]

    }

  });


app.set("io", io);


app.use(
  helmet()
);


app.use(
  cors({
    origin:
      process.env.FRONTEND_URL || "*"
  })
);


app.use(
  express.json()
);


app.use(
  express.urlencoded({
    extended: true
  })
);


// Health check
app.get(
  "/api/health",
  (req, res) => {

    res.json({

      success: true,

      message:
        "SRM Campus Safety API is running",

      timestamp:
        new Date().toISOString()

    });

  }
);


// Routes
app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/alerts",
  alertRoutes
);


app.use(
  "/api/responders",
  responderRoutes
);


// 404
app.use(
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        "API route not found"

    });

  }
);


// Socket.io
io.on(
  "connection",
  (socket) => {

    console.log(
      `🔌 Client connected: ${socket.id}`
    );


    socket.on(
      "join-dashboard",
      () => {

        socket.join(
          "responders"
        );

        console.log(
          "📡 Responder joined dashboard"
        );

      }
    );


    socket.on(
      "disconnect",
      () => {

        console.log(
          `🔌 Client disconnected: ${socket.id}`
        );

      }
    );

  }
);


const PORT =
  process.env.PORT || 5000;


async function startServer() {

  await connectDatabase();


  server.listen(
    PORT,
    () => {

      console.log("");
      console.log(
        "🚨 SRM Campus Safety Backend"
      );

      console.log(
        `🚀 Server: http://localhost:${PORT}`
      );

      console.log(
        `❤️ Health: http://localhost:${PORT}/api/health`
      );

      console.log(
        `🔐 Auth: http://localhost:${PORT}/api/auth`
      );

      console.log(
        `🚨 Alerts: http://localhost:${PORT}/api/alerts`
      );

      console.log(
        `👮 Responders: http://localhost:${PORT}/api/responders`
      );

    }
  );

}


startServer();