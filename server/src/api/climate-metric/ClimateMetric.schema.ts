export const climateMetricSchema = {
    params: {
        type: 'object',
        properties: {
            city: { type: 'string', minLength: 1 },
        },
        required: ['city'],
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    open: { type: 'number', minimum: -50, maximum: 60 },
                    high: { type: 'number', minimum: -50, maximum: 60 },
                    low: { type: 'number', minimum: -50, maximum: 60 },
                    close: { type: 'number', minimum: -50, maximum: 60 },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:00:00Z$',
                    },
                },
                required: ['open', 'high', 'low', 'close', 'timestamp'],
            },
        },
    },
};