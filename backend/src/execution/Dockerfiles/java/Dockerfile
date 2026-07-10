FROM openjdk:21-jdk-slim

WORKDIR /code

# Create non-root user
RUN useradd -m runner
USER runner

CMD ["sh", "-c", "javac Main.java && java Main"]
