import React from 'react';
import { motion } from 'framer-motion';
import { Home, Mail, Phone, MapPin, Github, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = [
    {
      title: '서비스',
      links: [
        { name: '개인 모드', href: '#' },
        { name: '그룹 모드', href: '#' },
        { name: 'AI 도우미', href: '#' },
        { name: '미니게임', href: '#' },
      ]
    },
    {
      title: '지원',
      links: [
        { name: '도움말', href: '#' },
        { name: '문의하기', href: '#' },
        { name: 'FAQ', href: '#' },
        { name: '피드백', href: '#' },
      ]
    },
    {
      title: '회사',
      links: [
        { name: '회사소개', href: '#' },
        { name: '채용정보', href: '#' },
        { name: '블로그', href: '#' },
        { name: '파트너십', href: '#' },
      ]
    },
    {
      title: '법적고지',
      links: [
        { name: '이용약관', href: '#' },
        { name: '개인정보처리방침', href: '#' },
        { name: '쿠키정책', href: '#' },
        { name: '저작권정책', href: '#' },
      ]
    }
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-20 hidden md:block">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <img src="/image/Logo.png" alt="우리.zip" className="w-16 h-16" />
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                하우스메이트와 함께하는 스마트한 공동생활 관리 플랫폼. 
                우리의 하루를 더 편리하고 즐겁게 만들어보세요.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>서울특별시 강남구 테헤란로 123</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>02-1234-5678</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>contact@woori-zip.com</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-600 text-sm">
              © 2024 우리.zip. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;