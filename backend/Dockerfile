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

# Generate Prisma client first so TypeScript knows the types
RUN DATABASE_URL="postgresql://dummy:5432/dummy" npx prisma generate

# Build the TypeScript project
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
