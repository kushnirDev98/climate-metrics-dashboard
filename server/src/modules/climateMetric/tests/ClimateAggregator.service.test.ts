import moment from 'moment';
import { ClimateMetricAggregatorService } from '../ClimateMetricAggregator.service';
import { ILogger } from '../../../services/Logger.service';
import { ClimateEvent, ClimateMetric } from '../ClimateMetric.types';

jest.mock('../../../services/Logger.service');

describe('ClimateMetricAggregatorService', () => {
    let service: ClimateMetricAggregatorService;
    let mockLogger: jest.Mocked<ILogger>;

    const generateMockEvents = (count: number, startDate: string, cities: string[]): ClimateEvent[] => {
        const events: ClimateEvent[] = [];
        const start = moment(startDate).utc();
        for (let i = 0; i < count; i++) {
            const timestamp = start.clone().add(i * 2, 'minutes').toISOString(); // Includes .000Z
            const city = cities[i % cities.length];
            events.push({
                city,
                timestamp,
                temperature: Math.random() * 60 - 10, // -10 to 50°C
                windspeed: Math.random() * 50,
                winddirection: Math.random() * 360,
            });
        }
        return events;
    };

    const mockEvents = [
        ...generateMockEvents(24, '2025-06-24T00:00:00.000Z', ['CapeTown', 'London', 'Tokyo']), // 24 hours for today
        // Invalid events
        {
            city: '',
            timestamp: '2025-06-24T12:00:00.000Z',
            temperature: 20,
            windspeed: 10,
            winddirection: 180,
        },
        {
            city: 'CapeTown',
            timestamp: '2025-06-24T12:00:00.000Z',
            temperature: undefined as any, // Invalid temperature
            windspeed: 10,
            winddirection: 180,
        },
        {
            city: 'London',
            timestamp: 'invalid', // Invalid timestamp
            temperature: 15,
            windspeed: 20,
            winddirection: 270,
        },
    ];

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        } as any;
        service = new ClimateMetricAggregatorService(mockLogger);
        // Mock current date to June 24, 2025, 00:00:00 UTC
        jest.spyOn(moment, 'utc').mockImplementation(
            (input?: moment.MomentInput) => {
                if (input) return moment(input).utc();
                return moment('2025-06-24T00:00:00.000Z').utc();
            }
        ) as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('processEvent', () => {
        it('should create new candlestick for first event in hour', () => {
            const event: ClimateEvent = {
                city: 'CapeTown',
                timestamp: '2025-06-24T02:00:00.000Z',
                temperature: 16,
                windspeed: 24.5,
                winddirection: 294,
            };
            service.processEvent(event);
            const candlesticks = service.getCandlesticks('CapeTown');
            expect(candlesticks).toEqual([
                {
                    open: 16,
                    high: 16,
                    low: 16,
                    close: 16,
                    timestamp: '2025-06-24T02:00:00.000Z',
                },
            ]);
            expect(mockLogger.info).toHaveBeenCalledWith('Processing event', event);
            expect(mockLogger.info).toHaveBeenCalledWith('Created new candle for CapeTown at 2025-06-24T02:00:00.000Z', {
                open: 16,
                high: 16,
                low: 16,
                close: 16,
                timestamp: '2025-06-24T02:00:00.000Z',
            });
        });

        it('should update existing candlestick for same hour', () => {
            const events: ClimateEvent[] = [
                {
                    city: 'CapeTown',
                    timestamp: '2025-06-24T02:00:00.000Z',
                    temperature: 16,
                    windspeed: 24.5,
                    winddirection: 294,
                },
                {
                    city: 'CapeTown',
                    timestamp: '2025-06-24T02:30:00.000Z',
                    temperature: 18,
                    windspeed: 25,
                    winddirection: 300,
                },
                {
                    city: 'CapeTown',
                    timestamp: '2025-06-24T02:45:00.000Z',
                    temperature: 15,
                    windspeed: 26,
                    winddirection: 310,
                },
            ];
            events.forEach((event) => service.processEvent(event));
            const candlesticks = service.getCandlesticks('CapeTown');
            expect(candlesticks).toEqual([
                {
                    open: 16,
                    high: 18,
                    low: 15,
                    close: 15,
                    timestamp: '2025-06-24T02:00:00.000Z',
                },
            ]);
            expect(mockLogger.info).toHaveBeenCalledWith('Created new candle for CapeTown at 2025-06-24T02:00:00.000Z', expect.any(Object));
            expect(mockLogger.info).toHaveBeenCalledWith('Updated candle for CapeTown at 2025-06-24T02:00:00.000Z', {
                open: 16,
                high: 18,
                low: 15,
                close: 15,
                timestamp: '2025-06-24T02:00:00.000Z',
            });
            expect(mockLogger.info).toHaveBeenCalledTimes(7); // 1 for each event + 1 for creation
        });

        it('should handle large dataset across multiple cities and hours', () => {
            mockEvents.slice(0, 24).forEach((event) => service.processEvent(event)); // Only today's 24 hours
            const candlesticksCapeTown = service.getCandlesticks('CapeTown');
            const candlesticksLondon = service.getCandlesticks('London');
            const candlesticksTokyo = service.getCandlesticks('Tokyo');
            expect(candlesticksCapeTown.length).toBeGreaterThan(0);
            expect(candlesticksLondon.length).toBeGreaterThan(0);
            expect(candlesticksTokyo.length).toBeGreaterThan(0);
            expect(candlesticksCapeTown[0].timestamp).toMatch(/^2025-06-24T\d{2}:00:00\.000Z$/);
            expect(mockLogger.info).toHaveBeenCalledTimes(24 * 2 + 3); // 1 for processing + 1 for create/update per event
        });

        it('should handle empty city', () => {
            const invalidEvent: ClimateEvent = {
                city: '',
                timestamp: '2025-06-24T12:00:00.000Z',
                temperature: 20,
                windspeed: 10,
                winddirection: 180,
            };
            service.processEvent(invalidEvent);
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to process event', {
                error: expect.any(String),
                event: invalidEvent,
            });
            const candlesticks = service.getCandlesticks('');
            expect(candlesticks).toEqual([]);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid city parameter', { city: '' });
        });

        it('should handle undefined temperature', () => {
            const invalidEvent: ClimateEvent = {
                city: 'CapeTown',
                timestamp: '2025-06-24T12:00:00.000Z',
                temperature: undefined as any,
                windspeed: 10,
                winddirection: 180,
            };
            service.processEvent(invalidEvent);
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to process event', {
                error: expect.any(String),
                event: invalidEvent,
            });
        });

        it('should handle invalid timestamp', () => {
            const invalidEvent: ClimateEvent = {
                city: 'London',
                timestamp: 'invalid',
                temperature: 15,
                windspeed: 20,
                winddirection: 270,
            };
            service.processEvent(invalidEvent);
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to process event', {
                error: 'Invalid timestamp',
                event: invalidEvent,
            });
        });
    });

    describe('getCandlesticks', () => {
        it('should return sorted candlesticks for valid city on current day', () => {
            const events: ClimateEvent[] = [
                {
                    city: 'CapeTown',
                    timestamp: '2025-06-24T01:30:00.000Z',
                    temperature: 16,
                    windspeed: 24.5,
                    winddirection: 294,
                },
                {
                    city: 'CapeTown',
                    timestamp: '2025-06-24T02:15:00.000Z',
                    temperature: 18,
                    windspeed: 25,
                    winddirection: 300,
                },
            ];
            events.forEach((event) => service.processEvent(event));
            const candlesticks = service.getCandlesticks('CapeTown');
            expect(candlesticks).toEqual([
                {
                    open: 16,
                    high: 16,
                    low: 16,
                    close: 16,
                    timestamp: '2025-06-24T01:00:00.000Z',
                },
                {
                    open: 18,
                    high: 18,
                    low: 18,
                    close: 18,
                    timestamp: '2025-06-24T02:00:00.000Z',
                },
            ]);
            expect(mockLogger.info).toHaveBeenCalledWith('Fetching candlesticks for city', {
                city: 'CapeTown',
            });
        });

        it('should return empty array for invalid city', () => {
            const candlesticks = service.getCandlesticks('');
            expect(candlesticks).toEqual([]);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid city parameter', { city: '' });
        });

        it('should return empty array for non-existent city', () => {
            const candlesticks = service.getCandlesticks('NonExistent');
            expect(candlesticks).toEqual([]);
            expect(mockLogger.warn).toHaveBeenCalledWith('No candlesticks found for city', {
                city: 'NonExistent',
            });
        });
    });
});

// Custom matcher for sorting
expect.extend({
    toBeSortedBy(received: any[], comparator: (a: any, b: any) => number) {
        const sorted = [...received].sort(comparator);
        const pass = received.every((item, index) => item === sorted[index]);
        return {
            pass,
            message: () => (pass ? 'Array is sorted' : 'Array is not sorted'),
        };
    },
});