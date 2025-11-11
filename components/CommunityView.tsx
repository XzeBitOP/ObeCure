import React, { useState, useEffect, useCallback } from 'react';
import { VictoryPost } from '../types';
import PostVictoryModal from './PostVictoryModal';
import { BOT_VICTORY_POSTS } from '../data/botPosts';

const COMMUNITY_POSTS_KEY = 'obeCureCommunityPosts';
const LAST_BOT_POST_KEY = 'obeCureLastBotPostTimestamp';
const LAST_BOT_CHEER_KEY = 'obeCureLastBotCheerTimestamp';

// Bot action intervals
const BOT_POST_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
const BOT_CHEER_INTERVAL = 1 * 60 * 60 * 1000; // 1 hour

const CommunityView: React.FC = () => {
    const [posts, setPosts] = useState<VictoryPost[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const runBotActions = useCallback((currentPosts: VictoryPost[]): VictoryPost[] => {
        let updatedPosts = [...currentPosts];
        const now = Date.now();
        let needsSave = false;

        // Action 1: Maybe add a new post
        const lastBotPostTime = parseInt(localStorage.getItem(LAST_BOT_POST_KEY) || '0', 10);
        if (now - lastBotPostTime > BOT_POST_INTERVAL && Math.random() < 0.4) { // 40% chance
            const postText = BOT_VICTORY_POSTS[Math.floor(Math.random() * BOT_VICTORY_POSTS.length)];
            const newBotPost: VictoryPost = {
                id: crypto.randomUUID(),
                type: 'NSV',
                text: postText,
                cheers: Math.floor(Math.random() * 3), // Start with some cheers
                timestamp: new Date().toISOString(),
            };
            updatedPosts = [newBotPost, ...updatedPosts];
            localStorage.setItem(LAST_BOT_POST_KEY, String(now));
            needsSave = true;
        }

        // Action 2: Maybe add a cheer to an existing post
        const lastBotCheerTime = parseInt(localStorage.getItem(LAST_BOT_CHEER_KEY) || '0', 10);
        if (now - lastBotCheerTime > BOT_CHEER_INTERVAL && updatedPosts.length > 2 && Math.random() < 0.6) { // 60% chance
            const cheerIndex = Math.floor(Math.random() * (updatedPosts.length - 1)) + 1; // Don't cheer the newest post
            updatedPosts[cheerIndex].cheers += 1;
            localStorage.setItem(LAST_BOT_CHEER_KEY, String(now));
            needsSave = true;
        }

        if (needsSave) {
            return updatedPosts.slice(0, 50);
        }
        return currentPosts; // Return original if no changes
    }, []);


    const loadPosts = useCallback(() => {
        try {
            const postsRaw = localStorage.getItem(COMMUNITY_POSTS_KEY);
            let savedPosts = postsRaw ? JSON.parse(postsRaw) : [];
            
            // Seed initial posts if the wall is empty
            if (savedPosts.length === 0) {
                const initialPosts: VictoryPost[] = [
                    { id: crypto.randomUUID(), type: 'NSV', text: 'Chose water over soda today!', cheers: 2, timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
                    { id: crypto.randomUUID(), type: 'NSV', text: 'My clothes feel a little looser this week.', cheers: 5, timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString() },
                    { id: crypto.randomUUID(), type: 'NSV', text: 'Finished my workout even when I didn\'t feel like it.', cheers: 3, timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString() },
                ];
                savedPosts = initialPosts;
                localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(savedPosts));
            }

            const botUpdatedPosts = runBotActions(savedPosts);
            setPosts(botUpdatedPosts);

            if (botUpdatedPosts !== savedPosts) {
                localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(botUpdatedPosts));
            }

        } catch (e) {
            console.error("Failed to load or process community posts", e);
            setPosts([]);
        }
    }, [runBotActions]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const savePosts = (updatedPosts: VictoryPost[]) => {
        setPosts(updatedPosts);
        localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(updatedPosts));
    };

    const handleAddPost = (text: string) => {
        const newPost: VictoryPost = {
            id: crypto.randomUUID(),
            type: 'NSV',
            text,
            cheers: 0,
            timestamp: new Date().toISOString(),
        };
        const updatedPosts = [newPost, ...posts].slice(0, 50); // Keep latest 50 posts
        savePosts(updatedPosts);
    };

    const handleCheer = (postId: string) => {
        const updatedPosts = posts.map(p => 
            p.id === postId ? { ...p, cheers: p.cheers + 1 } : p
        );
        savePosts(updatedPosts);
    };

    const timeAgo = (timestamp: string) => {
        const now = new Date();
        const past = new Date(timestamp);
        const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="relative min-h-[calc(100vh-200px)]">
            <PostVictoryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPost={handleAddPost}
            />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center font-handwriting">
                    The Victory Wall
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                    A shared space for celebrating small wins. Anonymously.
                </p>
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                    Note: This is an offline-first community wall. New victories from others may take some time to appear.
                </p>
            </div>

            <div className="mt-6 space-y-4">
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div 
                            key={post.id} 
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 opacity-0 animate-fade-in-up"
                            style={{ animationDelay: `${index * 70}ms` }}
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold">Someone</span> celebrated: "{post.text}"
                                </p>
                                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">{timeAgo(post.timestamp)}</span>
                            </div>
                            <div className="flex justify-end items-center mt-3">
                                <button 
                                    onClick={() => handleCheer(post.id)}
                                    className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition active:scale-95"
                                >
                                    <span>🎉</span>
                                    <span>Cheer</span>
                                    {post.cheers > 0 && <span className="font-bold">{post.cheers}</span>}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <p className="font-semibold">The Victory Wall is quiet...</p>
                        <p className="mt-2 text-sm">Be the first to share a small win!</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-8 w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-all transform hover:scale-110 active:scale-95 z-30"
                aria-label="Post a new victory"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
};

export default CommunityView;