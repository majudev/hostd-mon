FROM golang:1.19

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y libcap2-bin

RUN     go mod download && \
	go build && \
	setcap cap_net_raw,cap_net_admin=eip ./satellite

ENTRYPOINT ["/app/satellite"]
