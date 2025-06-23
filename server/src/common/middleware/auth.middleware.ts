import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;

    // TODO: Replace this stub with actual JWT validation logic
    if (authHeader && authHeader === 'Bearer stub-token') {
        request.log.info('Authentication successful', { path: request.url });
        return;
    }

    request.log.warn('Authentication failed', { path: request.url });
    reply.code(401).send({ error: 'Unauthorized' });
}
