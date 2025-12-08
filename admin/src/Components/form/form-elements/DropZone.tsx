import { useDropzone } from "react-dropzone";

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  accept?: { [key: string]: string[] }; // Allows custom accepted file types
  label?: string; // Optional custom label
  helperText?: string;
  previewFile?: File | string | null;
}

const DropzoneComponent: React.FC<DropzoneProps> = ({
  onDrop,
  accept = {
    "text/csv": [".csv"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  },
  label,
  helperText,
  previewFile,
}) => {

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
  });

  return (
    <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
      <form
        {...getRootProps()}
        className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
          ${isDragActive
            ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          }
        `}
        id="demo-upload"
      >
        <input {...getInputProps()} />

        <div className="dz-message flex flex-col items-center">


          {previewFile ? (
            <div className="my-4 text-center">
              {typeof previewFile === "string" ? (
                <img
                  src={previewFile}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded shadow"
                />
              ) : previewFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(previewFile)}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded shadow"
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Selected file: <strong>{previewFile.name}</strong>
                </p>
              )}
            </div>
          ) : (
            <>
              <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl text-center dark:text-white/90">
                {isDragActive ? "Drop Files Here" : label || "Drag & Drop Files Here"}
              </h4>

            </>
          )}


          {helperText && (
            <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
              {helperText}
            </span>
          )}
          <span className="font-medium underline text-theme-sm text-brand-500">
            Browse File
          </span>


        </div>
      </form>
    </div>
  );
};

export default DropzoneComponent;
