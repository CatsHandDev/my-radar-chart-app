import { Template } from "../types";
// ★ userMasterData をインポートして、既存ユーザーの情報を参照する
import { userMasterData } from "./confidentialData";

// ★ 既存ユーザーのデータを元に、動的にテンプレートを生成する
export const templates: Template[] = userMasterData.map(user => {
  return {
    // テンプレートのIDとして、元となるユーザーのIDを使用
    templateId: user.userId,
    // テンプレート名として、元となるユーザーの名前を使用
    templateName: `${user.userName}`,
    // 項目リストは、実績値(value)を0にリセットして設定
    items: user.items.map(item => ({
      ...item,
      value: 0,
    })),
  };
});