import { trace, context } from "@opentelemetry/api";
import {
    createLogger,
    format as _format,
    transports as _transports,
  } from "winston";

// Custom format to include trace ID and span ID in logs
const traceIdFormat = _format((info) => {
    const span = trace.getSpan(context.active());
    if (span) {
      info.traceId = span.spanContext().traceId;
      info.spanId = span.spanContext().spanId;
      // Add log event to the span
      span.addEvent("log", {
        level: info.level,
        message: info.message,
        traceId: info.traceId,
        spanId: info.spanId,
      });
    }
    return info;
  })();
  
export const logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: _format.combine(
      traceIdFormat, // Apply custom format
      _format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      _format.json()
    ),
    transports: [
      new _transports.Console({
        format: _format.combine(
          _format.colorize(),
          _format.simple()
        ),
      }),
    ],
  });

