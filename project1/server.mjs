import fastify from "fastify";
import cors from "@fastify/cors";
import axios from "axios";
import { collectDefaultMetrics, register } from "prom-client";
import { logger } from "./logger.mjs";

collectDefaultMetrics();

const server = fastify();

server.register(cors, { origin: "*" });

server.get("/metrics", async (request, reply) => {
  try {
    reply.header("Content-Type", register.contentType);
    reply.send(await register.metrics());
  } catch (err) {
    reply.status(500).send(err);
  }
});

server.get("/ping", async (request, reply) => {
  logger.info("Received ping request");
  return "pong from 1";
});

server.get("/project2", async (request, reply) => {
  try {
    const response = await axios.get("http://127.0.0.1:8081/res");
    // throw new Error()
    logger.info("Project2 request successful", { response: response.data });
    reply.send(response.data);
  } catch (error) {
    logger.error("Project2 request failed", { error: error.message });
    throw error;
  }
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    logger.error("Server startup failed", { error: err.message });
    process.exit(1);
  }
  logger.info(`Server listening at ${address}`);
});
