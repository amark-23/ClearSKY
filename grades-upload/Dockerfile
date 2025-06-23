# Use official Node.js image as base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port (βάλε τον ίδιο με το grades-upload server)
EXPOSE 3005

# Start the service
CMD ["node", "index.js"]
