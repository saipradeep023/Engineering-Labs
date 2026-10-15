# ShopKart Authentication Backend

## Setup

1. Install Node.js 20.6 or later and make sure MongoDB is running.
2. Update `.env` with your MongoDB connection string and a strong, private `JWT_SECRET` before deploying.
3. From this directory, run `npm install` and then `npm start`.

The API listens on `http://localhost:5000` by default.

## Endpoints

| Method | Endpoint | Authentication |
| --- | --- | --- |
| POST | `/customers/register` | None |
| POST | `/customers/login` | None |
| GET | `/customers/me` | HttpOnly JWT cookie |
| POST | `/customers/logout` | HttpOnly JWT cookie |
| PATCH | `/customers/change-password` | HttpOnly JWT cookie |

Use a Postman cookie jar (or Postman Interceptor) so the `token` cookie issued by login is sent to the protected endpoints. Password fields are never serialized in responses.
