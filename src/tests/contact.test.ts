// __tests__/contact.test.ts
import request from 'supertest';
import app from '../app';
import { sequelize } from '../config/dbConfig';

beforeAll(async () => {
  // reset all tables
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/contact/identify', () => {
  it('1) creates a new primary contact', async () => {
    const res = await request(app)
      .post('/api/contact/identify')
      .send({ email: 'foo@bar.com', phoneNumber: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      contact: {
        primaryContactId: expect.any(Number),
        emails: ['foo@bar.com'],
        phoneNumbers: ['123456'],
        secondaryContactIds: []
      }
    });
  });

  it('2) adds a secondary when same phone, new email', async () => {
    const res = await request(app)
      .post('/api/contact/identify')
      .send({ email: 'mcfly@hillvalley.edu', phoneNumber: '123456' });

    expect(res.status).toBe(200);
    const c = res.body.contact;
    expect(c.primaryContactId).toBe(1);
    expect(c.emails.sort()).toEqual(
      expect.arrayContaining(['foo@bar.com', 'mcfly@hillvalley.edu'])
    );
    expect(c.phoneNumbers).toEqual(['123456']);
    expect(c.secondaryContactIds).toHaveLength(1);
  });

  it('3) returns same chain when querying by email only', async () => {
    const res = await request(app)
      .post('/api/contact/identify')
      .send({ email: 'foo@bar.com' });

    expect(res.status).toBe(200);
    expect(res.body.contact.primaryContactId).toBe(1);
    expect(res.body.contact.emails.sort()).toEqual(
      expect.arrayContaining(['foo@bar.com', 'mcfly@hillvalley.edu'])
    );
  });

  it('4) returns same chain when querying by phone only', async () => {
    const res = await request(app)
      .post('/api/contact/identify')
      .send({ phoneNumber: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.contact.primaryContactId).toBe(1);
    expect(res.body.contact.phoneNumbers).toEqual(['123456']);
  });

  it('5) creates a brand-new primary for completely new details', async () => {
    const res = await request(app)
      .post('/api/contact/identify')
      .send({ email: 'new@domain.com', phoneNumber: '999999' });

    expect(res.status).toBe(200);
    expect(res.body.contact.primaryContactId).toBe(3);
    expect(res.body.contact.emails).toEqual(['new@domain.com']);
    expect(res.body.contact.phoneNumbers).toEqual(['999999']);
    expect(res.body.contact.secondaryContactIds).toEqual([]);
  });

  it('6) 400 if neither email nor phoneNumber provided', async () => {
    const res = await request(app)
      .post('/api/contact/identify')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'Either email or phone number is required.'
    });
  });
});
