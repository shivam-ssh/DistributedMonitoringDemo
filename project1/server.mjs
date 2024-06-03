import fastify from "fastify";
import cors from "@fastify/cors";
import axios from "axios";
import { Counter, Histogram, collectDefaultMetrics, register } from "prom-client";
import { logger } from "./logger.mjs";

collectDefaultMetrics();

const server = fastify();

server.register(cors, { origin: "*" });

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
