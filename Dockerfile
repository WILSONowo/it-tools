# build stage
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY . .
RUN npm install -g pnpm@8.15.9
RUN pnpm i --frozen-lockfile
RUN pnpm build
# Pre-compress text assets and the ffmpeg wasm for nginx gzip_static (keeps the originals)
RUN find dist -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' -o -name '*.json' -o -name '*.svg' -o -name '*.wasm' -o -name '*.webmanifest' \) -size +1k -exec gzip -k -9 {} \;

# production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]