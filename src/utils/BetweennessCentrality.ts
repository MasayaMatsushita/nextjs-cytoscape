/* eslint-disable @typescript-eslint/no-explicit-any */

import cytoscape from 'cytoscape';

export async function calculateBetweennessCentrality(baseUrl: string) {
  const [personsRes, relationsRes] = await Promise.all([
    fetch(`${baseUrl}/api/persons`),
    fetch(`${baseUrl}/api/relations`)
  ]);

  const personsJson = await personsRes.json();
  const relationsJson = await relationsRes.json();

  const persons = personsJson.map((p: any) => p.data);
  const relations = relationsJson.map((r: any) => r.data);

  const cy = cytoscape({
    elements: [
      ...persons.map((p: any) => ({
        data: { id: p.id, name: p.name }
      })),
      ...relations.map((r: any) => ({
        data: {
          id: `${r.source}-${r.target}`,
          source: r.source,
          target: r.target,
          label: r.department
        }
      }))
    ]
  });

  // 各ノードに対して個別に次数中心性を計算
  const centralityData = cy.nodes().map((node) => {
    const result = cy.elements().betweennessCentrality({
      directed: false
    });

    return {
      id: node.id(),
      name: node.data('name'),
      betweennessCentrality: typeof result.betweennessNormalized(node) === 'number'
        ? result.betweennessNormalized(node)
        : 0
    };
  });

  return centralityData;
}