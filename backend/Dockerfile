FROM node:18-bullseye

# Install build dependencies, GCC, Java, and Python
RUN apt-get update && \
    apt-get install -y gcc g++ default-jdk python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a sandbox user for safe code execution
RUN useradd -m sandboxuser

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
