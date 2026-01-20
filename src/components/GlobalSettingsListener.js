"use client";

import { useEffect } from 'react';
import pb from '@/lib/pocketbase';
import { getSettings } from '@/services/settingsService';

export default function GlobalSettingsListener() {
    useEffect(() => {
        // Function to apply styles
        const applyStyles = (settings) => {
            if (settings?.remove_background) {
                document.body.style.background = 'transparent';
                document.documentElement.style.setProperty('--bg-studio', 'transparent');
            } else {
                document.body.style.background = ''; // Revert to CSS default
                document.documentElement.style.removeProperty('--bg-studio');
            }
        };

        // 1. Fetch Initial State
        getSettings().then(settings => {
            if (settings) applyStyles(settings);
        });

        // 2. Subscribe to Realtime Updates
        pb.collection('settings').subscribe('*', function (e) {
            if (e.action === 'update' || e.action === 'create') {
                console.log("Global Settings Update:", e.record);
                applyStyles({
                    remove_background: e.record.remove_background
                });
            }
        }).catch(err => console.error("Global settings sub failed:", err));

        return () => {
            pb.collection('settings').unsubscribe('*');
            document.body.style.background = ''; // Cleanup on unmount? Maybe not if we want persistence across nav, but unmount usually means app close.
        };
    }, []);

    return null; // Component renders nothing visibly
}
