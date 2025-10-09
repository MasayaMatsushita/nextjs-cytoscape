/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import {
  Tabs, Tab, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

type NodeItem = {
  id: string;
  name: string;
  degreeCentrality: number;
  betweennessCentrality: number;
  group: number;
};

type NetworkAnalysisItem = {
  graphDensity: number;
  clusteringCoefficient: number;
};

export default function CytoscapeCentrality() {
  const [tabIndex, setTabIndex] = useState(0);
  const [nodeData, setNodeData] = useState<NodeItem[]>([]);
  const [networkData, setNetworkData] = useState<NetworkAnalysisItem | null>(null);

  useEffect(() => {
    const fetchCentrality = () => {
      Promise.all([
        fetch('/api/degreeCentrality').then(res => res.json()),
        fetch('/api/betweennessCentrality').then(res => res.json()),
        fetch('/api/louvainClustering').then(res => res.json())
      ])
        .then(([degreeData, betweennessData, groupData]) => {
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
          groupData.forEach((item: any) => {
            const existing = mergedMap.get(item.id) || {};
            mergedMap.set(item.id, {
              ...existing,
              group: item.group
            });
          });
          setNodeData(Array.from(mergedMap.values()));
        })
        .catch(err => console.error('中心性取得エラー:', err));
    };

    const fetchNetworkAnalysis = () => {
      fetch('/api/networkAnalysis')
        .then(res => res.json())
        .then(data => setNetworkData(data))
        .catch(err => console.error('ネットワーク分析取得エラー:', err));
    };

    fetchCentrality();
    fetchNetworkAnalysis();

    const intervalId = setInterval(() => {
      fetchCentrality();
      fetchNetworkAnalysis();
    }, Number(process.env.NEXT_PUBLIC_UPDATE_TIME ?? 5000));

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box>
      <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)}>
        <Tab label="ネットワーク分析" />
        <Tab label="中心性分析" />
      </Tabs>

      {tabIndex === 1 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>人物</TableCell>
                <TableCell>次数中心性</TableCell>
                <TableCell>媒介中心性</TableCell>
                <TableCell>グループ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nodeData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.degreeCentrality}</TableCell>
                  <TableCell>{item.betweennessCentrality}</TableCell>
                  <TableCell>{item.group}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabIndex === 0 && networkData && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>グラフ密度</TableCell>
                <TableCell>クラスタ係数</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{networkData.graphDensity.toFixed(2)}</TableCell>
                <TableCell>{networkData.clusteringCoefficient.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}