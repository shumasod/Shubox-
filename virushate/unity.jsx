// UNIX タイムスタンプで管理
const [sessionExpiry, setSessionExpiry] = useState(0);

const validateSession = useCallback(() => {
  const now = Date.now();
  if (!sessionToken || !sessionExpiry || now > sessionExpiry) {
    if (isLoggedIn) {
      logSecurityEvent(`セッションタイムアウト: ${loggedInUser}`);
      handleLogout();
    }
    return false;
  }
  // セッション延長
  setSessionExpiry(now + 30 * 60 * 1000);
  return true;
}, [sessionToken, sessionExpiry, isLoggedIn, loggedInUser, handleLogout, logSecurityEvent]);

// 共通キー生成関数
const getKeyBuffer = async (key) => {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(key.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
};

const encryptData = async (data, key) => {
  try {
    const keyBuffer = await getKeyBuffer(key);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyBuffer,
      encodedData
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    return data;
  }
};

const decryptData = async (encryptedData, key) => {
  try {
    const keyBuffer = await getKeyBuffer(key);
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyBuffer,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
  <input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
/>
};