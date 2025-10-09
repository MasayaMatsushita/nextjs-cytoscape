/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Popover, Typography } from '@mui/material';
import { usePersonGraph } from '@/components/usePersonGraph';

const PersonGraph = () => {
  const {
    cyRef,
    cyInstance,
    selectedPerson,
    anchorPosition,
    setSelectedPerson,
    setAnchorPosition,
  } = usePersonGraph();

  const exportNetworkJson = () => {
    if (!cyInstance) return;
    const json = cyInstance.json();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'person-network.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAnalysisJson = async () => {
    const [degreeRes, betweennessRes, networkRes] = await Promise.all([
      fetch('/api/degreeCentrality'),
      fetch('/api/betweennessCentrality'),
      fetch('/api/networkAnalysis'),
    ]);

    const degreeData = await degreeRes.json();
    const betweennessData = await betweennessRes.json();
    const networkData = await networkRes.json();

    const merged = degreeData.map((degree: any) => {
      const match = betweennessData.find((b: any) => b.id === degree.id);
      return {
        id: degree.id,
        name: degree.name,
        degreeCentrality: degree.degreeCentrality,
        betweennessCentrality: match?.betweennessCentrality ?? null,
      };
    });

    const result = {
      Centrality: merged,
      Network: {
        graphDensity: networkData.graphDensity,
        clusteringCoefficient: networkData.clusteringCoefficient,
      },
    };

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={exportNetworkJson}
        style={{
          marginTop: '12px',
          padding: '8px 16px',
          backgroundColor: '#0070f3',
          color: '#fff',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ネットワークJSON出力
      </button>

      <button
        onClick={exportAnalysisJson}
        style={{
          marginTop: '12px',
          marginLeft: '8px',
          padding: '8px 16px',
          backgroundColor: '#22c55e',
          color: '#fff',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ネットワーク分析JSON出力
      </button>

      <div ref={cyRef} style={{ width: '100%', height: '500px' }} />

      <Popover
        open={Boolean(selectedPerson && anchorPosition)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition ?? { top: 0, left: 0 }}
        onClose={() => {
          setSelectedPerson(null);
          setAnchorPosition(null);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <div style={{ padding: '12px', maxWidth: '200px' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {selectedPerson?.name}
          </Typography>
          <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(selectedPerson, null, 2)}
          </Typography>
        </div>
      </Popover>
    </div>
  );
};

export default PersonGraph;
