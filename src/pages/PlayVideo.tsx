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
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-red-900/30 group-hover:border-red-500 transition-all shadow-md group-hover:shadow-red-900/20">
        <video className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" preload="metadata" muted>
          <source src={video.Url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-red-600/90 text-white rounded-full p-3 backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform">
            <FaPlay className="text-xl ml-1" />
          </div>
        </div>
        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wide">
          NEW
        </div>
      </div>
      <div className="mt-3 px-1">
        <h3 className="text-neutral-200 font-medium text-sm line-clamp-2 group-hover:text-red-400 transition-colors">{video.Judul}</h3>
      </div>
    </div>
);
  
const RecentPostsView = ({ videos, onCardClick }: { videos: any[], onCardClick: (videoId: string) => void }) => (
    <div className="mb-10 border-t border-red-900/20 pt-8">
      <h2 className="text-xl font-bold mb-5 text-red-100 flex items-center">
        <span className="w-1 h-6 bg-red-600 mr-3 rounded-full"></span>
        Recent Posts
      </h2>
      <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-neutral-900">
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
    'https://otieu.com/4/10266117',
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
            "primaryColor": "#ef4444",
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
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <FaSpinner className="animate-spin text-4xl text-red-600 mb-4" />
            <p className="text-red-200">Loading content...</p>
        </div>
    );
  }
  
  if (id && !videoFound) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <div className="bg-red-900/20 p-6 rounded-full mb-6">
            <FaExclamationTriangle size={48} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Video Not Found</h1>
        <p className="text-neutral-400 max-w-md mb-8">
          Sorry, the video you are looking for does not exist or may have been removed.
        </p>
        <Link to="/" className="px-6 py-2 bg-red-700 hover:bg-red-600 text-white font-medium rounded-full transition-colors shadow-lg shadow-red-900/20">
            Go to Homepage
        </Link>
      </div>
    );
  }
  
  const PlayerView = () => (
    <div className="bg-neutral-900 border border-red-900/20 p-5 rounded-2xl shadow-xl shadow-black/50 mb-10">
      <h1 className="text-xl md:text-2xl font-bold mb-5 text-center break-words text-red-500 tracking-wide">{videoTitle}</h1>
      
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black border border-neutral-800 relative z-10">
        {isBuffering && (
            <div className='absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white'>
                <FaSpinner className="animate-spin text-5xl text-red-600 mb-4" />
                <p className='text-red-200 font-medium tracking-wide'>Preparing secure stream...</p>
            </div>
        )}
        <video id="video-player" style={{width: '100%', height: '100%'}} key={blobUrl}>
            <source src={blobUrl} type="video/mp4" />
        </video>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="md:col-span-2 flex items-center bg-neutral-950 border border-red-900/30 rounded-lg overflow-hidden">
            <input 
                type="text" 
                value={`https://${window.location.hostname}/play/${id}`} 
                readOnly 
                className="flex-1 p-3 bg-transparent text-neutral-300 outline-none text-sm font-mono" 
            />
            <button onClick={handleCopy} className="bg-neutral-800 hover:bg-red-900/50 text-red-400 p-3 border-l border-red-900/30 transition-colors">
                <FaCopy />
            </button>
        </div>
        <button onClick={handleDownloadClick} className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white py-3 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-red-900/20 transition-all transform active:scale-95">
            <FaDownload className="mr-2" />
            Download Video
        </button>
      </div>
    </div>
  );

  const pageTitle = query ? `Search Results for "${query}"` : "More Videos";

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 text-neutral-200">
      {id && videoFound && <PlayerView />}
      
      {id && videoFound && recentVideos.length > 0 && <RecentPostsView videos={recentVideos} onCardClick={handleCardClick} />}

      { (query || id) && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6 text-red-100 flex items-center">
            <span className="w-1 h-6 bg-red-600 mr-3 rounded-full"></span>
            {pageTitle}
          </h2>
          
          {currentVideos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {currentVideos.map((video) => (
                  <div onClick={() => handleCardClick(video.id)} key={video.id} className="group transition-all cursor-pointer">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 group-hover:border-red-500 shadow-sm group-hover:shadow-red-900/30 transition-all duration-300">
                        <video className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" preload="metadata" muted>
                            <source src={video.Url} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="bg-red-600/90 p-3 rounded-full text-white transform scale-75 group-hover:scale-100 transition-transform">
                                <FaPlay className="text-lg ml-1" />
                            </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-neutral-300 font-medium text-sm leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">{video.Judul}</h3>
                      </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-neutral-900/50 rounded-lg border border-red-900/10">
                <p className='text-neutral-400'>
                    {query ? 'No videos found for your search.' : ''}
                </p>
            </div>
          )}

          {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    className="bg-neutral-800 hover:bg-red-900 text-white py-2 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-neutral-700"
                >
                  Previous
                </button>
                <span className="text-red-200 font-mono text-sm bg-red-900/20 px-4 py-2 rounded-full border border-red-900/30">
                  {currentPage} / {totalPages}
                </span>
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                    className="bg-neutral-800 hover:bg-red-900 text-white py-2 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-neutral-700"
                >
                  Next
                </button>
              </div>
          )}
        </div>
      )}
    </div>
  );
}
