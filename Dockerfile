FROM node:alpine AS build-frontend
WORKDIR /client

COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ----------------------------

FROM node:alpine
WORKDIR /app/server
COPY server/package.json server/package-lock.json /app/server/
RUN npm install
COPY server/ /app/server/
WORKDIR /app
COPY /package.json /package-lock.json ./
COPY --from=build-frontend /client ./client/
RUN npm install
EXPOSE 80
CMD ["npm","start"]
