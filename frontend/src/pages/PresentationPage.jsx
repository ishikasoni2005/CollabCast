import SlideViewer from '../components/SlideViewer';
import ControlBar from '../components/ControlBar';

const PresentationPage = () => {
  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <SlideViewer />
      </div>
      <ControlBar />
    </div>
  );
};

export default PresentationPage;
