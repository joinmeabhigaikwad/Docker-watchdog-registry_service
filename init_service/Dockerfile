# # Use official Node.js image as base
# FROM node:16

# # Set the working directory inside the container
# WORKDIR /usr/src/app

# # Copy the package.json and package-lock.json to the container
# COPY package.json ./

# # Install dependencies
# RUN npm install 

# RUN npm install express

# # Copy the rest of the code to the container
# COPY . .

# # Start the script when the container runs
# CMD [ "npm", "start" ]

# Stage 1: Build
FROM node:16 AS Build

# Set the working directory inside the container
WORKDIR /app

# Copy only package files to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Stage 2: Production
FROM node:16-slim

# Set the working directory
WORKDIR /app

# Copy built files from the build stage
COPY --from=Build /app ./

# Set NODE_ENV to production for optimized runtime
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
