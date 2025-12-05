import React from "react";

const GeneralSettings = ({
  hostEmail,
  setHostEmail,
  appName,
  setAppName,
  appLogo,
  setAppLogo,
  previewImage,
  author,
  setAuthor,
  contact,
  setContact,
  website,
  setWebsite,
  developBy,
  setDevelopBy,
  setYoutubeVideo,
  youtubeVideo,
  setMemberShipVideo,
  memberShipVideo,
}) => {
  return (
    <>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          Host Email:
        </label>
        <div className="col-md-10">
          <input
            // required
            className="form-control"
            type="email"
            id="example-text-input"
            value={hostEmail}
            onChange={(e) => {
              setHostEmail(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          App Name:
        </label>
        <div className="col-md-10">
          <input
            required
            className="form-control"
            type="text"
            id="example-text-input"
            value={appName}
            onChange={(e) => {
              setAppName(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          App Logo:
        </label>
        <div className="col-md-10">
          <input
            className="form-control"
            type="file"
            onChange={(e) => {
              setAppLogo(e.target.files[0]);
            }}
            id="example-text-input"
          />
          <div className="fileupload_img col-md-10 mt-3">
            <img
              style={{ width: "200px", height: "auto" }}
              type="image"
              src={appLogo ? URL.createObjectURL(appLogo) : `${previewImage}`}
              alt="App Logo"
            />
          </div>
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          App YouTube Video:
        </label>
        <div className="col-md-10">
          <input
            // required
            className="form-control"
            type="text"
            id="example-text-input"
            value={youtubeVideo}
            onChange={(e) => {
              setYoutubeVideo(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          App MemberShip Video:
        </label>
        <div className="col-md-10">
          <input
            // required
            className="form-control"
            type="text"
            id="example-text-input"
            value={memberShipVideo}
            onChange={(e) => {
              setMemberShipVideo(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          Author:
        </label>
        <div className="col-md-10">
          <input
            // required
            className="form-control"
            type="text"
            id="example-text-input"
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          Contact:
        </label>
        <div className="col-md-10">
          <input
            // required
            className="form-control"
            type="text"
            id="example-text-input"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          Website:
        </label>
        <div className="col-md-10">
          <input
            // required
            className="form-control"
            type="text"
            id="example-text-input"
            value={website}
            onChange={(e) => {
              setWebsite(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="example-text-input" className="col-md-2 col-form-label">
          Develope By:
        </label>
        <div className="col-md-10">
          <input
            // required
            className="form-control"
            type="text"
            id="example-text-input"
            value={developBy}
            onChange={(e) => {
              setDevelopBy(e.target.value);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default GeneralSettings;
