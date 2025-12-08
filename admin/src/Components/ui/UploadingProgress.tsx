import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const UploadingProgress = ({ percentage }: { percentage: number }) => {
  return (
    <div className="flex flex-col items-center mt-4">
      <div className="w-24 h-24">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textColor: '#3B82F6',
            pathColor: '#3B82F6',
            trailColor: '#E5E7EB',
          })}
        />
      </div>
      <p className="mt-2 text-blue-600 font-medium">Uploading...</p>
    </div>
  );
};


export default UploadingProgress;
