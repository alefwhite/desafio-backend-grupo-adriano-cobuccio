FROM node:alpine

# Set working directory
WORKDIR /usr/app

# Copy package.json first to avoid unnecessary npm installs
COPY ./package.json ./

# Install dependencies
RUN npm install

# Copy remaining files
COPY . .

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "run", "start"]