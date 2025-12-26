import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogPage = () => {
  const featuredPost = {
    title: 'Jak wybrać idealnego fryzjera mobilnego? Kompletny przewodnik',
    excerpt: 'Dowiedz się, na co zwracać uwagę przy wyborze specjalisty, który przyjedzie do Twojego domu. Porady ekspertów i wskazówki od naszych najlepszych fryzjerów.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    author: 'Anna Kowalska',
    date: '20 grudnia 2024',
    readTime: '8 min',
    category: 'Porady',
  };

  const posts = [
    {
      title: '5 trendów w manicure na 2025 rok',
      excerpt: 'Poznaj najgorętsze trendy w stylizacji paznokci, które będą królować w nadchodzącym roku.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
      author: 'Marta Wiśniewska',
      date: '18 grudnia 2024',
      readTime: '5 min',
      category: 'Trendy',
    },
    {
      title: 'Masaż relaksacyjny w domu - co przygotować?',
      excerpt: 'Lista rzeczy, które warto mieć pod ręką przed wizytą masażysty w Twoim domu.',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
      author: 'Tomasz Zieliński',
      date: '15 grudnia 2024',
      readTime: '4 min',
      category: 'Porady',
    },
    {
      title: 'Jak zostać specjalistą na ToMyHomeApp?',
      excerpt: 'Przewodnik krok po kroku dla profesjonalistów, którzy chcą dołączyć do naszej platformy.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      author: 'Piotr Nowak',
      date: '12 grudnia 2024',
      readTime: '6 min',
      category: 'Dla specjalistów',
    },
    {
      title: 'Pielęgnacja włosów zimą - porady eksperta',
      excerpt: 'Jak dbać o włosy w chłodne miesiące? Nasze specjalistki dzielą się sekretami.',
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',
      author: 'Karolina Maj',
      date: '10 grudnia 2024',
      readTime: '5 min',
      category: 'Porady',
    },
    {
      title: 'Historia sukcesu: Od małego salonu do 100 klientów miesięcznie',
      excerpt: 'Poznaj historię Ewy, która dzięki ToMyHomeApp rozwinęła swój biznes.',
      image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=400',
      author: 'Ewa Szymańska',
      date: '8 grudnia 2024',
      readTime: '7 min',
      category: 'Historie sukcesu',
    },
    {
      title: 'Bezpieczeństwo usług mobilnych - na co zwracać uwagę?',
      excerpt: 'Wskazówki dotyczące bezpieczeństwa zarówno dla klientów, jak i specjalistów.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
      author: 'Anna Kowalska',
      date: '5 grudnia 2024',
      readTime: '6 min',
      category: 'Bezpieczeństwo',
    },
  ];

  const categories = ['Wszystkie', 'Porady', 'Trendy', 'Dla specjalistów', 'Historie sukcesu', 'Bezpieczeństwo'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Porady, inspiracje i nowości ze świata beauty i wellness. 
            Bądź na bieżąco z najnowszymi trendami!
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-64 lg:h-full object-cover"
              />
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full w-fit mb-4">
                  {featuredPost.category}
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">{featuredPost.title}</h2>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <button className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                  Czytaj więcej
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Najnowsze artykuły</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article
                key={index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 text-sm font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 lg:p-12 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Nie przegap żadnego artykułu!</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Zapisz się do naszego newslettera i otrzymuj najnowsze porady i inspiracje prosto na swoją skrzynkę.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Twój email..."
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:shadow-lg transition-all">
                Zapisz się
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
