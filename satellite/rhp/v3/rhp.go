package rhp

import (
	"context"
	"encoding/json"
	"fmt"
	"net"

	rhp3 "go.sia.tech/core/rhp/v3"
	"go.sia.tech/core/types"
)

type (
	// A Session is an RHP3 session with the host
	Session struct {
		hostKey types.PublicKey
		t       *rhp3.Transport

		pt rhp3.HostPriceTable
	}
)

// ScanPriceTable retrieves the host's current price table
func (s *Session) ScanPriceTable() (rhp3.HostPriceTable, error) {
	stream := s.t.DialStream()
	defer stream.Close()

	if err := stream.WriteRequest(rhp3.RPCUpdatePriceTableID, nil); err != nil {
		return rhp3.HostPriceTable{}, fmt.Errorf("failed to write request: %w", err)
	}
	var resp rhp3.RPCUpdatePriceTableResponse
	if err := stream.ReadResponse(&resp, 4096); err != nil {
		return rhp3.HostPriceTable{}, fmt.Errorf("failed to read response: %w", err)
	}

	var pt rhp3.HostPriceTable
	if err := json.Unmarshal(resp.PriceTableJSON, &pt); err != nil {
		return rhp3.HostPriceTable{}, fmt.Errorf("failed to unmarshal price table: %w", err)
	}
	return pt, nil
}

// Close closes the underlying transport
func (s *Session) Close() error {
	return s.t.Close()
}

// NewSession creates a new session with a host
func NewSession(ctx context.Context, hostKey types.PublicKey, hostAddr string) (*Session, error) {
	conn, err := (&net.Dialer{}).DialContext(ctx, "tcp", hostAddr)
	if err != nil {
		return nil, fmt.Errorf("failed to dial host: %w", err)
	}
	t, err := rhp3.NewRenterTransport(conn, hostKey)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to create transport: %w", err)
	}

	return &Session{
		hostKey: hostKey,
		t:       t,
	}, nil
}
