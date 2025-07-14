import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';
import LegalModal from '../legal/LegalModal';
import TermsContent from '../legal/TermsContent';
import PrivacyPolicyContent from '../legal/PrivacyPolicyContent';

const Footer: React.FC = () => {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const footerLinks = [
    {
      title: '서비스',
      links: [
        { name: '대시보드', href: '/dashboard' },
        { name: '미니게임', href: '/games' },
        { name: '캘린더', href: '/calendar' },
        { name: 'AI 도우미', href: '/ai-assistant' },
        { name: '할일', href: '/tasks' },
        { name: '커뮤니티', href: '/community' },
        { name: '가계부', href: '/expenses' },
        { name: '청년정책', href: '/youth-policy' },
      ]
    },
    {
      title: '법적고지',
      links: [
        { name: '이용약관', action: () => setIsTermsModalOpen(true) },
        { name: '개인정보처리방침', action: () => setIsPrivacyModalOpen(true) },
      ]
    }
  ];

  const logoUrl = import.meta.env.VITE_LOGO_URL;

  return (
    <>
      <footer className="bg-white border-t border-gray-200 mt-20 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Company Info */}
            <div className="lg:col-span-6 lg:col-start-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <img src={logoUrl} alt="우리.zip" className="w-16 h-16" />
                  <span className="text-2xl sm:text-3xl font-title font-bold text-primary-500">
                    우리.zip
                  </span>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  하우스메이트와 함께하는 스마트한 공동생활 관리 플랫폼. <br/>
                  우리의 하루를 더 편리하고 즐겁게 만들어보세요.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>서울특별시 서초구 반포대로 45, 4층(서초동, 명정빌딩)</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>lastdance857@gmail.com</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer Links */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-6">
              {footerLinks.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
                  <ul className={section.title === '서비스' ? 'grid grid-cols-2 gap-y-3' : 'space-y-3'}>
                    {section.links.map((link) => (
                      <li key={link.name}>
                        {'href' in link ? (
                          <motion.a
                            href={link.href}
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                            whileHover={{ x: 4 }}
                          >
                            {link.name}
                          </motion.a>
                        ) : (
                          <motion.button
                            onClick={link.action}
                            className="text-gray-600 hover:text-primary-600 transition-colors text-left"
                            whileHover={{ x: 4 }}
                          >
                            {link.name}
                          </motion.button>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
              <p className="text-gray-600 text-sm">
                © 2025 우리.zip. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title="이용약관"
      >
        <TermsContent />
      </LegalModal>

      <LegalModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="개인정보처리방침"
      >
        <PrivacyPolicyContent />
      </LegalModal>
    </>
  );
};

export default Footer;