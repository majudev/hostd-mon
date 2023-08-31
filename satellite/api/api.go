package api

import (
	"context"
	"net/http"

	"github.com/majudev/hostd-mon/satellite/benchmark"
	"go.sia.tech/core/types"
	"go.sia.tech/jape"
	"go.uber.org/zap"
)

type (
	// A Benchmark benchmarks hosts and manages contracts
	Benchmark interface {
		ScanHost(ctx context.Context, hostAddr string, hostKey types.PublicKey) (benchmark.Settings, error)
	}

	api struct {
		log *zap.Logger

		bench Benchmark
	}
)

// NewServer initializes the API
func NewServer(bench Benchmark, log *zap.Logger) http.Handler {
	api := &api{
		log:   log,
		bench: bench,
	}
	return jape.Mux(map[string]jape.Handler{
		// benchmark endpoints
		"POST /scan": api.handlePOSTScan,
	})
}
