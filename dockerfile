FROM node:current-alpine3.16 as base
WORKDIR /app
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN ls -a
RUN npm install
RUN npx tsc --project ./tsconfig.json

FROM node:current-alpine3.16
WORKDIR /app
COPY package.json ./
RUN npm install -production
COPY --from=base /app/out /app/out
COPY credentials.json ./

CMD ["node", "out/index.js"]
