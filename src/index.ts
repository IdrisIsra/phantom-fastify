import Fastify, { FastifyInstance, FastifyRequest } from "fastify";
import ws, { SocketStream } from "@fastify/websocket";

const fastify: FastifyInstance = Fastify({});

function handle(conn: SocketStream, req: FastifyRequest) {
  conn.pipe(conn); // creates an echo server
}

fastify.register(require("@fastify/websocket"), {
  handle,
  options: { maxPayload: 1048576 },
});

fastify.register(async function () {
  fastify.route({
    method: "GET",
    url: "/hello",
    handler: (req, reply) => {
      // this will handle http requests
      reply.send({ hello: "world" });
    },
    wsHandler: (conn, req) => {
      // this will handle websockets connections
      conn.setEncoding("utf8");
      conn.write("hello client");

      conn.on("foo", () => console.log("received foo!"));

      conn.on("data", (message) => {
        console.log("received: " + message.toString());
        conn.socket.send(
          "hi from server, this was your message: " + message.toString()
        );
      });
    },
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });

    const address = fastify.server.address();
    const port = typeof address === "string" ? address : address?.port;
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
