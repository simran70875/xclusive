import React from 'react'

const WalletCoinSettings = ({
    minWalletAmount,
    setMinWalletAmount,
    minCoinsAmount,
    setMinCoinsAmount,
    CoinsAmount,
    setCoinsAmount,
    setReviewAmount,
    reviewAmount
}) => {
    return (
        <>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    Minimum Amount for Add in wallet :-
                </label>
                <div className="col-md-10">
                    <input
                        min={1}
                        className="form-control"
                        type="number"
                        id="example-number-input"
                        value={minWalletAmount}
                        onChange={(e) => {
                            setMinWalletAmount(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    Minimum Amount for coins withdrawal in wallet :-
                </label>
                <div className="col-md-10">
                    <input
                        min={1}
                        className="form-control"
                        type="number"
                        id="example-number-input"
                        value={minCoinsAmount}
                        onChange={(e) => {
                            setMinCoinsAmount(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    Review Reward Amount :-
                </label>
                <div className="col-md-10">
                    <input
                        min={1}
                        className="form-control"
                        type="number"
                        id="example-number-input"
                        value={reviewAmount}
                        onChange={(e) => {
                            setReviewAmount(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    Coins Per Amount :- <br></br>
                    (ex. 2 coins = 1₹)
                </label>
                <div className="col-md-10">
                    <input
                        min={1}
                        className="form-control"
                        type="number"
                        id="example-number-input"
                        value={CoinsAmount}
                        onChange={(e) => {
                            setCoinsAmount(e.target.value);
                        }}
                    />
                </div>
            </div>
        </>
    )
}

export default WalletCoinSettings
