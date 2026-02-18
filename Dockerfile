FROM node:20.19-alpine AS build-stage

ARG BASE_URL
ARG API_BASE_URL

ENV TZ=Europe/Moscow
ENV VITE_BASE_API_URL=$API_BASE_URL

RUN apk update && apk add tzdata

WORKDIR /app

ADD . /app
RUN env
RUN npm install
RUN npm run build

FROM nginx:stable-alpine

ENV TZ=Europe/Moscow

RUN apk update && apk add tzdata bash
COPY --from=build-stage /app/.output/public /usr/share/nginx/html
