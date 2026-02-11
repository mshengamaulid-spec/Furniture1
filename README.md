# Furniture Ordering System

A full-stack web application for furniture ordering with Django backend and React frontend.

## Features

- User roles: Admin, Customer, Carpenter
- Carpenter can post products
- Customer can view products and place orders
- Admin dashboard for management
- REST API with JWT authentication
- Interactive React frontend

## Setup

### Backend (Django)

1. Navigate to the `furniture` directory
2. Create virtual environment: `python -m venv venv`
3. Activate: `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Create superuser: `python manage.py createsuperuser`
7. Run server: `python manage.py runserver`

### Frontend (React)

1. Navigate to the `frontend` directory
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## Usage

- Access admin at `/admin/`
- API endpoints at `/api/`
- Frontend at `http://localhost:5173/`

## Technologies

- Django 6.0
- Django REST Framework
- React
- Vite
- Axios
- JWT Authentication