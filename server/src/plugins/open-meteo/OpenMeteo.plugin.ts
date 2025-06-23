import fp from 'fastify-plugin';
import { ILogger } from '../../services/Logger.service';
import { ClimateMetricService } from '../../modules/climateMetric/ClimateMetric.service';
import { OpenMeteoGateway } from '../../gateways/open-meteo/OpenMeteo.gateway';
import { ConfigService } from '../../services/Config.service';

export interface OpenMeteoPluginOptions {
    logger: ILogger;
    configService: ConfigService;
    climateMetricService: ClimateMetricService;
}

export const openMeteoPlugin = fp(async (fastify, opts: OpenMeteoPluginOptions) => {
    const { logger, configService, climateMetricService } = opts;
    const gateway = new OpenMeteoGateway(logger, configService, climateMetricService);

    fastify.addHook('onReady', async () => {
        logger.info('Starting OpenMeteoGateway via Fastify plugin');
        gateway.connect();
    });

    fastify.addHook('onClose', async () => {
        logger.info('Stopping OpenMeteoGateway via Fastify plugin');
        gateway.disconnect();
    });
});
