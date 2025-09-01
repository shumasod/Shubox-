import React, { useState, useEffect } from 'react';
import { 
  User, Users, Calendar, MessageSquare, ShoppingBag, Award, 
  Settings, Star, Heart, Music, Bell, Vote, Plus, Edit3, 
  Trash2, Eye, Send, Gift, TrendingUp, LogOut, Menu,
  UserPlus, Megaphone, ShoppingCart
} from 'lucide-react';

const FanClubSystem = () => {
  // State管理
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(true);

  // データ状態
  const [members, setMembers] = useState([
    { 
      id: 1, 
      name: '田中太郎', 
      email: 'tanaka@example.com', 
      status: 'premium', 
      joinDate: '2024-01-15',
      points: 1250,
      lastActive: '2024-09-01'
    },
    { 
      id: 2, 
      name: '佐藤花子', 
      email: 'sato@example.com', 
      status: 'standard', 
      joinDate: '2024-03-22',
      points: 750,
      lastActive: '2024-08-30'
    }
  ]);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'LIVE TOUR 2024',
      date: '2024-10-15',
      venue: '東京ドーム',
      type: 'concert',
      capacity: 50000,
      registered: 45000,
      description: '待望のワールドツアー開催決定！'
    },
    {
      id: 2,
      title: 'ファンミーティング',
      date: '2024-09-20',
      venue: 'パシフィコ横浜',
      type: 'fanmeeting',
      capacity: 5000,
      registered: 4800,
      description: 'ファンとの特別な交流イベント'
    }
  ]);

  const [news, setNews] = useState([
    {
      id: 1,
      title: '新曲「星降る夜に」リリース決定！',
      content: '皆様お待ちかねの新曲が12月にリリース決定しました。今回はバラード調の楽曲となっています。',
      date: '2024-09-01',
      author: 'アーティスト公式'
    },
    {
      id: 2,
      title: 'ライブツアーグッズ販売開始',
      content: 'ツアーグッズの販売を開始いたします。限定アイテムもありますのでお早めに！',
      date: '2024-08-28',
      author: '運営事務局'
    }
  ]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'オリジナルTシャツ',
      price: 3500,
      category: 'apparel',
      stock: 100,
      image: 'https://via.placeholder.com/200x200',
      description: '公式ロゴ入りTシャツ'
    },
    {
      id: 2,
      name: 'ライブDVD',
      price: 5800,
      category: 'media',
      stock: 200,
      image: 'https://via.placeholder.com/200x200',
      description: '2023年ライブの完全収録版'
    }
  ]);

  const [polls, setPolls] = useState([
    {
      id: 1,
      title: 'Next Singleのジャケット投票',
      options: ['デザインA', 'デザインB', 'デザインC'],
      votes: [150, 120, 80],
      endDate: '2024-09-15',
      isActive: true
    }
  ]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      from: '運営事務局',
      to: '全会員',
      subject: 'システムメンテナンスのお知らせ',
      content: '9月5日にシステムメンテナンスを実施します。',
      date: '2024-09-01',
      read: false
    }
  ]);

  // ログイン処理
  const handleLogin = (email, password, adminMode = false) => {
    if (adminMode && email === 'admin@fanclub.com' && password === 'admin') {
      setIsAdmin(true);
      setCurrentUser({ id: 'admin', name: '管理者', email: 'admin@fanclub.com' });
    } else {
      const member = members.find(m => m.email === email);
      if (member) {
        setCurrentUser(member);
        setIsAdmin(false);
      }
    }
  };

  // サイドバーメニュー
  const sidebarItems = isAdmin ? [
    { id: 'dashboard', label: 'ダッシュボード', icon: TrendingUp },
    { id: 'members', label: '会員管理', icon: Users },
    { id: 'events', label: 'イベント管理', icon: Calendar },
    { id: 'news', label: 'ニュース管理', icon: Megaphone },
    { id: 'products', label: '商品管理', icon: ShoppingCart },
    { id: 'polls', label: '投票管理', icon: Vote },
    { id: 'messages', label: 'メッセージ管理', icon: MessageSquare }
  ] : [
    { id: 'dashboard', label: 'ダッシュボード', icon: User },
    { id: 'profile', label: 'プロフィール', icon: Settings },
    { id: 'events', label: 'イベント', icon: Calendar },
    { id: 'news', label: 'ニュース', icon: Bell },
    { id: 'shop', label: 'ショップ', icon: ShoppingBag },
    { id: 'polls', label: '投票', icon: Vote },
    { id: 'messages', label: 'メッセージ', icon: MessageSquare },
    { id: 'points', label: 'ポイント', icon: Award }
  ];

  // ログイン画面
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // メインレイアウト
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 transition-colors"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center space-x-2">
              <Music className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {isAdmin ? 'Admin Panel' : 'FanClub Portal'}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white/80">{currentUser.name}</span>
            <button 
              onClick={() => setCurrentUser(null)}
              className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー */}
        {showSidebar && (
          <aside className="w-64 bg-black/30 backdrop-blur-sm border-r border-purple-500/20 min-h-screen">
            <nav className="p-4 space-y-2">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 p-6">
          {isAdmin ? (
            <AdminContent 
              activeTab={activeTab}
              members={members}
              setMembers={setMembers}
              events={events}
              setEvents={setEvents}
              news={news}
              setNews={setNews}
              products={products}
              setProducts={setProducts}
              polls={polls}
              setPolls={setPolls}
              messages={messages}
              setMessages={setMessages}
            />
          ) : (
            <UserContent 
              activeTab={activeTab}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              events={events}
              news={news}
              products={products}
              polls={polls}
              messages={messages}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// ログイン画面コンポーネント
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            FanClub Login
          </h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`px-4 py-2 rounded-lg transition-all ${
                !isAdminMode ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              会員ログイン
            </button>
            <button
              onClick={() => setIsAdminMode(true)}
              className={`px-4 py-2 rounded-lg transition-all ${
                isAdminMode ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              管理者ログイン
            </button>
          </div>

          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
          />
          
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
          />
          
          <button
            onClick={() => onLogin(email, password, isAdminMode)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            ログイン
          </button>

          <div className="text-sm text-white/60 text-center space-y-2">
            <p>テストアカウント:</p>
            {!isAdminMode ? (
              <p>tanaka@example.com / password</p>
            ) : (
              <p>admin@fanclub.com / admin</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 管理者コンテンツ
const AdminContent = ({ activeTab, members, setMembers, events, setEvents, news, setNews, products, setProducts, polls, setPolls, messages, setMessages }) => {
  switch (activeTab) {
    case 'dashboard':
      return <AdminDashboard members={members} events={events} news={news} />;
    case 'members':
      return <MemberManagement members={members} setMembers={setMembers} />;
    case 'events':
      return <EventManagement events={events} setEvents={setEvents} />;
    case 'news':
      return <NewsManagement news={news} setNews={setNews} />;
    case 'products':
      return <ProductManagement products={products} setProducts={setProducts} />;
    case 'polls':
      return <PollManagement polls={polls} setPolls={setPolls} />;
    case 'messages':
      return <MessageManagement messages={messages} setMessages={setMessages} />;
    default:
      return <AdminDashboard members={members} events={events} news={news} />;
  }
};

// ユーザーコンテンツ
const UserContent = ({ activeTab, currentUser, setCurrentUser, events, news, products, polls, messages }) => {
  switch (activeTab) {
    case 'dashboard':
      return <UserDashboard currentUser={currentUser} events={events} news={news} />;
    case 'profile':
      return <ProfileManagement currentUser={currentUser} setCurrentUser={setCurrentUser} />;
    case 'events':
      return <EventList events={events} />;
    case 'news':
      return <NewsList news={news} />;
    case 'shop':
      return <Shop products={products} />;
    case 'polls':
      return <PollList polls={polls} />;
    case 'messages':
      return <MessageList messages={messages} />;
    case 'points':
      return <PointsView currentUser={currentUser} />;
    default:
      return <UserDashboard currentUser={currentUser} events={events} news={news} />;
  }
};

// 管理者ダッシュボード
const AdminDashboard = ({ members, events, news }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white mb-6">管理者ダッシュボード</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-sm">総会員数</p>
            <p className="text-3xl font-bold text-white">{members.length}</p>
          </div>
          <Users className="w-12 h-12 text-blue-400" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-300 text-sm">イベント数</p>
            <p className="text-3xl font-bold text-white">{events.length}</p>
          </div>
          <Calendar className="w-12 h-12 text-green-400" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-300 text-sm">ニュース記事</p>
            <p className="text-3xl font-bold text-white">{news.length}</p>
          </div>
          <Bell className="w-12 h-12 text-purple-400" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-pink-600/20 to-pink-400/20 backdrop-blur-sm border border-pink-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-300 text-sm">プレミアム会員</p>
            <p className="text-3xl font-bold text-white">{members.filter(m => m.status === 'premium').length}</p>
          </div>
          <Star className="w-12 h-12 text-pink-400" />
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">最新会員登録</h3>
        <div className="space-y-3">
          {members.slice(-3).map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">{member.name}</p>
                <p className="text-white/60 text-sm">{member.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                member.status === 'premium' ? 'bg-gold-500/20 text-gold-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {member.status === 'premium' ? 'プレミアム' : '一般'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">直近のイベント</h3>
        <div className="space-y-3">
          {events.slice(0, 3).map(event => (
            <div key={event.id} className="p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium">{event.title}</p>
              <p className="text-white/60 text-sm">{event.date} - {event.venue}</p>
              <p className="text-purple-400 text-sm">{event.registered}/{event.capacity} 申込済み</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// 会員管理
const MemberManagement = ({ members, setMembers }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const addMember = (memberData) => {
    setMembers([...members, { ...memberData, id: Date.now() }]);
    setShowAddForm(false);
  };

  const updateMember = (id, memberData) => {
    setMembers(members.map(m => m.id === id ? { ...m, ...memberData } : m));
    setEditingMember(null);
  };

  const deleteMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">会員管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>会員追加</span>
        </button>
      </div>

      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/80 pb-3">名前</th>
                <th className="text-left text-white/80 pb-3">メール</th>
                <th className="text-left text-white/80 pb-3">ステータス</th>
                <th className="text-left text-white/80 pb-3">ポイント</th>
                <th className="text-left text-white/80 pb-3">登録日</th>
                <th className="text-left text-white/80 pb-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} className="border-b border-white/5">
                  <td className="py-3 text-white">{member.name}</td>
                  <td className="py-3 text-white/70">{member.email}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      member.status === 'premium' ? 'bg-gold-500/20 text-gold-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {member.status === 'premium' ? 'プレミアム' : '一般'}
                    </span>
                  </td>
                  <td className="py-3 text-white/70">{member.points}</td>
                  <td className="py-3 text-white/70">{member.joinDate}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingMember(member)}
                        className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 会員追加フォーム */}
      {showAddForm && (
        <MemberForm 
          onSave={addMember}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* 会員編集フォーム */}
      {editingMember && (
        <MemberForm 
          member={editingMember}
          onSave={(data) => updateMember(editingMember.id, data)}
          onCancel={() => setEditingMember(null)}
        />
      )}
    </div>
  );
};

// 会員フォーム
const MemberForm = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    status: member?.status || 'standard',
    points: member?.points || 0,
    joinDate: member?.joinDate || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">
          {member ? '会員編集' : '会員追加'}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="名前"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            required
          />
          <input
            type="email"
            placeholder="メールアドレス"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            required
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="standard">一般会員</option>
            <option value="premium">プレミアム会員</option>
          </select>
          <input
            type="number"
            placeholder="ポイント"
            value={formData.points}
            onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// イベント管理
const EventManagement = ({ events, setEvents }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const addEvent = (eventData) => {
    setEvents([...events, { ...eventData, id: Date.now(), registered: 0 }]);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">イベント管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <Calendar className="w-5 h-5" />
          <span>イベント追加</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                <p className="text-white/70 mb-2">{event.date} - {event.venue}</p>
                <p className="text-white/60">{event.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                event.type === 'concert' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {event.type === 'concert' ? 'コンサート' : 'ファンミーティング'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">
                参加者: {event.registered}/{event.capacity}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <EventForm 
          onSave={addEvent}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

// イベントフォーム
const EventForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    venue: '',
    type: 'concert',
    capacity: '',
    description: ''
  });

  const handleSubmit = () => {
    onSave({
      ...formData,
      capacity: parseInt(formData.capacity)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">イベント追加</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="イベント名"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            required
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            required
          />
          <input
            type="text"
            placeholder="会場"
            value={formData.venue}
            onChange={(e) => setFormData({...formData, venue: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            required
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="concert">コンサート</option>
            <option value="fanmeeting">ファンミーティング</option>
          </select>
          <input
            type="number"
            placeholder="定員"
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            required
          />
          <textarea
            placeholder="説明"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            rows="3"
          />
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ニュース管理
const NewsManagement = ({ news, setNews }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const addNews = (newsData) => {
    setNews([...news, { 
      ...newsData, 
      id: Date.now(), 
      date: new Date().toISOString().split('T')[0]
    }]);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">ニュース管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>ニュース追加</span>
        </button>
      </div>

      <div className="space-y-4">
        {news.map(item => (
          <div key={item.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/70 mb-4">{item.content}</p>
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span>投稿者: {item.author}</span>
                  <span>日付: {item.date}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <NewsForm 
          onSave={addNews}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

// ニュースフォーム
const NewsForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'アーティスト公式'
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">ニュース追加</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="タイトル"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            required
          />
          <textarea
            placeholder="内容"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            rows="4"
            required
          />
          <select
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="アーティスト公式">アーティスト公式</option>
            <option value="運営事務局">運営事務局</option>
          </select>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 商品管理
const ProductManagement = ({ products, setProducts }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">商品管理</h2>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all">
          <Plus className="w-5 h-5" />
          <span>商品追加</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
              <p className="text-white/70 mb-2">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-purple-400">¥{product.price.toLocaleString()}</span>
                <span className="text-sm text-white/60">在庫: {product.stock}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-blue-600/20 text-blue-400 py-2 rounded hover:bg-blue-600/30 transition-all">
                  編集
                </button>
                <button className="flex-1 bg-red-600/20 text-red-400 py-2 rounded hover:bg-red-600/30 transition-all">
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 投票管理
const PollManagement = ({ polls, setPolls }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">投票管理</h2>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all">
          <Vote className="w-5 h-5" />
          <span>投票作成</span>
        </button>
      </div>

      <div className="space-y-4">
        {polls.map(poll => (
          <div key={poll.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{poll.title}</h3>
                <p className="text-white/60">終了日: {poll.endDate}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                poll.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {poll.isActive ? '進行中' : '終了'}
              </span>
            </div>
            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-white">{option}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(poll.votes[index] / Math.max(...poll.votes)) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/70 text-sm">{poll.votes[index]}票</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <button className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30">
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// メッセージ管理
const MessageManagement = ({ messages, setMessages }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">メッセージ管理</h2>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all">
          <Send className="w-5 h-5" />
          <span>一斉送信</span>
        </button>
      </div>

      <div className="space-y-4">
        {messages.map(message => (
          <div key={message.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    message.read ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {message.read ? '既読' : '未読'}
                  </span>
                </div>
                <p className="text-white/70 mb-2">{message.content}</p>
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span>送信者: {message.from}</span>
                  <span>送信先: {message.to}</span>
                  <span>日付: {message.date}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ユーザーダッシュボード
const UserDashboard = ({ currentUser, events, news }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
        <User className="w-8 h-8 text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white">おかえりなさい、{currentUser.name}さん</h2>
        <p className="text-white/70">
          {currentUser.status === 'premium' ? 'プレミアム会員' : '一般会員'} | 
          ポイント: {currentUser.points}pt
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-300 text-sm">保有ポイント</p>
            <p className="text-3xl font-bold text-white">{currentUser.points}</p>
          </div>
          <Award className="w-12 h-12 text-purple-400" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-pink-600/20 to-pink-400/20 backdrop-blur-sm border border-pink-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-300 text-sm">会員ステータス</p>
            <p className="text-lg font-bold text-white">
              {currentUser.status === 'premium' ? 'プレミアム' : '一般会員'}
            </p>
          </div>
          <Star className="w-12 h-12 text-pink-400" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-sm">参加イベント</p>
            <p className="text-3xl font-bold text-white">3</p>
          </div>
          <Calendar className="w-12 h-12 text-blue-400" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-400" />
          今後のイベント
        </h3>
        <div className="space-y-3">
          {events.slice(0, 3).map(event => (
            <div key={event.id} className="p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium">{event.title}</p>
              <p className="text-white/60 text-sm">{event.date} - {event.venue}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-pink-400" />
          最新ニュース
        </h3>
        <div className="space-y-3">
          {news.slice(0, 3).map(item => (
            <div key={item.id} className="p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium text-sm">{item.title}</p>
              <p className="text-white/60 text-xs">{item.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// プロフィール管理
const ProfileManagement = ({ currentUser, setCurrentUser }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email
  });

  const handleSave = () => {
    setCurrentUser({ ...currentUser, ...formData });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">プロフィール設定</h2>
      
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{currentUser.name}</h3>
              <p className="text-white/70">{currentUser.status === 'premium' ? 'プレミアム会員' : '一般会員'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 mb-2">名前</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-white/80 mb-2">メールアドレス</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">会員登録日</label>
              <input
                type="text"
                value={currentUser.joinDate}
                disabled
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">保有ポイント</label>
              <input
                type="text"
                value={`${currentUser.points} pt`}
                disabled
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            変更を保存
          </button>
        </div>
      </div>
    </div>
  );
};

// イベント一覧
const EventList = ({ events }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">イベント一覧</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map(event => (
        <div key={event.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
              <div className="space-y-2 text-white/70">
                <p className="flex items-center"><Calendar className="w-4 h-4 mr-2" />{event.date}</p>
                <p>{event.venue}</p>
                <p className="text-sm">{event.description}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${
              event.type === 'concert' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {event.type === 'concert' ? 'コンサート' : 'ファンミーティング'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              {event.registered}/{event.capacity} 申込済み
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
              申し込み
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ニュース一覧
const NewsList = ({ news }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">ニュース</h2>
    
    <div className="space-y-4">
      {news.map(item => (
        <div key={item.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
            <span className="text-sm text-white/60 whitespace-nowrap ml-4">{item.date}</span>
          </div>
          <p className="text-white/80 mb-4">{item.content}</p>
          <p className="text-sm text-purple-400">投稿者: {item.author}</p>
        </div>
      ))}
    </div>
  </div>
);

// ショップ
const Shop = ({ products }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">オフィシャルショップ</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
            <p className="text-white/70 mb-3">{product.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-purple-400">¥{product.price.toLocaleString()}</span>
              <span className="text-sm text-white/60">在庫: {product.stock}</span>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>カートに追加</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 投票一覧
const PollList = ({ polls }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">投票・アンケート</h2>
    
    <div className="space-y-4">
      {polls.map(poll => (
        <div key={poll.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">{poll.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs ${
              poll.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {poll.isActive ? '投票受付中' : '終了'}
            </span>
          </div>
          <p className="text-white/60 mb-4">投票期限: {poll.endDate}</p>
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <button
                key={index}
                disabled={!poll.isActive}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  poll.isActive 
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50'
                    : 'bg-white/5 border border-white/5 cursor-not-allowed'
                }`}
              >
                <span className="text-white">{option}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(poll.votes[index] / Math.max(...poll.votes)) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/70 text-sm w-12 text-right">{poll.votes[index]}票</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// メッセージ一覧
const MessageList = ({ messages }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">メッセージ</h2>
    
    <div className="space-y-4">
      {messages.map(message => (
        <div key={message.id} className={`bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 ${
          !message.read ? 'border-purple-500/30' : ''
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
              {!message.read && (
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
              )}
            </div>
            <span className="text-sm text-white/60">{message.date}</span>
          </div>
          <p className="text-white/80 mb-3">{message.content}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-400">差出人: {message.from}</p>
            <button className="text-sm bg-purple-600/20 text-purple-400 px-3 py-1 rounded hover:bg-purple-600/30 transition-all">
              詳細を見る
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ポイント表示
const PointsView = ({ currentUser }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">ポイント履歴</h2>
    
    <div className="bg-gradient-to-r from-purple-600/20 to-pink-400/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
      <div className="text-center">
        <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-2">現在のポイント</h3>
        <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {currentUser.points}pt
        </p>
      </div>
    </div>

    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">ポイント獲得履歴</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-white">イベント参加</p>
            <p className="text-white/60 text-sm">2024-08-15</p>
          </div>
          <span className="text-green-400 font-bold">+100pt</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-white">投票参加</p>
            <p className="text-white/60 text-sm">2024-08-10</p>
          </div>
          <span className="text-green-400 font-bold">+50pt</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-white">商品購入</p>
            <p className="text-white/60 text-sm">2024-08-05</p>
          </div>
          <span className="text-red-400 font-bold">-200pt</span>
        </div>
      </div>
    </div>
  </div>
);

export default FanClubSystem;
