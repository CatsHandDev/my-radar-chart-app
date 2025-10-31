"use client";

import { useState, useEffect } from 'react';

// フックの返り値の型を定義
type AuthHook = {
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useAuth = (): AuthHook => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // ページが読み込まれた後（クライアントサイドで）一度だけ実行
    try {
      const adminStatus = sessionStorage.getItem('isAdmin');
      if (adminStatus === 'true') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("sessionStorageへのアクセスに失敗しました:", error);
    }
  }, []); // 空の依存配列で初回レンダリング時のみ実行

  return { isAdmin, setIsAdmin };
};