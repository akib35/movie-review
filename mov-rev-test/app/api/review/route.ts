import { Hono } from 'hono';
import jwtLib from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getCookie } from 'hono/cookie';

const prisma = new PrismaClient();
const app = new Hono().basePath('/api');

app.post('/review', async (c) => {
    const { imdbId, rating, text } = await c.req.json();
    const token = getCookie(c, 'token');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    let userId;
    try {
        const decoded: any = jwtLib.verify(token, 'boss-demo-secret');
        userId = Number(decoded.userId);
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    console.log(userId);
    let int_rating = Number(rating);
    await prisma.review.upsert({
        where: {
            userId_imdbId: {
                userId,
                imdbId
            }
        },
        update: {
            rating: int_rating,
            text
        },
        create: {
            userId,
            imdbId,
            rating: int_rating,
            text
        }
    });

    return c.json({ success: true, message: 'Review saved successfully!' });
});

app.get('/review', async (c) => {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    let userId;
    try {
        const decoded: any = jwtLib.verify(token, 'boss-demo-secret');
        userId = decoded.userId;
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const reviews = await prisma.review.findMany({ where: { userId } });

    const reviewsMap: { [imdbId: string]: { rating: string; text: string } } = {};
    reviews.forEach(review => {
        reviewsMap[review.imdbId] = { rating: review.rating.toString(), text: review.text || '' };
    });

    return c.json({ reviews: reviewsMap });
});


app.delete('/review', async (c) => {
    const { imdbId } = await c.req.json();
    const token = getCookie(c, 'token');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);
    let userId;
    try {
        const decoded: any = jwtLib.verify(token, 'boss-demo-secret');
        userId = Number(decoded.userId);
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    await prisma.review.deleteMany({
        where: { userId, imdbId }
    });

    return c.json({ success: true, message: 'Review deleted successfully!' });
});



export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
