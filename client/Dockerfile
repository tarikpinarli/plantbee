FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Install dependencies first for better caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Run the dev server with host binding for Docker access
CMD ["pnpm", "dev", "--host"]
