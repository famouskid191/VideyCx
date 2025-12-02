import { FaDownload, FaFileVideo } from 'react-icons/fa';

export function Download() {
  const videoUrl = sessionStorage.getItem('videoUrl');
  const videoTitle = sessionStorage.getItem('videoTitle');

  const randomUrls = [
    'https://otieu.com/4/10266117',
  ];
  
  const handleDownload = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');

      setTimeout(() => {
        const randomUrl = randomUrls[Math.floor(Math.random() * randomUrls.length)];
        window.location.href = randomUrl;
      }, 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] text-white">
      <div className="w-full max-w-lg p-8 mx-4 bg-neutral-900 border border-red-900/20 rounded-2xl shadow-2xl shadow-black/50 text-center">
        <div className="mb-6 inline-block p-4 bg-red-900/10 rounded-full">
            <FaFileVideo size={48} className="text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-white">Ready to Download</h1>
        
        <p className="text-red-400 font-medium mb-8 text-lg break-words px-4">
          {videoTitle || 'Unknown Video'}
        </p>
        
        {videoUrl ? (
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-red-800 to-red-600 text-white py-4 px-6 rounded-xl flex items-center justify-center mx-auto hover:from-red-700 hover:to-red-500 transition-all transform active:scale-95 shadow-lg shadow-red-900/30 font-bold"
          >
            <FaDownload className="mr-3 text-xl" />
            Download Now
          </button>
        ) : (
          <div className="p-4 bg-red-900/10 rounded-lg border border-red-900/20">
            <p className="text-neutral-400">No video URL is available for download.</p>
          </div>
        )}
      </div>
    </div>
  );
}
