
import { Hono } from 'hono';
import jwtLib from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { streamText } from 'hono/streaming';

const prisma = new PrismaClient();
const app = new Hono().basePath('/api');


app.post('/login', async (c) => {
    const { username, password } = await c.req.json();
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || user.password !== password) {
        return c.json({ error: 'Wrong username or password' }, 401);
    }

    const token = jwtLib.sign({ userId: user.id }, 'boss-demo-secret');
    setCookie(c, 'token', token, { httpOnly: true, maxAge: 604800, path: '/' });

    return c.json({ success: true, message: 'Login successful!', username });
});

app.post('/delete', async (c) => {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    let userId;
    try {
        const decoded: any = jwtLib.verify(token, 'boss-demo-secret');
        userId = decoded.userId;
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    await prisma.user.delete({ where: { id: Number(userId) } });
    deleteCookie(c, 'token');
    return c.json({ success: true, message: 'User deleted successfully!' });
});

app.get('/logout', (c) => {
    deleteCookie(c, 'token');
    return c.json({ success: true, message: 'Logged out successfully!' });
});

app.get('/user', async (c) => {
    const token = getCookie(c, 'token');
        if (!token) return c.json({ error: 'Unauthorized' }, 401);
    
    let userId;
        try {
            const decoded: any = jwtLib.verify(token, 'boss-demo-secret');
            userId = decoded.userId;
        } catch {
            return c.json({ error: 'Unauthorized' }, 401);
        }
    
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
});


app.get('/reviews', async (c) => {
    const reviews = await prisma.review.findMany({
        include: {
            user: {
                select: { id: true, username: true }
            }
        }
    });
    return c.json({ reviews });
});

app.get('/stream-reviews', async (c) => {
    return streamText(c, async (stream) => {
        const reviews = await prisma.review.findMany({
            include: {
                user: {
                    select: { id: true, username: true }
                }
            }
        });
        
        

        for (const review of reviews) {
            const response = await fetch(
                `http://www.omdbapi.com/?apikey=c6556721&i=${encodeURIComponent(
                    review.imdbId
                )}`
            );
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            
            await stream.writeln(JSON.stringify({
                imdbId: review.imdbId,
                title: data.Title,
                rating: review.rating,
                text: review.text,
                createdAt: review.createdAt,
                user: review.user
            }));
            await stream.sleep(100);
        }
    });
});

app.get('/user/:userId', async (c) => {
    const { userId } = c.req.param();

    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { id: true, username: true }
    });

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
});


export const GET = app.fetch;
export const POST = app.fetch;

