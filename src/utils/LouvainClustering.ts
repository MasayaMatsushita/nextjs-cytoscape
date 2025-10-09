/* eslint-disable @typescript-eslint/no-explicit-any */

import { UndirectedGraph } from 'graphology';
import louvain from 'graphology-communities-louvain';

export async function performClustering(baseUrl: string) {
  const [personsRes, relationsRes] = await Promise.all([
    fetch(`${baseUrl}/api/persons`),
    fetch(`${baseUrl}/api/relations`)
  ]);

  const personsJson = await personsRes.json();
  const relationsJson = await relationsRes.json();

  const nodeIds: string[] = personsJson.map((p: any) => p.data.id);

  const graph = new UndirectedGraph();

  // ノード追加
  nodeIds.forEach(id => graph.addNode(id));

  // エッジ追加
  relationsJson.forEach((r: any) => {
    graph.addEdge(r.data.source, r.data.target);
  });

  // Louvainクラスタリング実行
  const communities = louvain(graph);

  return personsJson.map((person: any) => ({
    id: person.data.id,
    name: person.data.name,
    group: communities[person.data.id]+1,
  }));
}
