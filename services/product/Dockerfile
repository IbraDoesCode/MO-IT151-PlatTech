# Specify node runtime as base image
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory in the container
WORKDIR /src

# Copy dependencies
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy rest of the source code
COPY . .

# Expose the port your app listens on
EXPOSE 3002

# Define command to run the app
CMD ["pnpm", "dev"]