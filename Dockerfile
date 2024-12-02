FROM node:lts-alpine3.20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for dependency installation
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY index.js .

# Expose port 7969
EXPOSE 7969

# Command to run the application, using the environment variables
CMD node index.js --blueskyidentifier $IDENTIFIER --blueskypass $PASS