# Stage 1: Build the React App
FROM node:20-alpine as build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Pass build-time environment variables if needed
# You will set the actual keys in the Cloud Run console
# ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
# (Add other Firebase ENVs here if they need to be embedded at build time)

# Build the Vite project
RUN npm run build

# Stage 2: Serve the App using Nginx
FROM nginx:alpine
# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port Cloud Run expects (usually 8080)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
