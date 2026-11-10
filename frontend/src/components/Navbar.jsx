import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { HeartPulse, LogOut, PhoneCall, Globe, Activity, Menu, X, Bell, CheckCheck } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab, openAuthModal }) => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, currentTab]);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    const res = await api.markNotificationsRead();
    if (res.success) {
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    }
  };

  const navigateTo = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setNotifOpen(false);
  };

  const rolePortalLabel = () => {
    if (!user) return '';
    if (user.role === 'patient') return t('patientPortal');
    if (user.role === 'doctor') return t('doctorPortal');
    if (user.role === 'receptionist') return t('receptionistPortal');
    if (user.role === 'admin') return t('adminDashboard');
    return t('dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo */}
          <button
            type="button"
            className="flex items-center space-x-3 text-left focus:outline-none shrink-0"
            onClick={() => navigateTo('home')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-600/20">
              <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  {t('brand')}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  SLMC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'home', label: t('home') },
              { id: 'doctors', label: t('doctors') },
              { id: 'book', label: t('bookAppointment') },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentTab === item.id
                    ? 'bg-teal-50 text-teal-700 border border-teal-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user && (
              <button
                onClick={() => navigateTo('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  currentTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{rolePortalLabel()}</span>
              </button>
            )}
          </nav>

          {/* Right Action Controls (Desktop + Compact Mobile/Tablet Controls) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* 1990 Emergency Pill (Desktop) */}
            <a
              href="tel:1990"
              className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('emergencyCall')}</span>
            </a>

            {/* Tri-Lingual Toggle (Desktop) */}
            <div className="hidden lg:flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${lang === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('si')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${lang === 'si' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                සිං
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${lang === 'ta' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                தமிழ்
              </button>
            </div>

            {/* Notification Bell (All viewports when logged in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    if (!notifOpen) fetchNotifications();
                  }}
                  title="Notifications"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-all border border-slate-200 relative"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-left space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <span className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-xs text-slate-500 text-center py-4">No notifications yet.</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl border text-xs ${
                              n.is_read ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-teal-50/70 border-teal-200 text-slate-800'
                            }`}
                          >
                            <div className="font-bold text-slate-900">{n.title}</div>
                            <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth Buttons (Desktop) */}
            {user ? (
              <div className="hidden lg:flex items-center space-x-2.5 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 leading-tight">{user.full_name}</div>
                  <div className="text-[11px] text-teal-700 uppercase font-semibold tracking-wide">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 transition-all border border-slate-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm shadow-teal-600/20 transition-all"
              >
                {t('login')} / {t('register')}
              </button>
            )}

            {/* Mobile & Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 shadow-lg px-4 py-4 space-y-3">
          {user && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">{user.full_name}</div>
                <div className="text-xs text-teal-700 uppercase font-semibold">{user.role}</div>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => navigateTo('home')}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-semibold ${
                currentTab === 'home' ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => navigateTo('doctors')}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-semibold ${
                currentTab === 'doctors' ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('doctors')}
            </button>
            <button
              onClick={() => navigateTo('book')}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-semibold ${
                currentTab === 'book' ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('bookAppointment')}
            </button>
            {user && (
              <button
                onClick={() => navigateTo('dashboard')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
                  currentTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{rolePortalLabel()}</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${lang === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('si')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${lang === 'si' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'}`}
              >
                සිං
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${lang === 'ta' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'}`}
              >
                தமிழ்
              </button>
            </div>

            <a
              href="tel:1990"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('emergencyCall')}</span>
            </a>
          </div>

          {!user && (
            <button
              onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm text-center shadow-sm"
            >
              {t('login')} / {t('register')}
            </button>
          )}
        </div>
      )}
    </header>
  );
};
