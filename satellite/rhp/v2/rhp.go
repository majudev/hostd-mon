package rhp

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"time"

	rhp2 "go.sia.tech/core/rhp/v2"
	"go.sia.tech/core/types"
)

const (
	defaultMaxMessageSize = 4096
	largeMaxMessageSize   = 1 << 20
)

type (
	// A Session is an RHP2 session with a host
	Session struct {
		hostKey types.PublicKey
		t       *rhp2.Transport

		settings rhp2.HostSettings
	}
)

// ScanSettings scans the host's settings and returns them.
func (s *Session) ScanSettings() (settings rhp2.HostSettings, err error) {
	s.t.SetDeadline(time.Now().Add(30 * time.Second))
	defer s.t.SetDeadline(time.Time{})
	if err := s.t.WriteRequest(rhp2.RPCSettingsID, nil); err != nil {
		return rhp2.HostSettings{}, fmt.Errorf("failed to send settings request: %w", err)
	}
	var settingsResp rhp2.RPCSettingsResponse
	if err := s.t.ReadResponse(&settingsResp, defaultMaxMessageSize); err != nil {
		return rhp2.HostSettings{}, fmt.Errorf("failed to read settings response: %w", err)
	} else if err := json.Unmarshal(settingsResp.Settings, &settings); err != nil {
		return rhp2.HostSettings{}, fmt.Errorf("failed to unmarshal settings: %w", err)
	}
	s.settings = settings
	return
}

// Close closes the underlying connection.
func (s *Session) Close() error {
	return s.t.Close()
}

// NewSession creates a new RHP2 session with a host. It is not safe for
// concurrent use.
func NewSession(ctx context.Context, hostKey types.PublicKey, hostAddr string) (*Session, error) {
	conn, err := (&net.Dialer{}).DialContext(ctx, "tcp", hostAddr)
	if err != nil {
		return nil, fmt.Errorf("failed to dial host: %w", err)
	}
	t, err := rhp2.NewRenterTransport(conn, hostKey)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to create transport: %w", err)
	}

	return &Session{
		hostKey: hostKey,
		t:       t,
	}, nil
}
