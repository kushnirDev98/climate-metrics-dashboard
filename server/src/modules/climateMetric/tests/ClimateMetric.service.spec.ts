import { ClimateMetricService } from '../ClimateMetric.service';
import { ClimateMetricAggregatorService } from '../ClimateMetricAggregator.service';
import { ILogger } from '../../../services/Logger.service';
import { ClimateEvent } from '../ClimateMetric.types';

describe('ClimateMetricService', () => {
    let service: ClimateMetricService;
    let mockLogger: jest.Mocked<ILogger>;
    let mockAggregator: jest.Mocked<ClimateMetricAggregatorService>;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };

        mockAggregator = {
            processEvent: jest.fn(),
            getCandlesticksByCity: jest.fn(),
        } as unknown as jest.Mocked<ClimateMetricAggregatorService>;

        service = new ClimateMetricService(mockLogger, mockAggregator);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('processEvent', () => {
        it('should log and delegate processing to aggregator', () => {
            const event: ClimateEvent = {
                city: 'CapeTown',
                timestamp: '2025-06-24T12:00:00.000Z',
                temperature: 20,
                windspeed: 10,
                winddirection: 180,
            };

            service.processEvent(event);

            expect(mockLogger.info).toHaveBeenCalledWith('Processing climate event', {
                city: 'CapeTown',
                timestamp: '2025-06-24T12:00:00.000Z',
            });

            expect(mockAggregator.processEvent).toHaveBeenCalledWith(event);
        });
    });

    describe('getCandlesticks', () => {
        it('should return candlesticks from aggregator', () => {
            const fakeCandles = [
                {
                    open: 16,
                    high: 20,
                    low: 14,
                    close: 18,
                    timestamp: '2025-06-24T12:00:00.000Z',
                },
            ];

            mockAggregator.getCandlesticksByCity.mockReturnValue(fakeCandles);

            const result = service.getCandlesticks('CapeTown');

            expect(result).toEqual(fakeCandles);
            expect(mockAggregator.getCandlesticksByCity).toHaveBeenCalledWith('CapeTown');
        });
    });
});
