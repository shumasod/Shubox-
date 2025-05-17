import React, { useState } from 'react';
import { Camera, MapPin, Thermometer, BedDouble, Users, Star, Utensils, Train } from 'lucide-react';


const OnsenRyokanSystem = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [onsenType, setOnsenType] = useState('');
  const [roomCount, setRoomCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [nearbyAttractions, setNearbyAttractions] = useState('');
  const [transportation, setTransportation] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('温泉旅館情報:', {
      name,
      address,
      onsenType,
      roomCount,
      guestCount,
      description,
      rating,
      nearbyAttractions,
      transportation,
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', color: 'white', padding: '20px', borderRadius: '8px 8px 0 0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>るる温泉旅館ガイド</h1>
        <p style={{ opacity: 0.8, margin: '10px 0 0' }}>魅力的な温泉旅館を探そう！</p>
      </div>
      
      <div style={{ border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '20px' }}>
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('info')} 
            style={{ flex: 1, padding: '10px', background: activeTab === 'info' ? '#3b82f6' : '#e5e7eb', color: activeTab === 'info' ? 'white' : 'black', border: 'none', cursor: 'pointer' }}
          >
            旅館情報
          </button>
          <button 
            onClick={() => setActiveTab('images')} 
            style={{ flex: 1, padding: '10px', background: activeTab === 'images' ? '#3b82f6' : '#e5e7eb', color: activeTab === 'images' ? 'white' : 'black', border: 'none', cursor: 'pointer' }}
          >
            写真ギャラリー
          </button>
        </div>

        {activeTab === 'info' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BedDouble color="#3b82f6" />
              <label htmlFor="name">温泉旅館の名前:</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} style={{ flexGrow: 1, padding: '5px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin color="#ef4444" />
              <label htmlFor="address">住所:</label>
              <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ flexGrow: 1, padding: '5px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Thermometer color="#f97316" />
              <label htmlFor="onsenType">温泉の種類:</label>
              <select id="onsenType" value={onsenType} onChange={(e) => setOnsenType(e.target.value)} style={{ flexGrow: 1, padding: '5px' }}>
                <option value="">選択してください</option>
                <option value="天然温泉">天然温泉</option>
                <option value="人工温泉">人工温泉</option>
                <option value="酸性泉">酸性泉</option>
                <option value="硫黄泉">硫黄泉</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BedDouble color="#6366f1" />
              <label htmlFor="roomCount">部屋数:</label>
              <input id="roomCount" type="number" value={roomCount} onChange={(e) => setRoomCount(Number(e.target.value))} style={{ width: '80px', padding: '5px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users color="#22c55e" />
              <label htmlFor="guestCount">宿泊人数:</label>
              <input id="guestCount" type="number" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} style={{ width: '80px', padding: '5px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star color="#eab308" />
              <label htmlFor="rating">評価（5段階）:</label>
              <input id="rating" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: '80px', padding: '5px' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Utensils color="#a855f7" style={{ marginTop: '5px' }} />
              <div style={{ flexGrow: 1 }}>
                <label htmlFor="description">旅館の特徴:</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', height: '80px', padding: '5px' }}
                  placeholder="温泉の効能や名物料理などを記入してください"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <MapPin color="#ec4899" style={{ marginTop: '5px' }} />
              <div style={{ flexGrow: 1 }}>
                <label htmlFor="nearbyAttractions">周辺の観光スポット:</label>
                <textarea
                  id="nearbyAttractions"
                  value={nearbyAttractions}
                  onChange={(e) => setNearbyAttractions(e.target.value)}
                  style={{ width: '100%', height: '80px', padding: '5px' }}
                  placeholder="近くの観光地や名所を記入してください"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Train color="#06b6d4" style={{ marginTop: '5px' }} />
              <div style={{ flexGrow: 1 }}>
                <label htmlFor="transportation">アクセス情報:</label>
                <textarea
                  id="transportation"
                  value={transportation}
                  onChange={(e) => setTransportation(e.target.value)}
                  style={{ width: '100%', height: '80px', padding: '5px' }}
                  placeholder="最寄り駅からの交通手段を記入してください"
                />
              </div>
            </div>

            <button type="submit" style={{ padding: '10px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              旅館情報を登録する
            </button>
          </form>
        )}

        {activeTab === 'images' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ aspectRatio: '16/9', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={48} color="#9ca3af" />
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280' }}>画像アップロード機能は準備中です</p>
          </div>
        )}
      </div>

      <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '0 0 8px 8px', marginTop: '20px' }}>
        <p style={{ fontSize: '14px', color: '#4b5563' }}>入力した情報は旅館ガイドに反映されます。正確な情報を心がけてください。</p>
      </div>
    </div>
  );
};

export default OnsenRyokanSystem;
