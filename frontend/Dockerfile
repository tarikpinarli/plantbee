FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Run the dev server with host binding for Docker access
CMD ["npm", "run", "dev", "--", "--host"]
