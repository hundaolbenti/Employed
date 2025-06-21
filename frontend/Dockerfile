# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the application from a lightweight server
FROM node:18-alpine

WORKDIR /app

# Install 'serve' to host our static files
RUN npm install -g serve

# Copy the build output from the previous stage
COPY --from=build /app/build .

# Expose the port the app runs on
EXPOSE 3000

# The command to run when the container starts
# '-s' handles client-side routing
CMD ["serve", "-s", "."]