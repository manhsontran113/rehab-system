import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Landing = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-teal-600 text-white p-2 rounded-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-800">Rehab System</span>
            </div>
            
            <div className="hidden md:flex space-x-8 text-lg">
              <a href="#home" className="text-teal-600 font-semibold hover:text-teal-700">
                🏠 Trang Chủ
              </a>
              {user && (
                <>
                  <Link to="/exercise" className="text-gray-600 hover:text-teal-600">
                    💪 Bài Tập
                  </Link>
                  <Link to="/history" className="text-gray-600 hover:text-teal-600">
                    📖 Lịch Sử
                  </Link>
                </>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg text-gray-600">Xin chào,</p>
                  <p className="text-xl font-bold text-teal-600">{user.full_name}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition"
                >
                  Đăng Xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login-choice"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition shadow-lg"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Hệ Thống Phục Hồi Chức Năng
        </h1>
        <p className="text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
          Sử dụng AI để hỗ trợ người cao tuổi tập luyện phục hồi
        </p>
        <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          chức năng tại nhà một cách an toàn và hiệu quả
        </p>

        <div className="flex justify-center gap-6">
          <Link
            to="/login-choice"
            className="bg-teal-600 hover:bg-teal-700 text-white px-10 py-5 rounded-lg font-bold text-xl transition shadow-2xl transform hover:scale-105"
          >
            Bắt Đầu Ngay
          </Link>
          <a
            href="#how-to-use"
            className="bg-gray-600 hover:bg-gray-700 text-white px-10 py-5 rounded-lg font-bold text-xl transition shadow-2xl transform hover:scale-105"
          >
            Xem Lịch Sử
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="flex items-start space-x-4">
                <div className="bg-teal-100 p-4 rounded-lg">
                  <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Phát Hiện Tư Thế</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    AI phát hiện và phân tích tư thế tập luyện của bạn real-time
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-4 rounded-lg">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Theo Dõi Tiến Độ</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Xem lịch sử và thống kê chi tiết về quá trình phục hồi
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-4 rounded-lg">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Thân Thiện Người Cao Tuổi</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Giao diện đơn giản, dễ sử dụng với font chữ lớn và màu tương phản cao
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-4 rounded-lg">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">An Toàn & Hiệu Quả</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Cảnh báo ngay khi phát hiện tư thế không đúng để tránh chấn thương
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How To Use Section */}
      <section id="how-to-use" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">Cách Sử Dụng</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-teal-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Chọn Bài Tập</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Chọn bài tập phù hợp với tình trạng sức khỏe của bạn
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-teal-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Bắt Đầu Tập</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                AI sẽ theo dõi và đưa ra phản hồi real-time về tư thế của bạn
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-teal-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Xem Kết Quả</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nhận báo cáo chi tiết và theo dõi tiến độ phục hồi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Sẵn Sàng Bắt Đầu Hành Trình Phục Hồi?
          </h2>
          <p className="text-2xl text-teal-100 mb-10 leading-relaxed">
            Hãy bắt đầu buổi tập đầu tiên của bạn ngay hôm nay!
          </p>
          <Link
            to="/login-choice"
            className="inline-block bg-white text-teal-600 hover:bg-gray-100 px-12 py-6 rounded-lg font-bold text-2xl transition shadow-2xl transform hover:scale-105"
          >
            Bắt Đầu Ngay →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-teal-600 text-white p-2 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Rehab System V3</span>
          </div>
          <p className="text-lg mb-4">Hệ thống phục hồi chức năng AI cho người cao tuổi</p>
          <p className="text-base text-gray-400">
            © 2025 Rehab System. Made with ❤️ for elderly health
          </p>
        </div>
      </footer>
    </div>
  );
};
