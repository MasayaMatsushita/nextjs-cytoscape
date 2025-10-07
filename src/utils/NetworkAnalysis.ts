/* eslint-disable @typescript-eslint/no-explicit-any */

export async function calculateGraphDensity(baseUrl: string): Promise<number> {
  const [personsRes, relationsRes] = await Promise.all([
    fetch(`${baseUrl}/api/persons`),
    fetch(`${baseUrl}/api/relations`),
  ]);

  const persons = await personsRes.json();
  const relations = await relationsRes.json();

  const numNodes = persons.length;
  const numEdges = relations.length;

  if (numNodes <= 1) return 0;

  const maxPossibleEdges = (numNodes * (numNodes - 1)) / 2;
  const density = numEdges / maxPossibleEdges;

  return parseFloat(density.toFixed(4));
}

export async function calculateClusteringCoefficient(baseUrl: string): Promise<number> {
  const [personsRes, relationsRes] = await Promise.all([
    fetch(`${baseUrl}/api/persons`),
    fetch(`${baseUrl}/api/relations`),
  ]);

  const nodes = await personsRes.json();
  const edges = await relationsRes.json();

  const adjacency: Record<string, Set<string>> = {};
  nodes.forEach((node: any) => {
    adjacency[node.data.id] = new Set();
  });

  edges.forEach((edge: any) => {
    const { source, target } = edge.data;
    adjacency[source]?.add(target);
    adjacency[target]?.add(source); // 無向グラフとして扱う
  });

  const localCoefficients: number[] = [];

  for (const nodeId in adjacency) {
    const neighbors = Array.from(adjacency[nodeId]);
    const k = neighbors.length;

    if (k < 2) {
      localCoefficients.push(0);
      continue;
    }

    let links = 0;
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        if (adjacency[neighbors[i]]?.has(neighbors[j])) {
          links++;
        }
      }
    }

    const maxLinks = (k * (k - 1)) / 2;
    localCoefficients.push(links / maxLinks);
  }

  const average = localCoefficients.reduce((a, b) => a + b, 0) / localCoefficients.length;
  if (isNaN(average)) return 0;
  return parseFloat(average.toFixed(4));
}