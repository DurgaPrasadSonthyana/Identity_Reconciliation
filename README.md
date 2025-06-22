## Bitespeed Identity Reconciliation

Author: Durga Prasad Sonthyana

FluxKart uses Bitespeed to personalize user experience—but Doc Brown’s habit of using different emails and phone numbers per order breaks simple tracking. This service links fragmented contact info into a single customer record.

## End Point

POST https://identity-reconciliation-0kr2.onrender.com/api/contact/identify

**Body** (JSON):

```json
{
  "email"?: "string",
  "phoneNumber"?: "string"
}
```

**Response** (200 OK):

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["a@x.com", "b@y.com"],
    "phoneNumbers": ["111111", "222222"],
    "secondaryContactIds": [2,3]
  }
}
```

## Quick Start

1. **Clone & install**

   ```bash
   git clone https://github.com/DurgaPrasadSonthyana/Identity_Reconciliation.git
   cd Identity_Reconciliation
   npm install
   ```
2. **Configure** `.env` with DB credentials and `PORT`
3. **Run dev server**

   ```bash
   npm run dev
   ```
4. **Build & start**

   ```bash
   npm run build
   npm start
   ```

## Tech Stack

* Node.js + Express
* TypeScript
* Sequelize ORM
* PostgreSQL
* Deployed on Render.com
