# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables to keep Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the default port Google Cloud Run listens on
EXPOSE 8080

# Run the application (Change 'app.py' to whatever your main script is named, e.g., main.py)
CMD ["python", "app.py"]
