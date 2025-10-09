/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

const PersonGraph = () => {
  const cyRef = useRef<HTMLDivElement>(null);
  const [cyInstance, setCyInstance] = useState<cytoscape.Core | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const fetchDataAndRender = async () => {
      const [personsRes, relationsRes, groupRes] = await Promise.all([
        fetch('/api/persons'),
        fetch('/api/relations'),
        fetch('/api/louvainClustering'),
      ]);

      const persons = await personsRes.json();
      const relations = await relationsRes.json();
      const groupData = await groupRes.json();

      const groupMap = new Map<string, number>();
      groupData.forEach((item: any) => {
        groupMap.set(item.id, item.group);
      });

      persons.forEach((person: any) => {
        person.data.group = groupMap.get(person.data.id) ?? 0;
      });

      const uniqueGroups = [...new Set(persons.map((p: any) => p.data.group))];

      const groupColors = [
        '#0070f3', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
        '#0ea5e9', '#14b8a6', '#e11d48', '#7c3aed', '#f43f5e'
      ];

      const nodeStyles = uniqueGroups.map((group, index) => ({
        selector: `node[group = ${group}]`,
        style: {
          'background-color': groupColors[index % groupColors.length],
        },
      }));

      const elements = [...persons, ...relations];

      if (cyRef.current) {
        const cy = cytoscape({
          container: cyRef.current,
          elements,
          style: [
            {
              selector: 'node',
              style: {
                'label': 'data(name)',
                'color': '#fff',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '12px',
                'shape': 'roundrectangle',
                'width': '75px'
              },
            },
            ...nodeStyles,
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(department)',
                'font-size': '10px',
                'text-background-color': '#fff',
                'text-background-opacity': 1,
                'text-background-padding': '2px',
              },
            },
          ],
          layout: {
            name: 'circle',
          },
        });

        cy.on('tap', 'node', (event) => {
          const node = event.target;
          const nodeData = node.data();
          const pos = node.renderedPosition();

          const containerRect = cyRef.current!.getBoundingClientRect();

          setSelectedPerson(nodeData);
          setAnchorPosition({
            top: containerRect.top + pos.y,
            left: containerRect.left + pos.x,
          });
        });

        cy.on('tap', (event) => {
          if (event.target === cy) {
            setSelectedPerson(null);
            setAnchorPosition(null);
          }
        });

        setCyInstance(cy);
      }
    };

    fetchDataAndRender();

    return () => {
      cyInstance?.destroy();
    };
  }, []);

  // personsのポーリング
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch('/api/persons');
    const newPersons = await res.json();

    newPersons.forEach((person: any) => {
      if (!cyInstance?.getElementById(person.data.id).length) {
        cyInstance?.add(person);
        cyInstance?.layout({ name: 'circle' }).run();
      }
    });
  }, Number(process.env.NEXT_PUBLIC_UPDATE_TIME ?? 5000));

  return () => clearInterval(interval);
}, [cyInstance]);

// relationsのポーリング
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch('/api/relations');
    const newRelations = await res.json();

    newRelations.forEach((relation: any) => {
      if (!cyInstance?.getElementById(relation.data.id).length) {
        cyInstance?.add(relation);
        cyInstance?.layout({ name: 'circle' }).run();
      }
    });
  }, Number(process.env.NEXT_PUBLIC_UPDATE_TIME ?? 5000));

  return () => clearInterval(interval);
}, [cyInstance]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => {
          if (cyInstance) {
            const json = cyInstance.json();
            const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'person-network.json';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
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
        onClick={async () => {
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
        }}
        style={{
          marginTop: '12px',
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
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
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
