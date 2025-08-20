# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]