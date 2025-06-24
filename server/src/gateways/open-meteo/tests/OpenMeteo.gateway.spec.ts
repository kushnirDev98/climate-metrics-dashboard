import WebSocket from 'ws';
import { OpenMeteoGateway } from '../OpenMeteo.gateway';
import { ILogger } from '../../../services/Logger.service';
import { ConfigService } from '../../../services/Config.service';
import { ClimateMetricService } from '../../../modules/climateMetric/ClimateMetric.service';
import {ClimateEvent, ClimateEventSchema} from '../../../modules/climateMetric/ClimateMetric.types';

jest.mock('ws');

const CLIMATE_METRIC_EVENT: ClimateEvent = {
    city: 'Berlin',
    timestamp: '2025-06-24T12:00:00.000Z',
    temperature: 22.5,
    windspeed: 15,
    winddirection: 180,
};

describe('OpenMeteoGateway', () => {
    let gateway: OpenMeteoGateway;
    let mockLogger: jest.Mocked<ILogger>;
    let mockConfig: jest.Mocked<ConfigService>;
    let mockService: jest.Mocked<ClimateMetricService>;
    let mockWsInstance: {
        on: jest.Mock;
        close: jest.Mock;
    };

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };

        mockConfig = {
            get: jest.fn().mockReturnValue('wss://mock-meteo-url'),
            config: {},
        } as unknown as jest.Mocked<ConfigService>;

        mockService = {
            processEvent: jest.fn(),
        } as unknown as jest.Mocked<ClimateMetricService>;

        mockWsInstance = {
            on: jest.fn(),
            close: jest.fn(),
        };

        (WebSocket as unknown as jest.Mock).mockImplementation(() => mockWsInstance);

        gateway = new OpenMeteoGateway(mockLogger, mockConfig, mockService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('connect()', () => {
        it('should create WebSocket and bind event handlers', () => {
            gateway.connect();

            expect(mockConfig.get).toHaveBeenCalledWith('OPEN_METEO_URL');
            expect(WebSocket).toHaveBeenCalledWith('wss://mock-meteo-url');
            expect(mockWsInstance.on).toHaveBeenCalledWith('open', expect.any(Function));
            expect(mockWsInstance.on).toHaveBeenCalledWith('message', expect.any(Function));
            expect(mockWsInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockWsInstance.on).toHaveBeenCalledWith('close', expect.any(Function));
            expect(mockLogger.info).toHaveBeenCalledWith('Connecting to WebSocket', { url: 'wss://mock-meteo-url' });
        });

        it('should process valid message', () => {
            gateway.connect();
            jest.spyOn(ClimateEventSchema, 'safeParse').mockReturnValue({
                success: true,
                data: CLIMATE_METRIC_EVENT,
            });
            const messageHandler = mockWsInstance.on.mock.calls.find(([event]) => event === 'message')?.[1];
            const buffer = Buffer.from(JSON.stringify(CLIMATE_METRIC_EVENT));

            messageHandler?.call(mockWsInstance, buffer);

            expect(mockService.processEvent).toHaveBeenCalledWith(CLIMATE_METRIC_EVENT);
        });


        it('should warn on invalid event structure', () => {
            gateway.connect();

            jest.spyOn(ClimateEventSchema, 'safeParse').mockReturnValue({
                success: false,
                error: {
                    errors: [],
                    flatten: () => ({
                        fieldErrors: { foo: ['Expected string, received undefined'] },
                        formErrors: [],
                    }),
                    format: () => ({}),
                    message: 'Invalid event structure',
                    issues: [{ path: ['foo'], message: 'Expected string, received undefined' }],
                    name: 'ZodError',
                },
            } as any);

            const invalid = { foo: 'bar' };
            const messageHandler = mockWsInstance.on.mock.calls.find(([e]) => e === 'message')?.[1];
            messageHandler?.call(mockWsInstance, Buffer.from(JSON.stringify(invalid)));

            expect(mockLogger.warn).toHaveBeenCalledWith(
                'Invalid WebSocket event',
                expect.objectContaining({
                    event: invalid,
                })
            );
            expect(mockService.processEvent).not.toHaveBeenCalled();
        });

        it('should log JSON parse errors', () => {
            gateway.connect();
            const messageHandler = mockWsInstance.on.mock.calls.find(([e]) => e === 'message')?.[1];
            messageHandler?.call(mockWsInstance, '{"invalid');

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to parse WebSocket message', {
                error: expect.stringContaining('Unterminated string in JSON at position 9 (line 1 column 10)'),
            });
        });

        it('should reconnect on unexpected close', () => {
            jest.useFakeTimers();
            gateway.connect();

            const closeHandler = mockWsInstance.on.mock.calls.find(([e]) => e === 'close')?.[1];
            closeHandler?.call(mockWsInstance);

            expect(mockLogger.warn).toHaveBeenCalledWith('WebSocket disconnected, reconnecting in 5s');
            jest.advanceTimersByTime(5000);
            expect(mockConfig.get).toHaveBeenCalledTimes(2); // initial + reconnect
        });

        it('should not reconnect if intentionally closed', () => {
            gateway.connect();
            gateway.disconnect();

            const closeHandler = mockWsInstance.on.mock.calls.find(([e]) => e === 'close')?.[1];
            closeHandler?.call(mockWsInstance);

            expect(mockLogger.warn).not.toHaveBeenCalledWith('WebSocket disconnected, reconnecting in 5s');
        });
    });

    describe('disconnect()', () => {
        it('should clear timers and close socket', () => {
            gateway.connect();
            gateway.disconnect();

            expect(mockLogger.info).toHaveBeenCalledWith('WebSocket disconnected');
            expect(mockWsInstance.close).toHaveBeenCalled();
        });
    });
});
