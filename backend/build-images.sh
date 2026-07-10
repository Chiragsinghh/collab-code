#!/bin/bash

echo "🐳 Building Docker Images for Code Runner..."

echo "📦 Building Node.js Runner..."
docker build -t codesync-node src/execution/Dockerfiles/node

echo "📦 Building Python Runner..."
docker build -t codesync-python src/execution/Dockerfiles/python

echo "📦 Building C++ Runner..."
docker build -t codesync-cpp src/execution/Dockerfiles/cpp

echo "📦 Building Java Runner..."
docker build -t codesync-java src/execution/Dockerfiles/java

echo "✅ All images built!"
