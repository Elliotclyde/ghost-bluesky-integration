FROM node:lts-alpine3.20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for dependency installation
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY index.js .
ADD src /usr/src/app/src

# Expose port 7969
EXPOSE 7969

# Copy the start script into the container
COPY start.sh /usr/src/app

# Command to run the application
CMD "./start.sh"