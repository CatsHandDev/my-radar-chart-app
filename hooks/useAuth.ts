"use client";

import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // ★★★ ここが核心部分 ★★★
    // コンポーネントがブラウザに表示された後（マウント後）に実行される
    const adminStatus = sessionStorage.getItem('isAdmin');

    // sessionStorageに 'isAdmin' というキーで 'true' が保存されていれば...
    if (adminStatus === 'true') {
      // ...isAdmin state を true に更新する
      setIsAdmin(true);
    }
  }, []); // 空の依存配列なので、最初の1回だけ実行される

  // isAdmin state の現在の値を返す
  return { isAdmin };
};