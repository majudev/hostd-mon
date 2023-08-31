package main

import (
	"context"
	"errors"
	"flag"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/majudev/hostd-mon/satellite/api"
	"github.com/majudev/hostd-mon/satellite/benchmark"
	"go.uber.org/zap"

	"net/http"
)

var (
	logfile  string
	apiAddr  string
	logLevel string
)

func main() {
	flag.StringVar(&logfile, "logfile", "./satellite.log", "log file")
	flag.StringVar(&apiAddr, "api.addr", ":8484", "api address")
	flag.StringVar(&logLevel, "log.level", "info", "log level")
	flag.Parse()

	apiListener, err := net.Listen("tcp", apiAddr)
	if err != nil {
		log.Fatal(err)
	}
	defer apiListener.Close()

	log.Println("API started")

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	go func() {
		<-ctx.Done()

		time.Sleep(30 * time.Second)
		os.Exit(1)
	}()

	log.Println("Context created")

	cfg := zap.NewProductionConfig()
	cfg.OutputPaths = []string{"stdout", logfile}
	switch logLevel {
	case "debug":
		cfg.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
	case "info":
		cfg.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	case "warn":
		cfg.Level = zap.NewAtomicLevelAt(zap.WarnLevel)
	default:
		cfg.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	}
	logger, err := cfg.Build()
	if err != nil {
		log.Fatalln("ERROR: failed to create logger:", err)
	}
	defer logger.Sync()

	log.Println("Logger started")

	b := benchmark.New(logger.Named("benchmark"))

	web := http.Server{
		Handler:     api.NewServer(b, logger.Named("api")),
		ReadTimeout: 30 * time.Second,
	}
	defer web.Close()

	log.Println("WEB started")

	go func() {
		err := web.Serve(apiListener)
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("failed to serve web", zap.Error(err))
		}
	}()

	<-ctx.Done()

	log.Println("Everything started")
}
