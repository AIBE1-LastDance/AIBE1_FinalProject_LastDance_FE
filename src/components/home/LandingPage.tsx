import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckSquare, CreditCard, Users, Gamepad2, Bot, ArrowRight, Star, Users2, Shield, Heart, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: '스마트 캘린더',
      description: '개인과 그룹 일정을 한 눈에 관리하고 공유하세요',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CheckSquare,
      title: '할일 관리',
      description: '효율적인 작업 분배와 진행 상황 추적',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: CreditCard,
      title: '가계부',
      description: '개인 및 공동 지출을 체계적으로 관리',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: '커뮤니티',
      description: '같은 관심사를 가진 사람들과 소통하고 정보 공유',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Gamepad2,
      title: '미니게임',
      description: '재미있는 게임으로 스트레스 해소',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Bot,
      title: 'AI 도우미',
      description: '똑똑한 AI가 일상을 더욱 편리하게',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const testimonials = [
    {
      name: '김민수',
      role: '직장인',
      content: '개인 모드와 그룹 모드를 자유롭게 전환할 수 있어서 정말 편해요!',
      rating: 5
    },
    {
      name: '이지영',
      role: '대학생',
      content: 'AI 도우미가 정말 똑똑해요. 일정 관리가 훨씬 쉬워졌어요.',
      rating: 5
    },
    {
      name: '박성호',
      role: '프리랜서',
      content: '미니게임으로 업무 스트레스를 풀 수 있어서 좋아요.',
      rating: 5
    }
  ];

  const stats = [
    { number: '10,000+', label: '활성 사용자' },
    { number: '50,000+', label: '관리된 일정' },
    { number: '98%', label: '사용자 만족도' },
    { number: '24/7', label: '고객 지원' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-primary-600/20" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-30"
              animate={{
                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%'
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img src="/image/Logo.png" alt="우리.zip" className="w-48 h-48 mx-auto mb-8 drop-shadow-lg" />
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                우리.zip
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              개인과 그룹 생활을 하나로 묶어주는 스마트 라이프 플랫폼
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              className="group bg-gradient-to-r from-primary-500 to-primary-600 text-white px-12 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
            >
              시작하기
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              className="border-2 border-primary-500 text-primary-600 px-12 py-4 rounded-2xl text-lg font-semibold hover:bg-primary-50 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              더 알아보기
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 flex justify-center items-center space-x-8 text-gray-600"
          >
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span>4.9/5 사용자 평점</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users2 className="w-5 h-5 text-primary-500" />
              <span>10,000+ 활성 사용자</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary-500 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-primary-500 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              모든 것을 <span className="text-primary-600">하나로</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              개인 모드와 그룹 모드를 자유롭게 전환하며, 
              일정, 할일, 가계부, 커뮤니티까지 한 번에 관리하세요
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center text-white"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-100 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              사용자들의 <span className="text-primary-600">이야기</span>
            </h2>
            <p className="text-xl text-gray-600">
              실제 사용자들이 전하는 우리.zip의 경험
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-16 h-16 text-white mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto">
              개인과 그룹 생활을 더욱 스마트하게 관리할 수 있는 새로운 경험을 만나보세요
            </p>

            <motion.button
              className="bg-white text-primary-600 px-12 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
            >
              무료로 시작하기
              <Heart className="inline-block ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img src="/image/Logo.png" alt="우리.zip" className="w-14 h-14" />
                <h3 className="text-2xl font-bold">우리.zip</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                개인과 그룹 생활을 하나로 묶어주는 스마트 라이프 플랫폼으로, 
                더 나은 일상을 만들어갑니다.
              </p>
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="w-4 h-4" />
                <span>안전하고 신뢰할 수 있는 서비스</span>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li>개인 모드</li>
                <li>그룹 모드</li>
                <li>AI 도우미</li>
                <li>미니게임</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>고객센터</li>
                <li>사용 가이드</li>
                <li>FAQ</li>
                <li>개발자 API</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 우리.zip. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
