FROM node:14.21-slim as build
WORKDIR /app
RUN npm config set registry "https://registry.npmmirror.com"
ADD ./package.json ./
RUN npm install
COPY ./src ./src
COPY ./vue.config.js ./
COPY ./babel.config.js ./
COPY ./.env.example ./.env
RUN npm run build

FROM nginx:stable
COPY --from=build /app/public /usr/share/nginx/html