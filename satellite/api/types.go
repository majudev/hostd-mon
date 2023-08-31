package api

import (
	"go.sia.tech/core/types"
)

type (
	// A ScanRequest scans a host's settings and price table
	ScanRequest struct {
		Address string          `json:"address"`
		HostKey types.PublicKey `json:"hostKey"`
	}
)
