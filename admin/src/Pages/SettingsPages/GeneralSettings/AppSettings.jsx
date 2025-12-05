import React from "react";

const AppSettings = ({
  setVersion,
  version,
  mainDesc,
  setMainDesc,
  updateDesc,
  setUpdateDesc,
  maintenance,
  setMetMaintenance,
  cancelOption,
  setCancelOption,
}) => {
  return (
    <>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          Maintenance :-
        </label>
        <div className="col-md-10 mt-2">
          <input
            type="checkbox"
            id="switch1"
            switch="none"
            defaultChecked={maintenance}
            onChange={(e) => setMetMaintenance(!maintenance)}
          />
          <label for="switch1" data-on-label="On" data-off-label="Off"></label>
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          New App Version Code :-
        </label>
        <div className="col-md-10">
          <input
            
            className="form-control"
            type="text"
            id="example-text-input"
            value={version}
            onChange={(e) => {
              setVersion(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          Maintenance Description :-
        </label>
        <div className="col-md-10">
          <input
            
            className="form-control"
            type="text"
            id="example-text-input"
            value={mainDesc}
            onChange={(e) => {
              setMainDesc(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          Update Description :-
        </label>
        <div className="col-md-10">
          <input
            
            className="form-control"
            type="text"
            id="example-text-input"
            value={updateDesc}
            onChange={(e) => {
              setUpdateDesc(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          Cancel Option :- <br></br>( Cancel button option will show in app
          update popup )
        </label>
        <div className="col-md-10 mt-2">
          <input
            type="checkbox"
            id="switch2"
            switch="none"
            defaultChecked={cancelOption}
            onChange={(e) => setCancelOption(!cancelOption)}
          />
          <label for="switch2" data-on-label="On" data-off-label="Off"></label>
        </div>
      </div>
    </>
  );
};

export default AppSettings;
