import { MessageCircle, Youtube, Send, Music } from 'lucide-react';

const SOCIAL_LINKS = [
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    url: 'https://www.whatsapp.com/business/',
    color: 'hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: 'https://www.youtube.com/@toshderivsignalbot',
    color: 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30',
  },
  {
    name: 'Telegram',
    icon: Send,
    url: 'https://t.me/tosh_freesignal',
    color: 'hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30',
  },
  {
    name: 'TikTok',
    icon: Music,
    url: '#',
    color: 'hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/30',
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-400 border-t border-gray-800/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target={link.url !== '#' ? '_blank' : undefined}
              rel={link.url !== '#' ? 'noopener noreferrer' : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg
                       bg-surface-light border border-gray-700/50
                       text-gray-400 transition-all duration-200
                       ${link.color}`}
              title={link.name}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{link.name}</span>
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent mb-6" />

        {/* Copyright */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            © {currentYear} TOSH-X-BOT. All rights reserved.
          </p>
          <p className="text-xs text-primary-500/50 font-medium tracking-wide uppercase">
            Owned by: Chigozie Michael Ihuoma
          </p>
        </div>
      </div>
    </footer>
  );
}
