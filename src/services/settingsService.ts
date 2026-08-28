import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_PLAYLIST_ID, DEFAULT_PLAYLIST_LINK } from '../data/defaultPlaylist';

export interface WebsiteSettings {
  defaultPlaylistId: string;
  defaultPlaylistUrl: string;
  spotifyUrl: string;
  tagline: string;
  updatedAt?: unknown;
  updatedBy?: string;
}

export const defaultWebsiteSettings: WebsiteSettings = {
  defaultPlaylistId: DEFAULT_PLAYLIST_ID,
  defaultPlaylistUrl: DEFAULT_PLAYLIST_LINK,
  spotifyUrl: 'https://open.spotify.com',
  tagline: 'One South. Many Languages. One Rhythm.'
};

const SETTINGS_DOC_PATH = 'settings';
const SETTINGS_DOC_ID = 'website';

/**
 * Real-time subscription to website configuration from Firestore
 */
export const subscribeToWebsiteSettings = (
  callback: (settings: WebsiteSettings) => void
) => {
  const docRef = doc(db, SETTINGS_DOC_PATH, SETTINGS_DOC_ID);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<WebsiteSettings>;
        callback({
          defaultPlaylistId: data.defaultPlaylistId || defaultWebsiteSettings.defaultPlaylistId,
          defaultPlaylistUrl: data.defaultPlaylistUrl || defaultWebsiteSettings.defaultPlaylistUrl,
          spotifyUrl: data.spotifyUrl || defaultWebsiteSettings.spotifyUrl,
          tagline: data.tagline || defaultWebsiteSettings.tagline,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy
        });
      } else {
        // Fallback to default settings
        callback(defaultWebsiteSettings);
      }
    },
    (error) => {
      console.warn('Firestore settings listener fallback:', error);
      callback(defaultWebsiteSettings);
    }
  );
};

/**
 * Fetch website settings once
 */
export const getWebsiteSettings = async (): Promise<WebsiteSettings> => {
  try {
    const docRef = doc(db, SETTINGS_DOC_PATH, SETTINGS_DOC_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as Partial<WebsiteSettings>;
      return {
        defaultPlaylistId: data.defaultPlaylistId || defaultWebsiteSettings.defaultPlaylistId,
        defaultPlaylistUrl: data.defaultPlaylistUrl || defaultWebsiteSettings.defaultPlaylistUrl,
        spotifyUrl: data.spotifyUrl || defaultWebsiteSettings.spotifyUrl,
        tagline: data.tagline || defaultWebsiteSettings.tagline,
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy
      };
    }
  } catch (error) {
    console.warn('Could not fetch Firestore settings, using default:', error);
  }
  return defaultWebsiteSettings;
};

/**
 * Update website settings in Firestore (Admin only)
 */
export const updateWebsiteSettings = async (
  updates: Partial<WebsiteSettings>,
  adminEmail?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const docRef = doc(db, SETTINGS_DOC_PATH, SETTINGS_DOC_ID);
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
        ...(adminEmail ? { updatedBy: adminEmail } : {})
      },
      { merge: true }
    );
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update website settings.';
    return { success: false, error: message };
  }
};
