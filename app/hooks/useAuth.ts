"use client";

import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // コンポーネントがマウントされた後に、セッションストレージをチェック
    // (サーバーサイドレンダリングでは sessionStorage が存在しないため)
    const adminStatus = sessionStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []); // 空の依存配列で、初回レンダリング時のみ実行

  return { isAdmin };
};