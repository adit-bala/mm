FROM node:18.18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/severance-ui/package*.json ./
# Install dependencies
RUN npm install
COPY frontend/severance-ui/ ./
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Set environment variables
ENV PYTHONPATH=/app

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "3000"]
