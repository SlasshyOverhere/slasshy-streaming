import React, { useState, useEffect } from 'react';
import { User, TabType, Recommendation, PlaybackState } from '../types';
import { searchTMDB, getDetailedMediaInfo } from '../services/tmdbService';
import { getVideoUrl } from '../services/tmdbService';
import { Button } from './ui/Button';
import { StarsBackground } from './ui/StarsBackground';
import { ShootingStars } from './ui/ShootingStars';
import { SlideTabs } from './ui/slide-tabs';
import { HeroPill, StarIcon } from './ui/HeroPill';
import { useNotification } from '../hooks/useNotification';
import {
  Clapperboard,
  LogOut,
  Search,
  Tv,
  Film,
  Zap,
  Play,
  MonitorPlay,
  Sparkles,
  X,
  Maximize2,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // 'Discovery' is the AI Search, 'Console' is the Direct ID input
  const [viewMode, setViewMode] = useState<'Discovery' | 'Console'>('Discovery');

  const [activeTab, setActiveTab] = useState<TabType>('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [tmdbId, setTmdbId] = useState('');
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // State for detailed media view
  const [detailedMedia, setDetailedMedia] = useState<any>(null);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Get notification configuration
  const notification = useNotification();

  useEffect(() => {
    // Show notification popup on initial load if notification exists
    if (notification && notification.text) {
      // Use a slight delay to ensure UI is fully loaded before showing the popup
      const timer = setTimeout(() => {
        setShowNotificationPopup(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    setRecommendations([]);
  }, [notification]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingAI(true);
    const results = await searchTMDB(searchQuery, activeTab);
    setRecommendations(results);
    setIsSearchingAI(false);
  };

  const handlePlay = () => {
    if (!tmdbId) return;

    const mediaType = activeTab === 'movies' ? 'movie' : 'tv';
    const episodeNum = parseInt(episode);
    const seasonNum = parseInt(season);

    const url = getVideoUrl(
      parseInt(tmdbId),
      mediaType,
      mediaType === 'tv' ? seasonNum : undefined,
      mediaType === 'tv' ? episodeNum : undefined
    );

    setVideoUrl(url);
    setPlaybackState(PlaybackState.LOADING);

    // Simulate loading delay then switch to playing state
    setTimeout(() => {
      setPlaybackState(PlaybackState.PLAYING);
    }, 1500);
  };

  const handleClosePlayer = () => {
    setPlaybackState(PlaybackState.IDLE);
    setVideoUrl(null);
  };

  // Function to show detailed media information
  const showDetailedMedia = async (id: number, title: string) => {
    setIsFetchingDetails(true);
    try {
      // Determine the media type based on active tab
      const mediaType = activeTab === 'movies' || activeTab === 'anime' ? 'movie' : 'tv';
      const details = await getDetailedMediaInfo(id, mediaType as 'movie' | 'tv');

      if (details) {
        setDetailedMedia(details);
        setIsDetailedViewOpen(true);
      }
    } catch (error) {
      console.error('Error fetching detailed media info:', error);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Function to play media from detailed view
  const playMediaFromDetails = () => {
    if (detailedMedia) {
      setTmdbId(detailedMedia.id.toString());
      setViewMode('Console');
      setIsDetailedViewOpen(false);
    }
  };

  // Calculate active index for SlideTabs
  const viewModeIndex = viewMode === 'Discovery' ? 0 : 1;

  return (
    <div className="relative h-screen w-full bg-neutral-950 text-white overflow-hidden selection:bg-red-500/30 flex flex-col">

      {/* 3D Background Effects */}
      <div className="fixed inset-0 z-0 opacity-70 pointer-events-none">
         <StarsBackground />
         <ShootingStars />
      </div>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />

      {/* Fixed Navbar */}
      <nav className="relative z-50 mx-auto w-full max-w-7xl px-6 pt-6">
        <div className="flex h-16 items-center justify-between rounded-full border border-white/10 bg-black/60 px-6 shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 shadow-red-500/20 shadow-lg">
              <Clapperboard className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-white text-lg hidden sm:block">Slasshy</span>
          </div>

          {/* Center Tabs using SlideTabs */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <SlideTabs
              tabs={["TMDB Discovery", "Developer Console"]}
              activeTab={viewModeIndex}
              onChange={(idx) => setViewMode(idx === 0 ? 'Discovery' : 'Console')}
            />
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-medium text-neutral-300">{user.email}</span>
             </div>
             <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors"
             >
               <LogOut className="h-5 w-5" />
             </Button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="mt-4 flex justify-center md:hidden">
           <SlideTabs
              tabs={["TMDB Discovery", "Console"]}
              activeTab={viewModeIndex}
              onChange={(idx) => setViewMode(idx === 0 ? 'Discovery' : 'Console')}
            />
        </div>
      </nav>

      {/* Main Content Area - No global scrollbar, internal scrolling if needed */}
      <main className="flex-1 relative z-10 w-full overflow-hidden flex flex-col">

        {/* AI DISCOVERY VIEW */}
        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${viewMode === 'Discovery' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
           <div className="h-full w-full flex flex-col items-center pt-8 pb-8">

              {/* Content Type Selector */}
              <div className="mb-8 flex justify-center shrink-0">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-xl">
                  {(['movies', 'tv', 'anime'] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all duration-300 ${
                        activeTab === tab
                          ? 'bg-neutral-800 text-white shadow-lg'
                          : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                      }`}
                    >
                      {tab === 'movies' && <Film className="h-3 w-3" />}
                      {tab === 'tv' && <Tv className="h-3 w-3" />}
                      {tab === 'anime' && <Zap className="h-3 w-3" />}
                      <span className="capitalize">{tab}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="w-full max-w-2xl px-4 shrink-0 mb-6">
                <div className="relative group">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-red-500 opacity-30 blur transition duration-500 group-hover:opacity-60" />
                  <div className="relative flex items-center rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl backdrop-blur-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900">
                      <Search className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                      placeholder={`Search for ${activeTab}...`}
                      className="flex-1 bg-transparent px-4 py-2 text-base text-white placeholder:text-neutral-500 focus:outline-none"
                    />
                    <Button
                      onClick={handleAiSearch}
                      isLoading={isSearchingAI}
                      className="rounded-xl bg-white text-black hover:bg-neutral-200 font-semibold border-none h-9 px-4 shadow-none"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results Area - Scrollable */}
              <div className="w-full max-w-6xl flex-1 overflow-y-auto px-4 no-scrollbar pb-24">
                {recommendations.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 opacity-60">
                      <Sparkles className="h-12 w-12 mb-4 text-neutral-700" />
                      <p>Enter a search query to discover content.</p>
                   </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
                    {recommendations.map((rec, idx) => (
                      <div
                        key={rec.fakeId}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:border-red-500/30 hover:bg-white/5 cursor-pointer"
                        style={{ animationDelay: `${idx * 100}ms` }}
                        onClick={() => {
                          showDetailedMedia(rec.fakeId, rec.title);
                        }}
                      >
                        {rec.imageUrl && (
                          <div className="relative aspect-[3/4] h-48 overflow-hidden">
                            <img
                              src={rec.imageUrl}
                              alt={rec.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          </div>
                        )}
                        <div className="p-5 flex-1">
                          <div className="flex items-center justify-between mb-3">
                             <h4 className="text-lg font-bold text-white line-clamp-1 mr-2">{rec.title}</h4>
                             <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                               {rec.year}
                             </span>
                          </div>
                          <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{rec.description}</p>
                          {rec.reason && rec.reason.trim() !== '' && (
                            <div className="relative rounded-lg bg-black/30 p-2 border border-white/5">
                              <div className="absolute top-0 left-0 w-0.5 h-full bg-red-600 rounded-l-lg opacity-50" />
                              <p className="text-xs italic text-neutral-500 pl-2 line-clamp-2">"{rec.reason}"</p>
                            </div>
                          )}
                        </div>
                        <div className="px-5 py-3 bg-black/20 border-t border-white/5">
                          <div className="flex w-full items-center justify-between text-xs font-medium text-neutral-400 group-hover:text-red-500 transition-colors">
                            <span>Use ID {rec.fakeId}</span>
                            <ChevronRight className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* DEVELOPER CONSOLE VIEW */}
        <div className={`absolute inset-0 transition-all duration-500 ease-in-out flex items-center justify-center ${viewMode === 'Console' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
           <div className="w-full max-w-2xl px-6">
              <div className="relative overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-900/30 p-1 backdrop-blur-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />

                <div className="relative rounded-[1.8rem] border border-white/5 bg-black/60 p-8 md:p-10">
                  <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Developer Console</h2>
                        <p className="text-sm text-neutral-400">Direct TMDB Resource Injection</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 rounded-xl bg-neutral-900 border border-white/10 p-2 pr-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800">
                            <Maximize2 className="h-4 w-4 text-neutral-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase">Mode</span>
                            <span className="text-xs font-semibold text-white capitalize">{activeTab}</span>
                        </div>
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div>
                        <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Resource ID</label>
                        <div className="relative group">
                            <MonitorPlay className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
                            <input
                              type="number"
                              placeholder="e.g., 550"
                              value={tmdbId}
                              onChange={(e) => setTmdbId(e.target.value)}
                              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/50 py-3 pl-12 pr-4 text-lg text-white placeholder:text-neutral-700 focus:border-red-500 focus:bg-neutral-900 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all font-mono"
                            />
                        </div>
                      </div>

                      {activeTab !== 'movies' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Season</label>
                            <input
                              type="number"
                              value={season}
                              onChange={(e) => setSeason(e.target.value)}
                              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/50 py-3 px-4 text-center text-lg text-white focus:border-red-500 focus:bg-neutral-900 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all font-mono"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Episode</label>
                            <input
                              type="number"
                              value={episode}
                              onChange={(e) => setEpisode(e.target.value)}
                              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/50 py-3 px-4 text-center text-lg text-white focus:border-red-500 focus:bg-neutral-900 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all font-mono"
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handlePlay}
                        variant="shimmer"
                        className="w-full h-12 rounded-xl text-base font-bold mt-2"
                      >
                        Initialize Stream
                      </Button>
                  </div>
                </div>
              </div>
           </div>
        </div>

      </main>

      {/* Video Player Modal */}
      {playbackState !== PlaybackState.IDLE && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4 animate-fade-in-up">
           <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl ring-1 ring-white/10">
              <button
                className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-red-600 transition-colors border border-white/10"
                onClick={handleClosePlayer}
              >
                <X className="h-4 w-4" />
              </button>

              {playbackState === PlaybackState.LOADING ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-neutral-950">
                   <div className="relative">
                      <div className="h-12 w-12 rounded-full border-2 border-neutral-800 border-t-red-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="h-6 w-6 rounded-full bg-red-600/20 blur-xl" />
                      </div>
                   </div>
                   <div className="text-center space-y-1">
                      <h3 className="text-lg font-semibold text-white">Establishing Connection</h3>
                      <p className="text-neutral-500 font-mono text-xs">Target ID: {tmdbId}</p>
                   </div>
                </div>
              ) : (
                videoUrl ? (
                  <iframe
                    src={videoUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`Video player for ${tmdbId}`}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950">
                    {/* Fallback if video URL is not available */}
                    <div className="text-center space-y-6 p-8 max-w-2xl">
                      <div className="inline-flex p-6 rounded-3xl bg-neutral-900 border border-neutral-800 mb-4 shadow-[0_0_60px_-15px_rgba(220,38,38,0.3)]">
                        <Play className="h-12 w-12 text-white fill-white ml-1" />
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold text-white mb-2">Stream Active</h2>
                          <p className="text-base text-neutral-400">
                            Displaying content for ID: <span className="text-red-500 font-mono font-bold">{tmdbId}</span>
                          </p>
                          {activeTab !== 'movies' && (
                             <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
                                <span className="text-xs font-medium text-neutral-300">S{season}</span>
                                <div className="h-3 w-px bg-white/10" />
                                <span className="text-xs font-medium text-neutral-300">E{episode}</span>
                             </div>
                          )}
                      </div>
                    </div>
                  </div>
                )
              )}
           </div>
        </div>
      )}

      {/* Detailed Media Modal */}
      {isDetailedViewOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-7xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-neutral-900 to-black rounded-3xl border border-white/20 shadow-2xl shadow-black/50">
            {isFetchingDetails ? (
              <div className="flex items-center justify-center h-96">
                <div className="h-16 w-16 rounded-full border-4 border-neutral-800 border-t-red-600 animate-spin" />
              </div>
            ) : detailedMedia ? (
              <>
                {/* Backdrop image with overlay */}
                <div className="relative h-80 overflow-hidden rounded-t-3xl">
                  {detailedMedia.backdrop_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/original${detailedMedia.backdrop_path}`}
                      alt={detailedMedia.title || detailedMedia.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black"></div>

                  <button
                    className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-red-600 transition-colors border border-white/20 shadow-lg"
                    onClick={() => setIsDetailedViewOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content scrollable area with hidden scrollbar */}
                <div className="overflow-y-auto h-[calc(95vh-20rem)] scrollbar-hide">
                  <div className="p-8 pt-8">
                    <div className="flex items-start gap-8">
                      {detailedMedia.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${detailedMedia.poster_path}`}
                          alt={detailedMedia.title || detailedMedia.name}
                          className="w-52 h-72 object-cover rounded-2xl border-4 border-white/20 shadow-2xl shadow-black/50 sticky top-8"
                        />
                      )}
                      <div className="flex-1">
                        <h2 className="text-4xl font-bold text-white mb-3">
                          {detailedMedia.title || detailedMedia.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-neutral-300 text-sm mb-5">
                          <span className="px-3 py-1 bg-white/10 rounded-full">{detailedMedia.release_date ? new Date(detailedMedia.release_date).getFullYear() : detailedMedia.first_air_date ? new Date(detailedMedia.first_air_date).getFullYear() : 'N/A'}</span>
                          <span>
                            {detailedMedia.runtime
                              ? `${Math.floor(detailedMedia.runtime / 60)}h ${detailedMedia.runtime % 60}m`
                              : detailedMedia.number_of_seasons
                                ? `${detailedMedia.number_of_seasons} Season${detailedMedia.number_of_seasons > 1 ? 's' : ''}`
                                : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                            <span>⭐ {detailedMedia.vote_average?.toFixed(1) || 'N/A'}</span>
                          </span>
                        </div>
                        <p className="text-neutral-300 text-lg mb-6 max-w-3xl">
                          {detailedMedia.overview || 'No overview available'}
                        </p>
                        <div className="flex flex-wrap gap-3 mb-6">
                          {detailedMedia.genres?.slice(0, 5).map((genre: any) => (
                            <span
                              key={genre.id}
                              className="px-4 py-2 bg-gradient-to-r from-red-900/50 to-purple-900/50 rounded-full text-sm text-white border border-white/20"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4">
                          <Button
                            onClick={playMediaFromDetails}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full px-8 py-4 font-bold text-lg shadow-lg shadow-red-500/20"
                          >
                            <Play className="h-6 w-6 mr-2" />
                            Play Now
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Additional details section */}
                    <div className="mt-8">
                      {detailedMedia.credits?.cast && detailedMedia.credits.cast.length > 0 && (
                        <div className="mb-10">
                          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>👥</span> Cast
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                            {detailedMedia.credits.cast.slice(0, 12).map((person: any, index: number) => (
                              <div key={index} className="text-center">
                                {person.profile_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                                    alt={person.name}
                                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white/20 shadow-lg"
                                  />
                                ) : (
                                  <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border-2 border-white/20">
                                    <span className="text-xs text-neutral-500">No Image</span>
                                  </div>
                                )}
                                <p className="text-white font-medium mt-3 text-sm truncate">{person.name}</p>
                                <p className="text-neutral-400 text-xs mt-1 truncate">{person.character}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {detailedMedia.reviews?.results && detailedMedia.reviews.results.length > 0 && (
                        <div className="mb-10">
                          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>📝</span> Reviews
                          </h3>
                          <div className="space-y-6">
                            {detailedMedia.reviews.results.slice(0, 3).map((review: any, index: number) => (
                              <div key={index} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <p className="text-neutral-300 italic">"{review.content}"</p>
                                <div className="flex justify-between items-center mt-4">
                                  <p className="text-neutral-500">- {review.author}</p>
                                  {review.author_details?.rating && (
                                    <span className="flex items-center gap-1 text-yellow-400">
                                      ⭐ {review.author_details.rating}/10
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-white">
                <p className="text-xl">Error loading media details.</p>
                <Button
                  onClick={() => setIsDetailedViewOpen(false)}
                  className="mt-6 px-6 py-3"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Centered Notification Popup */}
      {showNotificationPopup && notification && notification.text && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-neutral-900 border border-white/20 rounded-2xl shadow-2xl p-6 transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="bg-red-500 rounded-full p-2 mr-3 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="white"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Notification</h3>
              </div>
              <button
                onClick={() => setShowNotificationPopup(false)}
                className="text-neutral-400 hover:text-white rounded-full p-1"
                aria-label="Close notification"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-neutral-300 mb-6">{notification.text}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowNotificationPopup(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
