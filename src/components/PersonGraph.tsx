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
      const [personsRes, relationsRes] = await Promise.all([
        fetch('/api/persons'),
        fetch('/api/relations'),
      ]);

      const persons = await personsRes.json();
      const relations = await relationsRes.json();

      const elements = [...persons, ...relations];

      if (cyRef.current) {
        const cy = cytoscape({
          container: cyRef.current,
          elements,
          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#0070f3',
                'label': 'data(label)',
                'color': '#fff',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '12px',
                'shape': 'roundrectangle',
                'width': '75px'

              },
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
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
  }, 5000);

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
  }, 5000);

  return () => clearInterval(interval);
}, [cyInstance]);

  return (
    <div style={{ position: 'relative' }}>
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
            {selectedPerson?.label}
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
