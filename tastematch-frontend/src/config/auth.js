const AUTH_STORAGE_KEY = 'tastematch.auth';
const AUTH_CHANGE_EVENT = 'tastematch:auth-change';
const TASTE_PROFILE_STORAGE_KEY = 'userPrefs';
const TASTE_PROFILE_OWNER_KEY = 'tastematch.userPrefsOwner';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

const readSession = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue?.token || !parsedValue?.user?.id) {
      return null;
    }

    return parsedValue;
  } catch (error) {
    return null;
  }
};

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
};

const updateSessionProfileFlag = (storage, value) => {
  const session = readSession();
  if (!session) {
    return;
  }

  session.hasTasteProfile = Boolean(value);
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const clearTasteProfileStorage = (storage) => {
  storage.removeItem('hasProfile');
  storage.removeItem(TASTE_PROFILE_STORAGE_KEY);
  storage.removeItem(TASTE_PROFILE_OWNER_KEY);
};

export const getAuthSession = () => readSession();

export const getCurrentUser = () => readSession()?.user || null;

export const getAuthToken = () => readSession()?.token || '';

export const isAuthenticated = () => Boolean(getAuthToken());

export const saveAuthSession = (authResponse) => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const previousSession = readSession();

  const session = {
    token: authResponse.token,
    expiresAt: authResponse.expiresAt || null,
    hasTasteProfile: Boolean(authResponse.hasTasteProfile),
    user: {
      id: String(authResponse.id),
      name: authResponse.name,
      email: authResponse.email,
    },
  };

  if (previousSession?.user?.id && previousSession.user.id !== session.user.id) {
    clearTasteProfileStorage(storage);
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  storage.setItem('userId', session.user.id);
  storage.setItem('userName', session.user.name);

  if (session.hasTasteProfile) {
    storage.setItem('hasProfile', 'true');
  } else {
    clearTasteProfileStorage(storage);
  }

  notifyAuthChange();
  return session;
};

export const clearAuthSession = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEY);
  storage.removeItem('userId');
  storage.removeItem('userName');
  clearTasteProfileStorage(storage);
  notifyAuthChange();
};

export const setHasTasteProfile = (value) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  updateSessionProfileFlag(storage, value);

  if (value) {
    storage.setItem('hasProfile', 'true');
  } else {
    clearTasteProfileStorage(storage);
  }

  notifyAuthChange();
};

export const normalizeTasteProfile = (profile) => ({
  cuisine: profile?.cuisine || 'Hyderabadi',
  spiceLevel: Number(profile?.spiceLevel ?? 80),
  dietType: profile?.dietType || 'Non-Veg',
  budgetRange: profile?.budgetRange || 'Rs 900',
  ratingImportance: Number(profile?.ratingImportance ?? 4),
});

export const getStoredTasteProfile = (userId) => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const ownerId = storage.getItem(TASTE_PROFILE_OWNER_KEY);
  if (userId && ownerId !== String(userId)) {
    return null;
  }

  try {
    const rawProfile = storage.getItem(TASTE_PROFILE_STORAGE_KEY);
    if (!rawProfile) {
      return null;
    }

    return normalizeTasteProfile(JSON.parse(rawProfile));
  } catch (error) {
    return null;
  }
};

export const clearPersistedTasteProfile = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  updateSessionProfileFlag(storage, false);
  clearTasteProfileStorage(storage);
  notifyAuthChange();
};

export const persistTasteProfile = (profile) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const normalizedProfile = normalizeTasteProfile(profile);
  const currentUser = getCurrentUser();

  storage.setItem(TASTE_PROFILE_STORAGE_KEY, JSON.stringify(normalizedProfile));
  if (currentUser?.id) {
    storage.setItem(TASTE_PROFILE_OWNER_KEY, String(currentUser.id));
  } else {
    storage.removeItem(TASTE_PROFILE_OWNER_KEY);
  }

  setHasTasteProfile(true);
};

export const subscribeToAuthChanges = (callback) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleChange = () => callback(getAuthSession());
  window.addEventListener(AUTH_CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleChange);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
};
