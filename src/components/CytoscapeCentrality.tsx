'use client';

import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

type CentralityItem = {
  id: string;
  name: string;
  degreeCentrality: number;
};

export default function CytoscapeCentrality() {
  const [centralityData, setCentralityData] = useState<CentralityItem[]>([]);

  useEffect(() => {
    const fetchCentrality = () => {
      fetch('/api/degreeCentrality')
        .then(res => res.json())
        .then(setCentralityData)
        .catch(err => console.error('中心性取得エラー:', err));
    };

    // 初回実行
    fetchCentrality();

    // 5秒ごとに更新
    const intervalId = setInterval(fetchCentrality, 5000);

    // クリーンアップ
    return () => clearInterval(intervalId);
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>人物</TableCell>
            <TableCell>次数中心性</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {centralityData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.degreeCentrality}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}