FROM python:3.11-alpine

WORKDIR /code

# Create non-root user
RUN adduser -D runner
USER runner

CMD ["python", "main.py"]
