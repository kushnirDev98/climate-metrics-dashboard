import { createServer } from './app/server';
import { PinoLogger } from './services/Logger.service';
import { ConfigService } from './services/Config.service';
import { ClimateMetricAggregatorService } from './modules/climateMetric/ClimateMetricAggregator.service';
import { ClimateMetricService } from './modules/climateMetric/ClimateMetric.service';

async function start() {
    const configService = ConfigService.initialize();
    const logger = new PinoLogger();
    const aggregator = new ClimateMetricAggregatorService(logger);
    const climateMetricService = new ClimateMetricService(logger, aggregator);

    const server = await createServer({ logger, configService, climateMetricService });

    const port = configService.get('PORT') || 3333;
    await server.listen({ port });
    logger.info(`Server is running on port ${port}`);
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
