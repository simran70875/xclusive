import multer from "multer";

export const handleMulter = (upload) => {
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          type: "error",
          message:
            err.code === "LIMIT_FILE_SIZE"
              ? "Image size too large. Max 20MB allowed."
              : err.message,
        });
      } else if (err) {
        return res.status(500).json({
          type: "error",
          message: "Upload failed",
        });
      }
      next();
    });
  };
};
