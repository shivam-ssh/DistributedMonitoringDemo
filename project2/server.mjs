import fastify from "fastify";
import cors from "@fastify/cors";
import axios from "axios";
import { logger } from "./logger.mjs";
import { collectDefaultMetrics, register } from 'prom-client';

collectDefaultMetrics();

const server = fastify();

await server.register(cors, {
  origin: "*",
});

server.get('/metrics', async (request, reply) => {
  try {
    reply.header('Content-Type', register.contentType);
    reply.send(await register.metrics());
  } catch (err) {
    reply.status(500).send(err);
  }
});

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.get("/res", async (request, reply) => {
  try {
    const response = await axios.get("http://127.0.0.1:8082/res"); // Inject span
    logger.info("received successfully! in project 2");
    reply.send(["responce from project 2", response.data]);
  } catch (error) {
    logger.error("something went wrong in projeect 2!!!");
    throw error;
  } finally {
  }
});

server.listen({ port: 8081 }, (err, address) => {
  if (err) {
    logger.error("Server startup failed", { error: err.message });
    process.exit(1);
  }
  logger.info(`Server listening at ${address}`);
});
