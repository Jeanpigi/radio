# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the application will run on
EXPOSE 3000

# Specify the command to run the application
CMD [ "npm", "start" ]