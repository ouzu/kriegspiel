# build the react frontend

FROM node:13 as frontend

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./public ./public

RUN npm run build

# build the go backend

FROM golang:1.14 as backend

WORKDIR /go/src/git.laze.today/ouzu/kriegspiel/server

COPY server .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server main.go

# create a nice and small container

FROM scratch

COPY --from=backend /go/src/git.laze.today/ouzu/kriegspiel/server/server /server/server
COPY --from=frontend /app/build /build

EXPOSE 8000
ENTRYPOINT [ "/server/server", "-addr", "0.0.0.0:8000" ]