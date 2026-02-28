# .devcontainer/Dockerfile
FROM node:20-bullseye

# herramientas útiles
RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/app