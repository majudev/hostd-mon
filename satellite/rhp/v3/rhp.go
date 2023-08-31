package rhp

import (
	"context"
	"crypto/ed25519"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"math/bits"
	"net"

	"go.sia.tech/core/consensus"
	rhp2 "go.sia.tech/core/rhp/v2"
	rhp3 "go.sia.tech/core/rhp/v3"
	"go.sia.tech/core/types"
)

type (
	// An accountPayment pays for usage using an ephemeral account
	accountPayment struct {
		Account    rhp3.Account
		PrivateKey types.PrivateKey
	}

	// A contractPayment pays for usage using a contract
	contractPayment struct {
		Revision      *rhp2.ContractRevision
		RefundAccount rhp3.Account
		RenterKey     types.PrivateKey
	}

	// A PaymentMethod facilitates payments to the host using either a contract
	// or an ephemeral account
	PaymentMethod interface {
		Pay(amount types.Currency, height uint64) (rhp3.PaymentMethod, bool)
	}
)

type (
	// A Session is an RHP3 session with the host
	Session struct {
		hostKey types.PublicKey
		t       *rhp3.Transport

		pt rhp3.HostPriceTable
	}
)

// Pay implements PaymentMethod
func (cp *contractPayment) Pay(amount types.Currency, height uint64) (rhp3.PaymentMethod, bool) {
	req, ok := rhp3.PayByContract(&cp.Revision.Revision, amount, cp.RefundAccount, cp.RenterKey)
	return &req, ok
}

// Pay implements PaymentMethod
func (ap *accountPayment) Pay(amount types.Currency, height uint64) (rhp3.PaymentMethod, bool) {
	expirationHeight := height + 6
	req := rhp3.PayByEphemeralAccount(ap.Account, amount, expirationHeight, ap.PrivateKey)
	return &req, true
}

// Revision retrieves the latest revision of the contract
func (s *Session) Revision(contractID types.FileContractID) (types.FileContractRevision, error) {
	stream := s.t.DialStream()
	defer stream.Close()

	req := rhp3.RPCLatestRevisionRequest{
		ContractID: contractID,
	}
	if err := stream.WriteRequest(rhp3.RPCLatestRevisionID, &req); err != nil {
		return types.FileContractRevision{}, fmt.Errorf("failed to write request: %w", err)
	}
	var resp rhp3.RPCLatestRevisionResponse
	if err := stream.ReadResponse(&resp, 4096); err != nil {
		return types.FileContractRevision{}, fmt.Errorf("failed to read response: %w", err)
	} else if err := stream.WriteResponse(&s.pt.UID); err != nil {
		return types.FileContractRevision{}, fmt.Errorf("failed to write price table uid: %w", err)
	}
	return resp.Revision, nil
}

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

// clearingRevision returns a revision that locks a contract and sets the missed
// proof outputs to the valid proof outputs.
func clearingRevision(revision types.FileContractRevision, outputValues []types.Currency) (types.FileContractRevision, error) {
	if revision.RevisionNumber == math.MaxUint64 {
		return types.FileContractRevision{}, errors.New("contract is locked")
	} else if len(outputValues) != len(revision.ValidProofOutputs) {
		return types.FileContractRevision{}, errors.New("incorrect number of outputs")
	}

	oldValid := revision.ValidProofOutputs
	revision.ValidProofOutputs = make([]types.SiacoinOutput, len(outputValues))
	for i := range outputValues {
		revision.ValidProofOutputs[i].Address = oldValid[i].Address
		revision.ValidProofOutputs[i].Value = outputValues[i]
	}
	revision.MissedProofOutputs = revision.ValidProofOutputs
	revision.RevisionNumber = math.MaxUint64
	revision.Filesize = 0
	revision.FileMerkleRoot = types.Hash256{}
	return revision, nil
}

func contractUnlockConditions(hostKey, renterKey types.UnlockKey) types.UnlockConditions {
	return types.UnlockConditions{
		PublicKeys:         []types.UnlockKey{renterKey, hostKey},
		SignaturesRequired: 2,
	}
}

// hashFinalRevision returns the hash of the final revision during contract renewal
func hashFinalRevision(clearing types.FileContractRevision, renewal types.FileContract) types.Hash256 {
	h := types.NewHasher()
	renewal.EncodeTo(h.E)
	clearing.EncodeTo(h.E)
	return h.Sum()
}

// HashRevision returns the hash of rev.
func hashRevision(rev types.FileContractRevision) types.Hash256 {
	h := types.NewHasher()
	rev.EncodeTo(h.E)
	return h.Sum()
}

func validateHostRevisionSignature(sig types.TransactionSignature, fcID types.FileContractID, sigHash types.Hash256, hostKey types.PublicKey) error {
	switch {
	case sig.ParentID != types.Hash256(fcID):
		return errors.New("revision signature has invalid parent ID")
	case sig.PublicKeyIndex != 1:
		return errors.New("revision signature has invalid public key index")
	case len(sig.Signature) != ed25519.SignatureSize:
		return errors.New("revision signature has invalid length")
	case len(sig.CoveredFields.SiacoinInputs) != 0:
		return errors.New("signature should not cover siacoin inputs")
	case len(sig.CoveredFields.SiacoinOutputs) != 0:
		return errors.New("signature should not cover siacoin outputs")
	case len(sig.CoveredFields.FileContracts) != 0:
		return errors.New("signature should not cover file contract")
	case len(sig.CoveredFields.StorageProofs) != 0:
		return errors.New("signature should not cover storage proofs")
	case len(sig.CoveredFields.SiafundInputs) != 0:
		return errors.New("signature should not cover siafund inputs")
	case len(sig.CoveredFields.SiafundOutputs) != 0:
		return errors.New("signature should not cover siafund outputs")
	case len(sig.CoveredFields.MinerFees) != 0:
		return errors.New("signature should not cover miner fees")
	case len(sig.CoveredFields.ArbitraryData) != 0:
		return errors.New("signature should not cover arbitrary data")
	case len(sig.CoveredFields.Signatures) != 0:
		return errors.New("signature should not cover signatures")
	case len(sig.CoveredFields.FileContractRevisions) != 1:
		return errors.New("signature should cover one file contract revision")
	case sig.CoveredFields.FileContractRevisions[0] != 0:
		return errors.New("signature should cover the first file contract revision")
	case !hostKey.VerifyHash(sigHash, *(*types.Signature)(sig.Signature)):
		return errors.New("revision signature is invalid")
	}
	return nil
}

// InitialRevision returns the first revision of a file contract formation
// transaction.
func initialRevision(formationTxn *types.Transaction, hostPubKey, renterPubKey types.UnlockKey) types.FileContractRevision {
	fc := formationTxn.FileContracts[0]
	return types.FileContractRevision{
		ParentID:         formationTxn.FileContractID(0),
		UnlockConditions: contractUnlockConditions(hostPubKey, renterPubKey),
		FileContract: types.FileContract{
			Filesize:           fc.Filesize,
			FileMerkleRoot:     fc.FileMerkleRoot,
			WindowStart:        fc.WindowStart,
			WindowEnd:          fc.WindowEnd,
			ValidProofOutputs:  fc.ValidProofOutputs,
			MissedProofOutputs: fc.MissedProofOutputs,
			UnlockHash:         fc.UnlockHash,
			RevisionNumber:     1,
		},
	}
}

// calculateRenewalPayouts calculates the contract payouts for the host.
func calculateRenewalPayouts(fc types.FileContract, newCollateral types.Currency, pt rhp3.HostPriceTable, endHeight uint64) (types.Currency, types.Currency, types.Currency, types.Currency) {
	// The host gets their contract fee, plus the cost of the data already in the
	// contract, plus their collateral. In the event of a missed payout, the cost
	// and collateral of the data already in the contract is subtracted from the
	// host, and sent to the void instead.
	//
	// However, it is possible for this subtraction to underflow: this can happen if
	// baseCollateral is large and MaxCollateral is small. We cannot simply replace
	// the underflow with a zero, because the host performs the same subtraction and
	// returns an error on underflow. Nor can we increase the valid payout, because
	// the host calculates its collateral contribution by subtracting the contract
	// price and base price from this payout, and we're already at MaxCollateral.
	// Thus the host has conflicting requirements, and renewing the contract is
	// impossible until they change their settings.

	// calculate base price and collateral
	// if the contract height did not increase both prices are zero
	basePrice := pt.RenewContractCost
	var baseCollateral types.Currency
	if contractEnd := uint64(endHeight + pt.WindowSize); contractEnd > fc.WindowEnd {
		timeExtension := uint64(contractEnd - fc.WindowEnd)
		basePrice = basePrice.Add(pt.WriteStoreCost.Mul64(fc.Filesize).Mul64(timeExtension))
		baseCollateral = pt.CollateralCost.Mul64(fc.Filesize).Mul64(timeExtension)
	}

	// calculate payouts
	hostValidPayout := pt.ContractPrice.Add(basePrice).Add(baseCollateral).Add(newCollateral)
	voidMissedPayout := basePrice.Add(baseCollateral)
	if hostValidPayout.Cmp(voidMissedPayout) < 0 {
		// TODO: detect this elsewhere
		panic("host's settings are unsatisfiable")
	}
	hostMissedPayout := hostValidPayout.Sub(voidMissedPayout)
	return hostValidPayout, hostMissedPayout, voidMissedPayout, basePrice
}

// NOTE: due to a bug in the transaction validation code, calculating payouts
// is way harder than it needs to be. Tax is calculated on the post-tax
// contract payout (instead of the sum of the renter and host payouts). So the
// equation for the payout is:
//
//	   payout = renterPayout + hostPayout + payout*tax
//	∴  payout = (renterPayout + hostPayout) / (1 - tax)
//
// This would work if 'tax' were a simple fraction, but because the tax must
// be evenly distributed among siafund holders, 'tax' is actually a function
// that multiplies by a fraction and then rounds down to the nearest multiple
// of the siafund count. Thus, when inverting the function, we have to make an
// initial guess and then fix the rounding error.
func taxAdjustedPayout(target types.Currency) types.Currency {
	// compute initial guess as target * (1 / 1-tax); since this does not take
	// the siafund rounding into account, the guess will be up to
	// types.SiafundCount greater than the actual payout value.
	guess := target.Mul64(1000).Div64(961)

	// now, adjust the guess to remove the rounding error. We know that:
	//
	//   (target % types.SiafundCount) == (payout % types.SiafundCount)
	//
	// therefore, we can simply adjust the guess to have this remainder as
	// well. The only wrinkle is that, since we know guess >= payout, if the
	// guess remainder is smaller than the target remainder, we must subtract
	// an extra types.SiafundCount.
	//
	// for example, if target = 87654321 and types.SiafundCount = 10000, then:
	//
	//   initial_guess  = 87654321 * (1 / (1 - tax))
	//                  = 91211572
	//   target % 10000 =     4321
	//   adjusted_guess = 91204321

	mod64 := func(c types.Currency, v uint64) types.Currency {
		var r uint64
		if c.Hi < v {
			_, r = bits.Div64(c.Hi, c.Lo, v)
		} else {
			_, r = bits.Div64(0, c.Hi, v)
			_, r = bits.Div64(r, c.Lo, v)
		}
		return types.NewCurrency64(r)
	}
	sfc := (consensus.State{}).SiafundCount()
	tm := mod64(target, sfc)
	gm := mod64(guess, sfc)
	if gm.Cmp(tm) < 0 {
		guess = guess.Sub(types.NewCurrency64(sfc))
	}
	return guess.Add(tm).Sub(gm)
}

func prepareContractRenewal(currentRevision types.FileContractRevision, renterAddress types.Address, renterKey types.PrivateKey, renterPayout, newCollateral types.Currency, hostKey types.PublicKey, hostAddr types.Address, host rhp3.HostPriceTable, endHeight uint64) (types.FileContract, types.Currency) {
	hostValidPayout, hostMissedPayout, voidMissedPayout, basePrice := calculateRenewalPayouts(currentRevision.FileContract, newCollateral, host, endHeight)
	renterPub := renterKey.PublicKey()
	return types.FileContract{
		Filesize:       currentRevision.Filesize,
		FileMerkleRoot: currentRevision.FileMerkleRoot,
		WindowStart:    uint64(endHeight),
		WindowEnd:      uint64(endHeight + host.WindowSize),
		Payout:         taxAdjustedPayout(renterPayout.Add(hostValidPayout)),
		UnlockHash: types.Hash256(types.UnlockConditions{
			PublicKeys: []types.UnlockKey{
				{Algorithm: types.SpecifierEd25519, Key: renterPub[:]},
				{Algorithm: types.SpecifierEd25519, Key: hostKey[:]},
			},
		}.UnlockHash()),
		RevisionNumber: 0,
		ValidProofOutputs: []types.SiacoinOutput{
			{Value: renterPayout, Address: renterAddress},
			{Value: hostValidPayout, Address: hostAddr},
		},
		MissedProofOutputs: []types.SiacoinOutput{
			{Value: renterPayout, Address: renterAddress},
			{Value: hostMissedPayout, Address: hostAddr},
			{Value: voidMissedPayout, Address: types.Address{}},
		},
	}, basePrice
}

// ContractPayment creates a new payment method for a contract
func ContractPayment(revision *rhp2.ContractRevision, renterKey types.PrivateKey, refundAccount rhp3.Account) PaymentMethod {
	return &contractPayment{
		Revision:      revision,
		RenterKey:     renterKey,
		RefundAccount: refundAccount,
	}
}

// AccountPayment creates a new payment method for an account
func AccountPayment(account rhp3.Account, privateKey types.PrivateKey) PaymentMethod {
	return &accountPayment{
		Account:    account,
		PrivateKey: privateKey,
	}
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
