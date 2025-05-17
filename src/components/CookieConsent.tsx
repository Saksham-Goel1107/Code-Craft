'use client';

import { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 p-4 bg-white shadow-2xl border border-gray-200 rounded-2xl z-50 max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-800">
      <p className="text-sm">
        We only use cookies essential for login and registration. No marketing or tracking cookies are used.
      </p>
      <button
        onClick={acceptCookies}
        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-900 transition"
      >
        OK
      </button>
    </div>
  );
}
