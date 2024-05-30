const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-grpc");

const {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
} = require("@opentelemetry/resources");

const sdk = new opentelemetry.NodeSDK({
  serviceName: "project3", // change the name of service as per interest
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [
    getNodeAutoInstrumentations(), 
  ],
  resourceDetectors: [envDetector, hostDetector, osDetector, processDetector],
});

sdk.start();
