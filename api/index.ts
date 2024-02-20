import http from "http";
import app from "./app";

const port: number = parseInt(process.env.PORT!, 10) || 3000;

const server: http.Server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
