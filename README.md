# Vehicle Service Management System
**Developed by: Aashish Sanodiya**

A full-stack web application for managing vehicle services, repairs, components, pricing, and revenue visualization.

## Tech Stack

- **Backend**: Django 4.x + Django REST Framework
- **Frontend**: React.js + Recharts
- **Database**: SQLite (default)

---

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm

---

### Backend Setup

```bash
cd backend

# Install dependencies
pip install django djangorestframework django-cors-headers

# Run migrations
python manage.py migrate

# (Optional) Load sample data
python seed_data.py

# Start backend server
python manage.py runserver
```

Backend will run at: **http://localhost:8000**

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend server
npm start
```

Frontend will run at: **http://localhost:3000**

---

## Features

### 1. Component Registration & Pricing
- Add spare parts and labor/service types
- Set purchase price and repair price separately
- Track stock quantity

### 2. Vehicle Repair Tracking
- Register vehicles with owner details
- Track multiple service records per vehicle
- View full service history

### 3. Issue Reporting & Component Selection
- Add issues to any service record
- Choose between "Use New Component" or "Repair Service"
- Auto-fill price based on component selection

### 4. Final Price Calculation & Payment Simulation
- Auto-calculates total from issues + labor charges
- Simulates payment with method selection (Cash / Card / UPI / Bank Transfer)
- Generates transaction ID on payment

### 5. Revenue Graphs
- Daily (last 30 days), Monthly (by year), Yearly views
- Bar chart for revenue + Line chart for service count
- Summary stats: total revenue, completed vs pending services

---

## Running Unit Tests

```bash
cd backend
python manage.py test api
```

12 tests covering models, API endpoints, validation, and business logic.

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET/POST /api/components/` | List & create components |
| `GET/POST /api/vehicles/` | List & register vehicles |
| `GET/POST /api/services/` | List & create service records |
| `POST /api/services/{id}/process_payment/` | Process payment |
| `GET/POST /api/issues/` | List & add issues |
| `GET /api/revenue/?period=daily\|monthly\|yearly` | Revenue stats |
