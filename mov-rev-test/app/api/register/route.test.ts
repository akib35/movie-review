import { test, describe, before, after, beforeEach } from 'node:test';
import { PrismaClient } from '@prisma/client';
import jwtLib from 'jsonwebtoken'
import assert from 'node:assert';
import { app } from './route.ts';

const prisma = new PrismaClient();

describe('API Route Tests', () => {
    let testUser: any;
    let authToken: string;

    before(async () => {
        await prisma.$connect();
    });

    after(async () => {
        await prisma.user.deleteMany({});
        await prisma.review.deleteMany({});
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.review.deleteMany({});
        await prisma.user.deleteMany({});

        testUser = await prisma.user.create({
            data: {
                username: 'testuser',
                password: 'testpass123'
            }
        });
        authToken = jwtLib.sign({ userId: testUser.id }, 'boss-demo-secret');
    });

    describe('POST /api/register', () => {
        test('should register a new user', async () => {
            const req = new Request('http://localhost/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'newuser',
                    password: 'password123'
                })
            });

            const response = await app.fetch(req);
            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.success, true);
            assert.match(data.message, /Registered successfully!/);
        });

        test('should reject duplicate username', async () => {
            const req = new Request('http://localhost/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    password: 'password123'
                })
            });

            const response = await app.fetch(req);
            assert.strictEqual(response.status, 400);
            const data = await response.json();
            assert.match(data.error, /Username taken/);
        });

        test('should reject registration with missing username', async () => {
            const req = new Request('http://localhost/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: 'password123'
                })
            });

            const response = await app.fetch(req);
            assert.strictEqual(response.status, 400);
            const data = await response.json();
            assert.match(data.error, /Username and password are required/);
        });

        test('should reject registration with missing password', async () => {
            const req = new Request('http://localhost/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'newuser'
                })
            });

            const response = await app.fetch(req);
            assert.strictEqual(response.status, 400);
            const data = await response.json();
            assert.match(data.error, /Username and password are required/);
        });

        test('should reject registration with empty username', async () => {
            const req = new Request('http://localhost/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: '',
                    password: 'password123'
                })
            });

            const response = await app.fetch(req);
            assert.strictEqual(response.status, 400);
            const data = await response.json();
            assert.match(data.error, /Username and password are required/);
        });

        test('should reject registration with empty password', async () => {
            const req = new Request('http://localhost/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'newuser',
                    password: ''
                })
            });

            const response = await app.fetch(req);
            assert.strictEqual(response.status, 400);
            const data = await response.json();
            assert.match(data.error, /Username and password are required/);
        });
    });
});
