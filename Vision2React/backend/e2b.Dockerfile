FROM node:20-slim

WORKDIR /home/user

RUN apt-get update && apt-get install -y \
  git \
  curl \
  && rm -rf /var/lib/apt/lists/*

RUN npx create-next-app@latest app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm \
  --yes

WORKDIR /home/user/app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
