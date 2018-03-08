# docker build -t squeezewatch/squeezewatch .
# docker run -p 3000:3000 -d squeezetest/squeezewatch
# docker logs CONTAINER_ID
# docker inspect --format '{{ .NetworkSettings.IPAddress }}' CONTAINER_ID
# docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q) && docker rmi $(docker images -q)
FROM mhart/alpine-node:8
WORKDIR /build
COPY package.json yarn.lock ./
RUN yarn install --production

# And then copy over node_modules, etc from that stage to the smaller base image
FROM alpine:3.6
COPY --from=0 /usr/bin/node /usr/bin/
COPY --from=0 /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
WORKDIR /build
COPY --from=0 /build .
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]