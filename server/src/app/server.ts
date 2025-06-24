import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import rateLimit from '@fastify/rate-limit';
import { climateMetricRoutes } from '../api/climate-metric/ClimateMetric.route';
import { openMeteoPlugin } from '../plugins/open-meteo/OpenMeteo.plugin';
import { ILogger } from '../services/Logger.service';
import { ConfigService } from '../services/Config.service';
import { ClimateMetricService } from '../modules/climateMetric/ClimateMetric.service';

export async function createServer(deps: {
    logger: ILogger;
    configService: ConfigService;
    climateMetricService: ClimateMetricService;
}) {
    const fastify = Fastify();

    const { logger, configService, climateMetricService } = deps;

    await fastify.register(cors, { origin: configService.get('CORS_ORIGIN'), methods: ['GET'], allowedHeaders: ['Authorization', 'Content-Type'] });
    await fastify.register(swagger, {
        openapi: { info: { title: 'Climate Metrics API', version: '1.0.0' } },
    });
    await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' });

    await fastify.register(climateMetricRoutes, { logger, climateMetricService, configService });
    await fastify.register(openMeteoPlugin, { logger, configService, climateMetricService });

    return fastify;
}
