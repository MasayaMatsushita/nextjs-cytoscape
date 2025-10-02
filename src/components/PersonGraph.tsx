'use client';

import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';

const PersonGraph = () => {
  const cyRef = useRef<HTMLDivElement>(null);
  const [cyInstance, setCyInstance] = useState<cytoscape.Core | null>(null);

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
          rows: 1,
        },
      });

      setCyInstance(cy);
    }
  };

  fetchDataAndRender();

  return () => {
    cyInstance?.destroy();
  };
}, []);

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

  return (
    <div>
      <div ref={cyRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
};

export default PersonGraph;