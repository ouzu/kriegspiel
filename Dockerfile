FROM golang:1.7.3 as builder

WORKDIR /go/src/git.laze.today/ouzu/kriegspiel/server

COPY server .

RUN go get ./...
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server main.go

FROM scratch

COPY --from=builder /go/src/git.laze.today/ouzu/kriegspiel/server/server /server/server
COPY build/ /build

EXPOSE 8000
ENTRYPOINT [ "/server/server", "-addr", "0.0.0.0:8000" ]