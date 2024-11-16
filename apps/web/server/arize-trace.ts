import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PhoenixSDK } from '@arizeai/phoenix-otel';

const PHOENIX_API_KEY = 'YOUR_PHOENIX_API_KEY';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'your-service-name',
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'https://app.phoenix.arize.com/v1/traces',
    headers: {
      'api_key': PHOENIX_API_KEY,
    },
  }),
});

sdk.start();

// Register Phoenix SDK
PhoenixSDK.register();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});