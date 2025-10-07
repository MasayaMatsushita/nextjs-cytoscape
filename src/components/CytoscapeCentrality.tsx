/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

type CentralityItem = {
  id: string;
  name: string;
  degreeCentrality: number;
  betweennessCentrality: number;
};

export default function CytoscapeCentrality() {
  const [centralityData, setCentralityData] = useState<CentralityItem[]>([]);

  useEffect(() => {
    const fetchCentrality = () => {
      Promise.all([
        fetch('/api/degreeCentrality').then(res => res.json()),
        fetch('/api/betweennessCentrality').then(res => res.json())
      ])
        .then(([degreeData, betweennessData]) => {
          // ID をキーにしてマージ
          const mergedMap = new Map<string, any>();

          degreeData.forEach((item: any) => {
            mergedMap.set(item.id, { ...item });
          });

          betweennessData.forEach((item: any) => {
            const existing = mergedMap.get(item.id) || {};
            mergedMap.set(item.id, {
              ...existing,
              betweennessCentrality: item.betweennessCentrality
            });
          });

          const mergedArray = Array.from(mergedMap.values());
          setCentralityData(mergedArray);
        })
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
            <TableCell>媒介中心性</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {centralityData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.degreeCentrality.toFixed(2)}</TableCell>
              <TableCell>{item.betweennessCentrality.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}