/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';

type AnchorPosition = { top: number; left: number } | null;

export const usePersonGraph = () => {
  const cyRef = useRef<HTMLDivElement>(null);
  const [cyInstance, setCyInstance] = useState<Core | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>(null);
  const [groupColoringEnabled, setGroupColoringEnabled] = useState(false);

  // 初期化と描画
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

      const nodeStyles = groupColoringEnabled
        ? uniqueGroups.map((group, index) => ({
            selector: `node[group = ${group}]`,
            style: {
              'background-color': groupColors[index % groupColors.length],
            },
          }))
        : [
            {
              selector: 'node',
              style: {
                'background-color': '#888',
              },
            },
          ];

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
                'width': '75px',
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
          layout: { name: 'circle' },
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
    if (!cyInstance) return;
    const interval = setInterval(async () => {
      const res = await fetch('/api/persons');
      const newPersons = await res.json();

      newPersons.forEach((person: any) => {
        if (!cyInstance.getElementById(person.data.id).length) {
          cyInstance.add(person);
          cyInstance.layout({ name: 'circle' }).run();
        }
      });
    }, Number(process.env.NEXT_PUBLIC_UPDATE_TIME ?? 5000));

    return () => clearInterval(interval);
  }, [cyInstance]);

  // relationsのポーリング
  useEffect(() => {
    if (!cyInstance) return;
    const interval = setInterval(async () => {
      const res = await fetch('/api/relations');
      const newRelations = await res.json();

      newRelations.forEach((relation: any) => {
        if (!cyInstance.getElementById(relation.data.id).length) {
          cyInstance.add(relation);
          cyInstance.layout({ name: 'circle' }).run();
        }
      });
    }, Number(process.env.NEXT_PUBLIC_UPDATE_TIME ?? 5000));

    return () => clearInterval(interval);
  }, [cyInstance]);

  useEffect(() => {
  if (!cyInstance) return;

  const updateStyles = async () => {
    const res = await fetch('/api/persons');
    const persons = await res.json();

    const groupRes = await fetch('/api/louvainClustering');
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

    const nodeStyles = groupColoringEnabled
      ? uniqueGroups.map((group, index) => ({
          selector: `node[group = ${group}]`,
          style: {
            'background-color': groupColors[index % groupColors.length],
          },
        }))
      : [
          {
            selector: 'node',
            style: {
              'background-color': '#888',
            },
          },
        ];

    cyInstance.style()
      .fromJson([
        {
          selector: 'node',
          style: {
            'label': 'data(name)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'shape': 'roundrectangle',
            'width': '75px',
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
      ])
      .update();
    };

    updateStyles();
  }, [groupColoringEnabled, cyInstance]);

  return {
    cyRef,
    cyInstance,
    selectedPerson,
    anchorPosition,
    groupColoringEnabled,
    setSelectedPerson,
    setAnchorPosition,
    setGroupColoringEnabled,
  };
};
