FROM node:16

# Create nightlight-backend directory
WORKDIR /usr/src/nightlight-backend

# Install dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Copy source code
COPY . .

# Expose .env SERVER_PORT
EXPOSE 6060
CMD [ "npm", "run", "start:server", "&", "npm", "run", "start:worker" ]