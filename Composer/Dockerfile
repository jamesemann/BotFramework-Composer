FROM node:12-alpine as build
WORKDIR /src/Composer

# yes, docker copy is really this stupid, https://github.com/moby/moby/issues/15858
COPY yarn.lock .
COPY .npmrc .
COPY package.json .
COPY packages/client/package.json ./packages/client/
COPY yarn.lock ./packages/server/
COPY packages/server/package.json ./packages/server/
COPY packages/lib/package.json ./packages/lib/
COPY packages/lib/code-editor/package.json ./packages/lib/code-editor/
COPY packages/lib/shared/package.json ./packages/lib/shared/
COPY packages/lib/indexers/package.json ./packages/lib/indexers/
COPY packages/extensions/package.json ./packages/extensions/
COPY packages/lib/eslint-plugin-bfcomposer/package.json ./packages/lib/eslint-plugin-bfcomposer/
COPY packages/extensions/obiformeditor/package.json ./packages/extensions/obiformeditor/
COPY packages/extensions/visual-designer/package.json ./packages/extensions/visual-designer/

# run yarn install as a distinct layer
RUN yarn install

COPY . .
RUN yarn build:prod

# use a multi-stage build to reduce the final image size
FROM node:12-alpine

WORKDIR /app/Composer/server
COPY --from=build /src/Composer/.npmrc .
COPY --from=build /src/Composer/packages/lib ./lib
COPY --from=build /src/Composer/packages/server .

# update server package json to point to local packages
RUN node ./prepare-prod.js

RUN yarn --production && yarn cache clean
CMD ["node", "build/server.js"]
