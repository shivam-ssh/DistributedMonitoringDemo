import fastify from "fastify";
import cors from "@fastify/cors";
import axios from "axios";
import { logger } from "./logger.mjs";
import { register, collectDefaultMetrics, Counter, Histogram } from "prom-client";

collectDefaultMetrics();

const server = fastify();

await server.register(cors, {
  origin: "*",
});

// Create a custom counter metric
const customCounter = new Counter({
  name: "custom_counter",
  help: "This is a custom counter",
  labelNames: ["method", "route", "status_code"],
});

// Create a custom histogram metric
const customHistogram = new Histogram({
  name: "custom_histogram",
  help: "This is a custom histogram",
  labelNames: ["method", "route", "status_code"],
});

// Middleware to collect custom metrics
server.addHook("onResponse", (request, reply, done) => {
  const route = request.routerPath || "unknown_route";
  const statusCode = reply.statusCode;

  customCounter.labels(request.method, route, statusCode).inc();
  customHistogram
    .labels(request.method, route, statusCode)
    .observe(reply.elapsedTime / 1000);
  done();
});

server.register((instance, opts, done) => {
  instance.addHook("onSend", (request, reply, payload, done) => {
    reply.header("X-Response-Time", `${reply.elapsedTime}ms`);
    done();
  });
  done();
});

server.get("/metrics", async (request, reply) => {
  try {
    reply.header("Content-Type", register.contentType);
    reply.send(await register.metrics());
  } catch (err) {
    reply.status(500).send(err);
  }
});

server.get("/ping", async (request, reply) => {
  logger.info("done for the project 3");
  return "pong\n";
});

server.get("/res", async (request, reply) => {
  try {
    const response = await axios.get("http://127.0.0.1:8080/ping");
    logger.info("done for the project 3");
    reply.send(["response from project 3", response.data]);
  } catch (error) {
    logger.error("something went wrong in project 3 " + error);
    throw error;
  } finally {
  }
});

server.listen({ port: 8082 }, (err, address) => {
  if (err) {
    logger.error("Server startup failed", { error: err.message });
    process.exit(1);
  }
  logger.info(`Server listening at ${address}`);
});
