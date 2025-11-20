import { Hono } from 'hono';
import jwtLib from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getCookie } from 'hono/cookie';
import { get } from 'http';

const prisma = new PrismaClient();
const app = new Hono().basePath('/api');

app.post('/watchlist', async (c) => {
    const { imdbId, title, year } = await c.req.json();
    const token = getCookie(c, 'token');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    let userId;
    try {
        const decoded: any = jwtLib.verify(token, 'boss-demo-secret');
        userId = decoded.userId;
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const exists = await prisma.watchlist.findFirst({ where: { userId, imdbId } });
    if (exists) return c.json({ error: 'Movie already in watchlist' }, 400);

    await prisma.watchlist.create({ data: { userId, imdbId, title, year } });

    return c.json({ success: true, message: 'Movie added to watchlist!' });
});

app.get('/watchlist', async (c) => {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    let userId;
    try {
        const decoded: any = jwtLib.verify(token, 'boss-demo-secret');
        userId = decoded.userId;
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const watchlist = await prisma.watchlist.findMany({ where: { userId } });

    return c.json({ watchlist });
});

app.delete('/watchlist', async (c) => {
    const { imdbId } = await c.req.json();
    const token = getCookie(c, 'token');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    let userId;
    try {
        const decoded: any = jwtLib.verify(token, 'boss-demo-secret');
        userId = decoded.userId;
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    await prisma.watchlist.delete({
        where: {
            userId_imdbId: {
                userId,
                imdbId
            }
        }
    });

    return c.json({ success: true, message: 'Removed from watchlist!' });
});

export const GET = app.fetch;
export const POST = app.fetch;
export const DELETE = app.fetch;
