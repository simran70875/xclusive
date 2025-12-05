import React from 'react'

const NotificationSettings = ({
    setOneAppId,
    setRestKey,
    setServerKey,
    setTwoFecApiKey,
    twoFecApiKey,
    serverKey,
    restKey,
    oneAppId,
    twoFecoptions,
    setTwoFecoptions
}) => {
    return (
        <>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    OneSignal App ID :-
                </label>
                <div className="col-md-10">
                    <input
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={oneAppId}
                        onChange={(e) => {
                            setOneAppId(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    OneSignal Rest Key :-
                </label>
                <div className="col-md-10">
                    <input
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={restKey}
                        onChange={(e) => {
                            setRestKey(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    Server Key :-
                </label>
                <div className="col-md-10">
                    <input
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={serverKey}
                        onChange={(e) => {
                            setServerKey(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    2 Factor API Key :-
                </label>
                <div className="col-md-10">
                    <input
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={twoFecApiKey}
                        onChange={(e) => {
                            setTwoFecApiKey(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    2 Factor Option :- <br></br>
                    ( This button option will show in live or not 2 Factor )
                </label>
                <div className="col-md-10 mt-2">
                    <input type="checkbox" id="switch2" switch="none" defaultChecked={twoFecoptions} onChange={(e) => setTwoFecoptions(!twoFecoptions)} />
                    <label for="switch2" data-on-label="On" data-off-label="Off"></label>
                </div>
            </div>
        </>
    )
}

export default NotificationSettings
