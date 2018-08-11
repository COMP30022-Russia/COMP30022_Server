# Build from Node image
FROM node:latest

# Copy files to build directory and navigate to build directory
COPY . /usr/src/build
WORKDIR /usr/src/build

# Install dependencies
RUN npm install

# Build app
RUN npm run build

# Set NODE_ENV to production
ENV NODE_ENV production

# Move built app and switch directory
RUN mv dist/ /usr/src/app
WORKDIR /usr/src/app

# Install production dependencies
RUN npm install --production

# Specify port and start command
EXPOSE 3000
CMD [ "npm", "start" ]
