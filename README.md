ZGFZYX Data Browser
===================

Stack
-----
- Backend: Node.js (Express + Mongoose), Excel export (exceljs), Zip (archiver)
- Frontend: React + Vite + MUI

Setup
-----
1) Backend
- cd server
- copy .env.example to .env and set:
  - PORT (optional, default 4000)
  - MONGODB_URI (Atlas URI for cluster "metricalo" db "zgfzyx")
  - ALLOWED_ORIGINS (comma-separated, e.g. http://localhost:5173)
- npm install
- npm run dev

2) Frontend
- cd client
- create .env and set:
  - VITE_API_URL=http://localhost:4000/api
- npm install
- npm run dev

Key Endpoints
-------------
- GET /api/yarns
  Query: q, name, code, brand, companyName, companyCity, categoryName, categoryId, page, limit, sort, order

- GET /api/companies
  Query: q, name, city, products, page, limit, sort, order

- GET /api/export/yarns
  Same filters as /api/yarns, but returns a zip stream containing:
  - yarns.xlsx
  - yarns.json
  - media/<yarnId>/* (downloaded images if available)

Notes
-----
- The collection name is fixed to "data" via model configuration to match your MongoDB.
- Text search uses a compound index; ensure the database has permissions to create indexes on first run.


