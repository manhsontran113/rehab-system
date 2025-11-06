import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useRef } from 'react';
import { useInView } from '../hooks/useInView';

export const Landing = () => {
  // Refs for scroll animations
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const exercisesRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // Check if sections are in view
  const isHeroInView = useInView(heroRef, 0.1);
  const isFeaturesInView = useInView(featuresRef, 0.1);
  const isHowItWorksInView = useInView(howItWorksRef, 0.1);
  const isExercisesInView = useInView(exercisesRef, 0.1);
  const isCtaInView = useInView(ctaRef, 0.1);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      {/* Navbar Component */}
      <Navbar />

      {/* Hero Section - Full Screen */}
      <section 
        ref={heroRef}
        id="home" 
        className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-700 ${
          isHeroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gray-200/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Công nghệ AI Tiên tiến</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="block text-gray-900 dark:text-white mb-2">Phục Hồi Chức Năng</span>
            <span className="block bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              Tự Động & Thông Minh
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Theo dõi tập luyện tự động với AI. Không cần video. Chỉ cần camera và hệ thống sẽ đếm rep, phát hiện lỗi real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              to="/login-choice"
              className="group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 transform hover:scale-105"
            >
              Bắt Đầu Ngay
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <a
              href="#how-it-works"
              className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-bold text-lg transition"
            >
              Xem Demo
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-gray-300 dark:border-gray-800">
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-1">
                4+
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 font-medium">Bài Tập</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-1">
                95%+
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 font-medium">Độ Chính Xác</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-1">
                Real-time
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 font-medium">Phản Hồi</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        id="features" 
        className={`py-32 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-gray-900 transition-all duration-700 ${
          isFeaturesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Công Nghệ AI Đột Phá
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Hệ thống theo dõi tập luyện tự động sử dụng AI tiên tiến, không cần thiết bị đeo
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 hover:border-teal-500/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300">
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Phát Hiện Tự Động</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                AI tự động phát hiện bài tập và đếm rep mà không cần bạn nhập thủ công
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-cyan-500 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Phản Hồi Real-time</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Nhận cảnh báo ngay lập tức khi phát hiện tư thế không đúng
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 hover:border-purple-500/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Thống Kê Chi Tiết</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Theo dõi tiến độ với biểu đồ và phân tích lỗi chi tiết
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 hover:border-green-500/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">An Toàn Tối Đa</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Phát hiện lỗi tư thế giúp tránh chấn thương khi tập luyện
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        ref={howItWorksRef}
        id="how-it-works" 
        className={`py-32 bg-white dark:bg-gray-900 relative overflow-hidden transition-all duration-700 ${
          isHowItWorksInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Cách Hoạt Động
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Chỉ 3 bước đơn giản để bắt đầu hành trình phục hồi của bạn
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Lines */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 opacity-30"></div>

            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl text-center relative z-10 transition-colors duration-300">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-teal-500/50">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chọn Bài Tập</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Chọn từ 4+ bài tập phục hồi được thiết kế cho người cao tuổi
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl text-center relative z-10 transition-colors duration-300">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-cyan-500/50">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Theo Dõi</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  AI tự động đếm rep và phát hiện lỗi tư thế real-time
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl text-center relative z-10 transition-colors duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/50">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Xem Báo Cáo</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Nhận phân tích chi tiết và theo dõi tiến độ phục hồi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exercises Section */}
      <section 
        ref={exercisesRef}
        className={`py-32 bg-gray-100 dark:bg-black transition-all duration-700 ${
          isExercisesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Bài Tập Phục Hồi
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Các bài tập được thiết kế đặc biệt cho người cao tuổi
            </p>
          </div>

          {/* Exercise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'Squat (Gập Gối)', icon: '🦵', desc: 'Tăng cường cơ chân và khả năng di chuyển' },
              { name: 'Nâng Tay', icon: '💪', desc: 'Cải thiện sức mạnh vai và độ linh hoạt' },
              { name: 'Đứng 1 Chân', icon: '🧘', desc: 'Rèn luyện thăng bằng và ổn định' },
              { name: 'Nâng Gót Chân', icon: '🦶', desc: 'Tăng cường cơ bắp chân' },
            ].map((exercise, idx) => (
              <div key={idx} className="group bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 hover:border-teal-500/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{exercise.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{exercise.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{exercise.desc}</p>
                  </div>
                </div>
                <div className="flex items-center text-teal-500 dark:text-teal-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Tìm hiểu thêm →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className={`py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900 relative overflow-hidden transition-all duration-700 ${
          isCtaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.15),transparent_70%)]"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            Bắt Đầu Hành Trình Phục Hồi
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
            Tham gia ngay hôm nay và trải nghiệm công nghệ AI tiên tiến
          </p>
          <Link
            to="/login-choice"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-10 py-5 rounded-xl font-bold text-xl transition shadow-2xl shadow-teal-500/40 hover:shadow-teal-500/60 transform hover:scale-105"
          >
            Bắt Đầu Miễn Phí
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-900 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-2.5 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Rehab AI</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Hệ thống phục hồi chức năng AI cho người cao tuổi. Công nghệ tiên tiến, dễ sử dụng, hiệu quả.
            </p>

            {/* Links */}
            <div className="flex gap-8 mb-8">
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition">Tính Năng</a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition">Cách Hoạt Động</a>
              <Link to="/login-choice" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition">Đăng Nhập</Link>
            </div>

            {/* Copyright */}
            <div className="text-gray-500 dark:text-gray-600 text-sm">
              © 2025 Rehab AI. Made with ❤️ for elderly health
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};