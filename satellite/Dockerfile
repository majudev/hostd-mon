FROM golang:1.19

WORKDIR /app

COPY . .

RUN apt update && apt install -y libcap2-bin

RUN     go mod download && \
	go build && \
	setcap cap_net_raw,cap_net_admin=eip ./satellite

CMD ["/app/satellite"]
