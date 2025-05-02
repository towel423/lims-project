FROM node:18-alpine

RUN mkdir -p /usr/app/
WORKDIR /usr/app

COPY ./ ./
COPY .env.example .env
COPY .env.example .env.production
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
# CMD ["npm", "run", "dev"]
