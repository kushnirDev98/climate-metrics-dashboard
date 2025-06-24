import Fastify from 'fastify';
import { climateMetricRoutes } from '../ClimateMetric.route';
import { ILogger } from '../../../services/Logger.service';
import { ClimateMetricService } from '../../../modules/climateMetric/ClimateMetric.service';
import { ConfigService } from '../../../services/Config.service';

jest.mock('../../../common/middleware/auth.middleware');

import { authMiddleware } from '../../../common/middleware/auth.middleware';

describe('climateMetricRoutes', () => {
    let fastify: ReturnType<typeof Fastify>;
    let mockLogger: jest.Mocked<ILogger>;
    let mockClimateMetricService: jest.Mocked<ClimateMetricService>;
    let mockConfigService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        (authMiddleware as jest.Mock).mockImplementation(async (req: any, reply: any) => {
            return;
        });

        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };

        mockClimateMetricService = {
            getCandlesticks: jest.fn(),
        } as any;

        mockConfigService = {} as any;

        fastify = Fastify();

        await fastify.register(climateMetricRoutes, {
            logger: mockLogger,
            climateMetricService: mockClimateMetricService,
            configService: mockConfigService,
        });

        await fastify.ready();
    });

    afterEach(async () => {
        await fastify.close();
        jest.clearAllMocks();
    });

    it('should return 200 and candlesticks from service', async () => {
        const city = 'Berlin';
        const mockCandlesticks = [
            { open: 10, high: 15, low: 5, close: 12, timestamp: '2025-06-24T12:00:00.000Z' },
        ];

        mockClimateMetricService.getCandlesticks.mockReturnValue(mockCandlesticks);

        const response = await fastify.inject({
            method: 'GET',
            url: `/api/climate-metrics/${city}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual(mockCandlesticks);
        expect(mockClimateMetricService.getCandlesticks).toHaveBeenCalledWith(city);
    });

    it('should call auth middleware before handler', async () => {
        const city = 'London';

        mockClimateMetricService.getCandlesticks.mockReturnValue([]);

        const response = await fastify.inject({
            method: 'GET',
            url: `/api/climate-metrics/${city}`,
        });

        expect(response.statusCode).toBe(200);
        expect(mockClimateMetricService.getCandlesticks).toHaveBeenCalledWith(city);
        expect(authMiddleware).toHaveBeenCalled();
    });

    it('should not call service and return 401 if auth middleware fails', async () => {
        (authMiddleware as jest.Mock).mockImplementation(async (req: any, reply: any) => {
            reply.status(401).send({ error: 'Unauthorized' });
        });

        const response = await fastify.inject({
            method: 'GET',
            url: '/api/climate-metrics/Berlin',
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({ error: 'Unauthorized' });
        expect(mockClimateMetricService.getCandlesticks).not.toHaveBeenCalled();
    });
});
