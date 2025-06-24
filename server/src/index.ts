import { createServer } from './app/server';
import { PinoLogger } from './services/Logger.service';
import { ConfigService } from './services/Config.service';
import { ClimateMetricAggregatorService } from './modules/climateMetric/ClimateMetricAggregator.service';
import { ClimateMetricService } from './modules/climateMetric/ClimateMetric.service';

async function start() {
    const logger = new PinoLogger();
    try {
        const configService = ConfigService.initialize();
        const port = configService.get('PORT') || 3001;

        const climateMetricAggregatorService = new ClimateMetricAggregatorService(logger);
        const climateMetricService = new ClimateMetricService(logger, climateMetricAggregatorService);

        const server = await createServer({ logger, configService, climateMetricService });

        server.setErrorHandler((error, request, reply) => {
            if (reply.statusCode >= 500) {
                logger.error(`Request error: ${error.message}`, {
                    requestId: request.id,
                    url: request.url,
                    method: request.method,
                });
                reply.status(500).send({
                    error: 'Internal Server Error',
                    message: error.message,
                    statusCode: 500,
                });
            }
        });

        await server.listen({ port });
        logger.info(`Server is running on port ${port}`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
        logger.error(`Failed to start server ${errorMessage}`);
        process.exit(1);
    }
}

start();