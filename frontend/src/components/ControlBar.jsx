const ControlBar = () => {
  return (
    <div className="bg-gray-800 text-white p-4 flex justify-center space-x-4">
      <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Previous</button>
      <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Next</button>
      <button className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">End Presentation</button>
    </div>
  );
};

export default ControlBar;