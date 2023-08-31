package benchmark

import (
	"context"
	"fmt"
	"net"
	"strings"

	"github.com/go-ping/ping"
	proto2 "github.com/majudev/hostd-mon/satellite/rhp/v2"
	proto3 "github.com/majudev/hostd-mon/satellite/rhp/v3"
	rhp2 "go.sia.tech/core/rhp/v2"
	rhp3 "go.sia.tech/core/rhp/v3"
	"go.sia.tech/core/types"
	"go.uber.org/zap"
)

type (
	// A Manager performs benchmarks and manages contracts
	Manager struct {
		log *zap.Logger
	}

	// Settings contains the settings scanned from a host.
	Settings struct {
		Settings   rhp2.HostSettings   `json:"settings"`
		PriceTable rhp3.HostPriceTable `json:"priceTable"`
		Ping       bool                `json:"ping"`
		//L4Ping     bool                `json:"l4ping"`
	}
)

// ScanHost scans the host at the given address and returns the settings.
func (m *Manager) ScanHost(ctx context.Context, hostAddr string, hostKey types.PublicKey) (Settings, error) {
	log := m.log.Named("scan").With(zap.String("host", hostAddr), zap.Stringer("hostKey", hostKey))
	// ping
	var pingOk = false
	log.Debug("sending ping packet")
	addrParts := strings.Split(hostAddr, ":")
	pinger, err := ping.NewPinger(addrParts[0])
	pinger.SetPrivileged(true)
	pinger.Count = 1
	err = pinger.Run()
	if err == nil {
		pingOk = (pinger.Statistics().PacketLoss == 0)
	}

	// start the RHP2 session
	log.Debug("opening RHP2 session")
	rhp2Session, err := proto2.NewSession(ctx, hostKey, hostAddr)
	if err != nil {
		return Settings{
			Ping: pingOk,
		}, fmt.Errorf("failed to create session: %w", err)
	}
	defer rhp2Session.Close()

	// scan the settings
	log.Debug("scanning settings")
	settings, err := rhp2Session.ScanSettings()
	if err != nil {
		return Settings{
			Ping: pingOk,
		}, fmt.Errorf("failed to scan settings: %w", err)
	}

	log.Debug("starting RHP3 session")

	// start the RHP3 session
	host, _, err := net.SplitHostPort(hostAddr)
	if err != nil {
		return Settings{
			Ping: pingOk,
		}, fmt.Errorf("failed to split host and port: %w", err)
	}
	rhp3Addr := net.JoinHostPort(host, settings.SiaMuxPort)
	rhp3Session, err := proto3.NewSession(ctx, hostKey, rhp3Addr)
	if err != nil {
		return Settings{
			Ping:     pingOk,
			Settings: settings,
		}, fmt.Errorf("failed to create session: %w", err)
	}
	defer rhp3Session.Close()

	// scan the price table
	log.Debug("scanning price table")
	pt, err := rhp3Session.ScanPriceTable()
	if err != nil {
		return Settings{
			Ping:     pingOk,
			Settings: settings,
		}, fmt.Errorf("failed to scan price table: %w", err)
	}
	log.Debug("got price table", zap.Stringer("storagePrice", pt.WriteStoreCost), zap.Stringer("ingressPrice", pt.UploadBandwidthCost), zap.Stringer("egressPrice", pt.DownloadBandwidthCost))

	return Settings{
		Ping:       pingOk,
		Settings:   settings,
		PriceTable: pt,
	}, nil
}

// New creates a new benchmark manager.
func New(log *zap.Logger) *Manager {
	return &Manager{
		log: log,
	}
}
