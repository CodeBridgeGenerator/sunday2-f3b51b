# Pull the Node image from Docker Hub
FROM node:22-slim

# Setting Working Directory
WORKDIR /usr/app

# Install necessary network diagnostics tools (ping, iproute2)
# and redis-cli for manual connection testing.
# Replace 'apt-get' with 'apk add' if you are using an Alpine image (e.g., node:20-alpine).
RUN apt-get update && \
    apt-get install -y iputils-ping redis-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copying only package.json
COPY package*.json ./

# Install Dependencies
RUN npm install

# Copy rest of the code to container
COPY . .

EXPOSE 3030

# Run the API on Nodemon
CMD ["npm", "run", "dev"]