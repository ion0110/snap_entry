-- サンプルデータ投入（9件）
-- 「重要」フラグ付きを2件含む

INSERT INTO participants (name, company, status, memo) VALUES
('佐藤一郎', '株式会社テクノロジー', 'pending', NULL),
('鈴木花子', 'デザイン工房', 'pending', NULL),
('田中太郎', 'マーケティング社', 'pending', '重要: 大口顧客'),
('高橋美咲', 'コンサルティングファーム', 'pending', NULL),
('伊藤健', 'スタートアップ株式会社', 'pending', NULL),
('渡辺優子', 'メディア出版', 'pending', '重要: VIP対応必要'),
('山本大輔', 'エンジニアリング合同会社', 'pending', NULL),
('中村さくら', 'ソフトウェア開発', 'pending', NULL),
('小林誠', 'ビジネスソリューションズ', 'pending', NULL);
