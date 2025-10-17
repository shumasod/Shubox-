import React, { useState } from 'react';

const giraffeFacts = [
  { icon: "😴", title: "睡眠", text: "キリンの睡眠時間は1日たったの20分〜2時間程度です。" },
  { icon: "🏃‍♂️", title: "スピード", text: "走ると時速約60kmのスピードに達します。" },
  { icon: "🦴", title: "首の骨", text: "首の骨の数は人間と同じ7個です。" },
  { icon: "👨‍👩‍👧", title: "社会性", text: "群れで生活し、時には50頭以上の大きな群れをつくります。" },
  { icon: "🌍", title: "保全状況", text: "IUCNレッドリストでは「危急種（Vulnerable）」に指定されています。" },
];

const externalLinks = [
  { href: "https://ja.wikipedia.org/wiki/%E3%82%AD%E3%83%AA%E3%83%B3", text: "Wikipedia: キリン" },
  { href: "https://www.wwf.or.jp/activities/basicinfo/3849.html", text: "WWF: キリン保護" },
  { href: "https://www.ueno-zoo.jp/animals/mammal/giraffe", text: "上野動物園: キリン" },
];

const ImageWithFallback = ({ src, alt, className, aspectRatio = "4/3" }) => {
  const [imageStatus, setImageStatus] = useState('loading');

  return (
    <div className={`relative ${className}`} style={{ aspectRatio }}>
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 animate-pulse flex items-center justify-center">
          <div className="text-amber-600 text-sm font-medium">読み込み中...</div>
        </div>
      )}
      
      {imageStatus === 'error' && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center p-4">
          <div className="text-6xl mb-3">🦒</div>
          <p className="text-amber-700 text-sm text-center">画像を読み込めませんでした</p>
        </div>
      )}
      
      <img 
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageStatus('loaded')}
        onError={() => setImageStatus('error')}
        loading="lazy"
      />
    </div>
  );
};

const FactCard = ({ fact }) => (
  <article className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
    <div className="text-4xl mb-3" role="img" aria-label={fact.title}>
      {fact.icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{fact.title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{fact.text}</p>
  </article>
);

const GiraffePage = () => {
  const [isMainImageHovered, setIsMainImageHovered] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4 tracking-tight">
            🦒 Beautiful Giraffe
          </h1>
          <p className="text-lg md:text-xl text-amber-700 max-w-2xl mx-auto leading-relaxed">
            自然界で最も優雅で美しい生き物、キリンの魅力を発見しよう
          </p>
        </header>

        {/* メイン画像セクション */}
        <section 
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden mb-12 transform transition-all duration-300 hover:shadow-3xl"
          onMouseEnter={() => setIsMainImageHovered(true)}
          onMouseLeave={() => setIsMainImageHovered(false)}
          aria-label="キリンのメイン画像"
        >
          <div className="relative overflow-hidden">
            <ImageWithFallback
              src="/api/placeholder/1200/800"
              alt="サバンナの自然環境で優雅に立つキリン。特徴的な斑点模様と長い首が印象的"
              className={`transition-transform duration-700 ${
                isMainImageHovered ? 'scale-110' : 'scale-100'
              }`}
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-300 ${
              isMainImageHovered ? 'opacity-100' : 'opacity-0'
            }`} />
          </div>
          
          <div className="p-8 bg-gradient-to-br from-white to-amber-50">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              地球上で最も背の高い哺乳類
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5 text-lg">
              キリンは最大5.5メートルの高さに達する驚異的な生き物です。
              その美しい斑点模様は、人間の指紋と同じように個体ごとに異なります。
              アフリカのサバンナで優雅に暮らすキリンは、自然界の奇跡の一つです。
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                🌿 野生動物
              </span>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                🌍 アフリカサバンナ
              </span>
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                🥬 草食動物
              </span>
            </div>
          </div>
        </section>

        {/* 画像ギャラリー */}
        <section className="mb-12" aria-labelledby="gallery-heading">
          <h2 id="gallery-heading" className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">🖼️</span>
            キリンのフォトギャラリー
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 1, alt: "草原で親子の絆を深めるキリン" },
              { id: 2, alt: "夕暮れのサバンナを歩く美しいキリンのシルエット" },
              { id: 3, alt: "木の葉を器用に食べるキリンの様子" },
            ].map((img) => (
              <div 
                key={img.id}
                className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <ImageWithFallback
                  src={`/api/placeholder/800/600?img=${img.id}`}
                  alt={img.alt}
                  className="group-hover:scale-110 transition-transform duration-500"
                  aspectRatio="4/3"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 豆知識 */}
        <section className="mb-12" aria-labelledby="facts-heading">
          <h2 id="facts-heading" className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">🦒</span>
            キリン豆知識
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {giraffeFacts.map((fact, idx) => (
              <FactCard key={idx} fact={fact} />
            ))}
          </div>
        </section>

        {/* 保護活動への呼びかけ */}
        <section className="mb-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-3xl">💚</span>
            キリンを守ろう
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            キリンは生息地の減少や密猟により、個体数が減少しています。
            私たちにできることから始めて、この美しい生き物を未来に残しましょう。
          </p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://www.wwf.or.jp"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-md"
            >
              保護活動について
            </a>
            <a 
              href="https://www.worldwildlife.org/species/giraffe"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-md border-2 border-white"
            >
              詳しく知る
            </a>
          </div>
        </section>

        {/* 外部リンク */}
        <section aria-labelledby="links-heading">
          <h2 id="links-heading" className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">🔗</span>
            もっと知りたい方へ
          </h2>
          <nav className="bg-white rounded-xl p-6 shadow-lg">
            <ul className="space-y-3">
              {externalLinks.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium transition-colors group"
                  >
                    <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                    <span className="group-hover:underline">{link.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* フッター */}
        <footer className="mt-12 text-center text-amber-700 text-sm">
          <p>キリンの美しさと魅力を多くの人に伝え、保護活動を応援しましょう 🦒💛</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </main>
  );
};

export default GiraffePage;
