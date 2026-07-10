FROM gcc:13

WORKDIR /code

# Create non-root user
RUN useradd -m runner
USER runner

CMD ["sh", "-c", "g++ main.cpp -o app && ./app"]
