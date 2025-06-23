import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { climateMetricSchema } from './ClimateMetric.schema';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { ILogger } from '../../services/Logger.service';
import { ConfigService } from '../../services/Config.service';
import { ClimateMetricService } from '../../modules/climateMetric/ClimateMetric.service';

export async function climateMetricRoutes(
    fastify: FastifyInstance,
    options: {
        logger: ILogger;
        climateMetricService: ClimateMetricService;
        configService: ConfigService;
    }
) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get<{
        Params: { city: string };
    }>('/api/climate-metrics/:city', {
        schema: climateMetricSchema,
        preHandler: authMiddleware,
        handler: async (request, reply) => {
            const { city } = request.params;
            const result = options.climateMetricService.getCandlesticks(city);

            return reply.status(200).send(result);
        },
    });
}
