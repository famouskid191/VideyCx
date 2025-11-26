import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { FaCopy, FaDownload, FaPlay, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { useLayout } from '../context/LayoutContext';

declare global {
  interface Window {
    fluidPlayer?: (elementId: string, options?: any) => any;
  }
}

const RecentPostCard = ({ video, onClick }: { video: any, onClick: (videoId: string) => void }) => (
    <div onClick={() => onClick(video.id)} className="group w-64 flex-shrink-0 cursor-pointer">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-gray-700 group-hover:border-blue-500 transition-all">
        <video className="w-full h-full object-cover" preload="metadata" muted>
          <source src={video.Url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <FaPlay className="text-white text-4xl" />
        </div>
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
          New
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-white font-medium text-sm line-clamp-2">{video.Judul}</h3>
      </div>
    </div>
);
  
const RecentPostsView = ({ videos, onCardClick }: { videos: any[], onCardClick: (videoId: string) => void }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-300">Recent Posts</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 -mb-4">
        {videos.map((video) => (
          <RecentPostCard key={video.id} video={video} onClick={onCardClick} />
        ))}
      </div>
    </div>
);

export function PlayVideo() {
  const { id: paramsId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  const query = searchParams.get('search') || '';
  const queryId = searchParams.get('v');
  const id = paramsId || queryId;

  const { setShowSearch } = useLayout();

  const [videoUrl, setVideoUrl] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string>(''); 
  const [isBuffering, setIsBuffering] = useState(false); 
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [videoFound, setVideoFound] = useState<boolean>(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const videosPerPage = 12;

  const playerInstance = useRef<any>(null);

  const randomUrls = [
    'https://otieu.com/4/10209209',
    'https://plumprush.com/cY2po8',
    'https://viiukuhe.com/dc/?blockID=406304'
  ];

  useEffect(() => {
    const fetchVideoData = async () => {
      setLoading(true);
      setBlobUrl('');
      setVideoFound(true);
      setShowSearch(false); 

      try {
        const response = await fetch('https://raw.githubusercontent.com/AgungDevlop/Viral/refs/heads/main/Video.json');
        const data = await response.json();
        
        setRecentVideos(data.slice(-10).reverse());

        if (id) {
            const video = data.find((item: { id: string }) => item.id === id);
            if (video) {
              setShowSearch(true);
              document.title = video.Judul;
              setVideoUrl(video.Url); 
              setVideoTitle(video.Judul);
              sessionStorage.setItem('videoUrl', video.Url);
              sessionStorage.setItem('videoTitle', video.Judul);

              setIsBuffering(true);
              try {
                const videoResponse = await fetch(video.Url);
                const videoBlob = await videoResponse.blob();
                const url = URL.createObjectURL(videoBlob);
                setBlobUrl(url);
              } catch (e) {
                setBlobUrl(video.Url);
              } finally {
                setIsBuffering(false);
              }
            } else {
              setVideoFound(false);
            }
        }
        setVideos(shuffleArray(data));
      } catch (error) {
        console.error('Error fetching video data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id || query) {
        fetchVideoData();
    } else {
        setLoading(false);
    }

    return () => {
        if (blobUrl && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
        }
        setShowSearch(false);
    };
  }, [id, query, setShowSearch]);
  
  useEffect(() => {
    if (!blobUrl) {
      return;
    }

    const handlePlayerEventRedirect = () => {
        const now = new Date().getTime();
        const lastRedirectTimestamp = sessionStorage.getItem('lastRedirectTimestamp');
        const fifteenSeconds = 15 * 1000;

        if (!lastRedirectTimestamp || (now - parseInt(lastRedirectTimestamp, 10)) > fifteenSeconds) {
            const randomUrl = randomUrls[Math.floor(Math.random() * randomUrls.length)];
            window.open(randomUrl, '_blank');
            sessionStorage.setItem('lastRedirectTimestamp', now.toString());
        }
    };

    const initPlayer = () => {
      if (playerInstance.current) {
        playerInstance.current.destroy();
      }
      if (typeof window.fluidPlayer === 'function') {
        playerInstance.current = window.fluidPlayer('video-player', {
          "layoutControls": {
            "controlBar": {
              "autoHideTimeout": 3,
              "animated": true,
              "autoHide": true
            },
            "htmlOnPauseBlock": {
              "html": null,
              "height": null,
              "width": null
            },
            "autoPlay": false,
            "mute": true,
            "allowTheatre": true,
            "playPauseAnimation": false,
            "playbackRateEnabled": false,
            "allowDownload": false,
            "playButtonShowing": true,
            "fillToContainer": false,
            "primaryColor": "#3b82f6",
            "posterImage": ""
          }
        });

        playerInstance.current.on('play', handlePlayerEventRedirect);
        playerInstance.current.on('pause', handlePlayerEventRedirect);
        playerInstance.current.on('seeked', handlePlayerEventRedirect);
      }
    };
    
    const checkInterval = setInterval(() => {
        if (typeof window.fluidPlayer === 'function') {
            clearInterval(checkInterval);
            initPlayer();
        }
    }, 100);

    return () => {
      clearInterval(checkInterval);
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [blobUrl, videoTitle]);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleCardClick = (videoId: string) => {
    window.open(`/play/${videoId}`, '_blank');
    setTimeout(() => {
      const randomUrl = randomUrls[Math.floor(Math.random() * randomUrls.length)];
      window.location.href = randomUrl;
    }, 500);
  };

  const handleCopy = () => {
    if(id) {
        navigator.clipboard.writeText(`https://${window.location.hostname}/play/${id}`);
        alert('Video link copied to clipboard!');
    }
  };

  const handleDownloadClick = () => {
    sessionStorage.setItem('videoUrl', videoUrl); 
    sessionStorage.setItem('videoTitle', videoTitle);
    window.open('/download', '_blank');
    setTimeout(() => {
      const randomUrl = randomUrls[Math.floor(Math.random() * randomUrls.length)];
      window.location.href = randomUrl;
    }, 500);
  };

  useEffect(() => {
    const results = query 
      ? videos.filter(video => video.Judul.toLowerCase().includes(query.toLowerCase()))
      : id ? videos : [];
    setFilteredVideos(results);
    setCurrentPage(1);
  }, [query, videos, id]);

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return <div className="text-center p-10 text-white">Loading...</div>;
  }
  
  if (id && !videoFound) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 text-center p-4">
        <FaExclamationTriangle size={64} className="mb-4 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-300">Video Not Found</h1>
        <p className="mt-2 max-w-md">
          Sorry, the video you are looking for does not exist or may have been removed.
        </p>
        <Link to="/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go to Homepage
        </Link>
      </div>
    );
  }
  
  const PlayerView = () => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-8">
      <h1 className="text-2xl font-bold mb-4 text-center break-words text-blue-400">{videoTitle}</h1>
      <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-gray-700 flex items-center justify-center bg-black">
        {isBuffering && (
            <div className='text-center text-white'>
                <FaSpinner className="animate-spin text-4xl text-blue-400 mx-auto" />
                <p className='mt-2'>Preparing secure video...</p>
            </div>
        )}
        <video id="video-player" style={{width: '100%', height: '100%'}} key={blobUrl}>
            <source src={blobUrl} type="video/mp4" />
        </video>
      </div>
      <div className="flex mt-4 mb-4 border border-gray-700 rounded-lg overflow-hidden">
        <input type="text" value={`https://${window.location.hostname}/play/${id}`} readOnly className="flex-1 p-3 bg-gray-900 text-white outline-none" />
        <button onClick={handleCopy} className="bg-blue-600 hover:bg-blue-700 transition-colors text-white p-3">
          <FaCopy />
        </button>
      </div>
      <button onClick={handleDownloadClick} className="w-full bg-blue-700 hover:bg-blue-600 transition-colors text-white py-3 rounded-lg flex items-center justify-center font-semibold shadow-md">
        <FaDownload className="mr-2" />
        Download
      </button>
    </div>
  );

  const pageTitle = query ? `Search Results for "${query}"` : "More Videos";

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 text-white">
      {id && videoFound && <PlayerView />}
      
      {id && videoFound && recentVideos.length > 0 && <RecentPostsView videos={recentVideos} onCardClick={handleCardClick} />}

      { (query || id) && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-300">{pageTitle}</h2>
          
          {currentVideos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentVideos.map((video) => (
                  <div onClick={() => handleCardClick(video.id)} key={video.id} className="group transition-all cursor-pointer">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-gray-700 group-hover:border-blue-500">
                        <video className="w-full h-full object-cover" preload="metadata" muted>
                            <source src={video.Url} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaPlay className="text-white text-4xl" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2">{video.Judul}</h3>
                      </div>
                  </div>
              ))}
            </div>
          ) : (
            <p className='text-gray-400'>
              {query ? 'No videos found for your search.' : ''}
            </p>
          )}

          {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="bg-gray-700 hover:bg-gray-600 transition-colors text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="bg-gray-700 hover:bg-gray-600 transition-colors text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
          )}
        </div>
      )}
    </div>
  );
}