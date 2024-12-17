# # Use the official Node.js 18 image
# FROM node:18

# # Set the working directory inside the container
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package.json .

# # Install dependencies
# RUN npm install

# RUN npm install axios

# # Copy the rest of the application files
# COPY . .

# # Expose the application port
# EXPOSE 5102

# # Start the application
# CMD ["npm", "start"]

# Stage 1: Build
FROM node:18 AS Build

# Set the working directory inside the container
WORKDIR /app

# Copy only package files to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Stage 2: Production
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy files from the build stage
COPY --from=Build /app ./

# Expose the application port
EXPOSE 5102

# Set NODE_ENV to production for optimized runtime
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
