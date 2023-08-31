package api

import (
	"net/http"

	"go.sia.tech/jape"
	"go.uber.org/zap"
)

const stdTxnSize = 1200

// checkServerError conditionally writes an error to the response if err is not
// nil.
func (a *api) checkServerError(c jape.Context, context string, err error) bool {
	if err != nil {
		c.Error(err, http.StatusInternalServerError)
		a.log.Warn(context, zap.Error(err))
	}
	return err == nil
}

func (a *api) handlePOSTScan(c jape.Context) {
	var req ScanRequest
	if err := c.Decode(&req); err != nil {
		return
	}
	settings, err := a.bench.ScanHost(c.Request.Context(), req.Address, req.HostKey)
	if !a.checkServerError(c, "failed to scan", err) {
		return
	}
	c.Encode(settings)
}

func parseLimitParams(c jape.Context, defaultLimit, maxLimit int) (limit, offset int) {
	if err := c.DecodeForm("limit", &limit); err != nil {
		return
	} else if err := c.DecodeForm("offset", &offset); err != nil {
		return
	}
	if limit > maxLimit {
		limit = maxLimit
	} else if limit <= 0 {
		limit = defaultLimit
	}

	if offset < 0 {
		offset = 0
	}
	return
}
