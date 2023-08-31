package rhp

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"time"

	"go.sia.tech/core/consensus"
	rhp2 "go.sia.tech/core/rhp/v2"
	"go.sia.tech/core/types"
)

const (
	defaultMaxMessageSize = 4096
	largeMaxMessageSize   = 1 << 20
)

type (
	// A ChainManager is used to get the current consensus state
	ChainManager interface {
		TipState() consensus.State
	}

	// A Wallet funds and signs transactions
	Wallet interface {
		Address() types.Address
		FundTransaction(txn *types.Transaction, amount types.Currency) ([]types.Hash256, func(), error)
		SignTransaction(cs consensus.State, txn *types.Transaction, toSign []types.Hash256, cf types.CoveredFields) error
	}

	// A TPool manages transactions
	TPool interface {
		RecommendedFee() types.Currency
	}

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

// hashRevision is a helper function to hash a contract revision for signing.
func hashRevision(rev types.FileContractRevision) types.Hash256 {
	h := types.NewHasher()
	rev.EncodeTo(h.E)
	return h.Sum()
}

// explicitCoveredFields returns a CoveredFields that covers all elements
// present in txn.
func explicitCoveredFields(txn types.Transaction) (cf types.CoveredFields) {
	for i := range txn.SiacoinInputs {
		cf.SiacoinInputs = append(cf.SiacoinInputs, uint64(i))
	}
	for i := range txn.SiacoinOutputs {
		cf.SiacoinOutputs = append(cf.SiacoinOutputs, uint64(i))
	}
	for i := range txn.FileContracts {
		cf.FileContracts = append(cf.FileContracts, uint64(i))
	}
	for i := range txn.FileContractRevisions {
		cf.FileContractRevisions = append(cf.FileContractRevisions, uint64(i))
	}
	for i := range txn.StorageProofs {
		cf.StorageProofs = append(cf.StorageProofs, uint64(i))
	}
	for i := range txn.SiafundInputs {
		cf.SiafundInputs = append(cf.SiafundInputs, uint64(i))
	}
	for i := range txn.SiafundOutputs {
		cf.SiafundOutputs = append(cf.SiafundOutputs, uint64(i))
	}
	for i := range txn.MinerFees {
		cf.MinerFees = append(cf.MinerFees, uint64(i))
	}
	for i := range txn.ArbitraryData {
		cf.ArbitraryData = append(cf.ArbitraryData, uint64(i))
	}
	for i := range txn.Signatures {
		cf.Signatures = append(cf.Signatures, uint64(i))
	}
	return
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
