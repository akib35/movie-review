import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = new Hono().basePath('/api');

app.post('/register', async (c) => {
    const { username, password } = await c.req.json();
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) return c.json({ error: 'Username taken' }, 400);

    await prisma.user.create({ data: { username, password } });

    return c.json({ success: true, message: 'Registered successfully!' });
});


export const GET = app.fetch;
export const POST = app.fetch;
