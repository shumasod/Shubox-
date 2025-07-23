import React, { useState, useReducer, useCallback } from 'react';
import { Camera, MapPin, Thermometer, BedDouble, Users, Star, Utensils, Train, AlertCircle, CheckCircle2, ImagePlus } from 'lucide-react';

// 型定義（TypeScript風の型安全性向上）
const ONSEN_TYPES = {
  NATURAL: '天然温泉',
  ARTIFICIAL: '人工温泉', 
  ACIDIC: '酸性泉',
  SULFUR: '硫黄泉',
  ALKALINE: 'アルカリ泉',
  CARBONATED: '炭酸泉'
};

// 状態管理をReducerで統合（複雑な状態管理の改善）
const initialState = {
  name: '',
  address: '',
  onsenType: '',
  roomCount: 0,
  guestCount: 0,
  description: '',
  rating: 0,
  nearbyAttractions: '',
  transportation: '',
  images: [],
  errors: {},
  isSubmitting: false
};

const ryokanReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { 
        ...state, 
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: null }
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting };
    case 'ADD_IMAGE':
      return { ...state, images: [...state.images, action.image] };
    case 'REMOVE_IMAGE':
      return { ...state, images: state.images.filter((_, idx) => idx !== action.index) };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
};

// バリデーション機能の追加
const validateForm = (data) => {
  const errors = {};
  
  if (!data.name.trim()) errors.name = '旅館名は必須です';
  if (!data.address.trim()) errors.address = '住所は必須です';
  if (!data.onsenType) errors.onsenType = '温泉の種類を選択してください';
  if (data.roomCount <= 0) errors.roomCount = '部屋数は1以上で入力してください';
  if (data.guestCount <= 0) errors.guestCount = '宿泊人数は1以上で入力してください';
  if (data.rating < 1 || data.rating > 5) errors.rating = '評価は1〜5で入力してください';
  if (!data.description.trim()) errors.description = '旅館の特徴は必須です';
  
  return errors;
};

// スタイル定数（保守性の向上）
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: '"Noto Sans JP", Arial, sans-serif',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    borderRadius: '16px',
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px',
    textAlign: 'center'
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  content: {
    padding: '30px',
    backgroundColor: '#ffffff'
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '30px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f8fafc'
  },
  tab: (isActive) => ({
    flex: 1,
    padding: '12px 20px',
    backgroundColor: isActive ? '#4f46e5' : 'transparent',
    color: isActive ? 'white' : '#64748b',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  }),
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px'
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fafbfc',
    transition: 'all 0.3s ease'
  },
  input: {
    flexGrow: 1,
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease'
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  select: {
    flexGrow: 1,
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white'
  },
  button: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  successMessage: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  imagePlaceholder: {
    aspectRatio: '16/9',
    backgroundColor: '#f8fafc',
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  footer: {
    backgroundColor: '#f8fafc',
    padding: '20px 30px',
    borderTop: '1px solid #e2e8f0'
  }
};

const OnsenRyokanSystem = () => {
  const [state, dispatch] = useReducer(ryokanReducer, initialState);
  const [activeTab, setActiveTab] = useState('info');
  const [showSuccess, setShowSuccess] = useState(false);

  // フィールド更新のコールバック（パフォーマンス最適化）
  const updateField = useCallback((field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  // フォーム送信処理（エラーハンドリング追加）
  const handleSubmit = useCallback(async () => {
    const errors = validateForm(state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    
    try {
      // 実際のAPI呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('温泉旅館情報:', {
        ...state,
        errors: undefined,
        isSubmitting: undefined
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      dispatch({ type: 'RESET_FORM' });
      
    } catch (error) {
      dispatch({ type: 'SET_ERRORS', errors: { submit: 'エラーが発生しました。もう一度お試しください。' } });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  }, [state]);

  // 画像アップロード処理（機能拡張）
  const handleImageUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({ type: 'ADD_IMAGE', image: { url: e.target.result, name: file.name } });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>るる温泉旅館ガイド</h1>
        <p style={{ opacity: 0.9, margin: 0, fontSize: '16px' }}>
          心に残る温泉体験を共有しましょう 🏨♨️
        </p>
      </header>
      
      <div style={styles.content}>
        {showSuccess && (
          <div style={styles.successMessage}>
            <CheckCircle2 size={20} />
            <span>旅館情報が正常に登録されました！</span>
          </div>
        )}

        <div style={styles.tabContainer}>
          <button 
            onClick={() => setActiveTab('info')} 
            style={styles.tab(activeTab === 'info')}
            onMouseEnter={(e) => {
              if (activeTab !== 'info') {
                e.target.style.backgroundColor = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'info') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            📋 旅館情報
          </button>
          <button 
            onClick={() => setActiveTab('images')} 
            style={styles.tab(activeTab === 'images')}
            onMouseEnter={(e) => {
              if (activeTab !== 'images') {
                e.target.style.backgroundColor = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'images') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            📸 写真ギャラリー
          </button>
        </div>

        {activeTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 旅館名 */}
            <div style={styles.formGroup}>
              <label style={{ fontWeight: '600', color: '#374151' }}>
                <div style={styles.inputContainer}>
                  <BedDouble color="#4f46e5" size={20} />
                  <span>温泉旅館の名前 *</span>
                </div>
              </label>
              <input 
                value={state.name} 
                onChange={(e) => updateField('name', e.target.value)}
                style={styles.input}
                placeholder="例：箱根湯本温泉 花心亭"
                aria-describedby="name-error"
              />
              {state.errors.name && (
                <div style={styles.errorText} id="name-error">
                  <AlertCircle size={16} />
                  {state.errors.name}
                </div>
              )}
            </div>

            {/* 住所 */}
            <div style={styles.formGroup}>
              <label style={{ fontWeight: '600', color: '#374151' }}>
                <div style={styles.inputContainer}>
                  <MapPin color="#ef4444" size={20} />
                  <span>住所 *</span>
                </div>
              </label>
              <input 
                value={state.address} 
                onChange={(e) => updateField('address', e.target.value)}
                style={styles.input}
                placeholder="例：神奈川県足柄下郡箱根町湯本茶屋95"
              />
              {state.errors.address && (
                <div style={styles.errorText}>
                  <AlertCircle size={16} />
                  {state.errors.address}
                </div>
              )}
            </div>

            {/* 温泉の種類 */}
            <div style={styles.formGroup}>
              <label style={{ fontWeight: '600', color: '#374151' }}>
                <div style={styles.inputContainer}>
                  <Thermometer color="#f97316" size={20} />
                  <span>温泉の種類 *</span>
                </div>
              </label>
              <select 
                value={state.onsenType} 
                onChange={(e) => updateField('onsenType', e.target.value)}
                style={styles.select}
              >
                <option value="">温泉の種類を選択してください</option>
                {Object.entries(ONSEN_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
              {state.errors.onsenType && (
                <div style={styles.errorText}>
                  <AlertCircle size={16} />
                  {state.errors.onsenType}
                </div>
              )}
            </div>

            {/* 部屋数と宿泊人数 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: '600', color: '#374151' }}>
                  <div style={styles.inputContainer}>
                    <BedDouble color="#6366f1" size={20} />
                    <span>部屋数 *</span>
                  </div>
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={state.roomCount} 
                  onChange={(e) => updateField('roomCount', Number(e.target.value))}
                  style={styles.input}
                  placeholder="10"
                />
                {state.errors.roomCount && (
                  <div style={styles.errorText}>
                    <AlertCircle size={16} />
                    {state.errors.roomCount}
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={{ fontWeight: '600', color: '#374151' }}>
                  <div style={styles.inputContainer}>
                    <Users color="#22c55e" size={20} />
                    <span>最大宿泊人数 *</span>
                  </div>
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={state.guestCount} 
                  onChange={(e) => updateField('guestCount', Number(e.target.value))}
                  style={styles.input}
                  placeholder="50"
                />
                {state.errors.guestCount && (
                  <div style={styles.errorText}>
                    <AlertCircle size={16} />
                    {state.errors.guestCount}
                  </div>
                )}
              </div>
            </div>

            {/* 評価 */}
            <div style={styles.formGroup}>
              <label style={{ fontWeight: '600', color: '#374151' }}>
                <div style={styles.inputContainer}>
                  <Star color="#eab308" size={20} />
                  <span>評価（1〜5段階）*</span>
                </div>
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={state.rating} 
                  onChange={(e) => updateField('rating', Number(e.target.value))}
                  style={{ flexGrow: 1 }}
                />
                <span style={{ fontWeight: 'bold', color: '#4f46e5', minWidth: '20px' }}>
                  {state.rating}
                </span>
                <div style={{ display: 'flex' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star}
                      size={16} 
                      color={star <= state.rating ? '#eab308' : '#e5e7eb'}
                      fill={star <= state.rating ? '#eab308' : 'none'}
                    />
                  ))}
                </div>
              </div>
              {state.errors.rating && (
                <div style={styles.errorText}>
                  <AlertCircle size={16} />
                  {state.errors.rating}
                </div>
              )}
            </div>

            {/* 旅館の特徴 */}
            <div style={styles.formGroup}>
              <label style={{ fontWeight: '600', color: '#374151' }}>
                <div style={styles.inputContainer}>
                  <Utensils color="#a855f7" size={20} />
                  <span>旅館の特徴・おすすめポイント *</span>
                </div>
              </label>
              <textarea
                value={state.description}
                onChange={(e) => updateField('description', e.target.value)}
                style={styles.textarea}
                placeholder="温泉の効能、名物料理、特別なサービスなどを詳しく記入してください。例：美肌効果のあるアルカリ性単純温泉と、地元で獲れた新鮮な海の幸を使った会席料理が自慢です。"
              />
              {state.errors.description && (
                <div style={styles.errorText}>
                  <AlertCircle size={16} />
                  {state.errors.description}
                </div>
              )}
            </div>

            {/* 周辺観光スポット */}
            <div style={styles.formGroup}>
              <label style={{ fontWeight: '600', color: '#374151' }}>
                <div style={styles.inputContainer}>
                  <MapPin color="#ec4899" size={20} />
                  <span>周辺の観光スポット</span>
                </div>
              </label>
              <textarea
                value={state.nearbyAttractions}
                onChange={(e) => updateField('nearbyAttractions', e.target.value)}
                style={styles.textarea}
                placeholder="近くの観光地、名所、体験施設などを記入してください。例：芦ノ湖まで車で15分、箱根神社、彫刻の森美術館、ロープウェイ乗り場など"
              />
            </div>

            {/* アクセス情報 */}
            <div style={styles.formGroup}>
              <label style={{ fontWeight: '600', color: '#374151' }}>
                <div style={styles.inputContainer}>
                  <Train color="#06b6d4" size={20} />
                  <span>アクセス情報</span>
                </div>
              </label>
              <textarea
                value={state.transportation}
                onChange={(e) => updateField('transportation', e.target.value)}
                style={styles.textarea}
                placeholder="最寄り駅からの交通手段、所要時間、送迎サービスの有無などを記入してください。例：箱根湯本駅から徒歩8分、新宿駅から小田急線で約85分、送迎バスあり（要予約）"
              />
            </div>

            {state.errors.submit && (
              <div style={{ ...styles.errorText, fontSize: '14px', justifyContent: 'center' }}>
                <AlertCircle size={20} />
                {state.errors.submit}
              </div>
            )}

            <button 
              onClick={handleSubmit}
              disabled={state.isSubmitting}
              style={{
                ...styles.button,
                opacity: state.isSubmitting ? 0.7 : 1,
                cursor: state.isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!state.isSubmitting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              {state.isSubmitting ? '登録中...' : '🏨 旅館情報を登録する'}
            </button>
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            <div style={styles.imageGrid}>
              {state.images.map((image, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img 
                    src={image.url} 
                    alt={image.name}
                    style={{ 
                      width: '100%', 
                      aspectRatio: '16/9', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_IMAGE', index })}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <label style={styles.imagePlaceholder}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <ImagePlus size={48} color="#9ca3af" />
                <span style={{ marginTop: '12px', color: '#6b7280', textAlign: 'center' }}>
                  写真を追加<br />
                  <small>クリックして画像を選択</small>
                </span>
              </label>
            </div>
            
            <p style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              margin: '20px 0 0 0'
            }}>
              📸 旅館の魅力が伝わる写真をアップロードしてください<br />
              <small>対応形式: JPG, PNG, GIF (複数選択可能)</small>
            </p>
          </div>
        )}
      </div>

      <footer style={styles.footer}>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0, textAlign: 'center' }}>
          💡 入力いただいた情報は旅館ガイドに掲載されます。正確で魅力的な情報をお待ちしています。
        </p>
      </footer>
    </div>
  );
};

export default OnsenRyokanSystem;
