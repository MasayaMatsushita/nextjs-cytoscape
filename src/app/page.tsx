import PersonGraph from '@/components/PersonGraph';
import CytoscapeCentrality from '@/components/CytoscapeCentrality';

export default function Page() {
  return (
    <main className="p-4 w-screen h-screen overflow-auto">
      <h1 className="text-xl font-bold mb-4">人物相関図</h1>
      <PersonGraph />

      <div className="max-w-[50%] mx-auto overflow-x-auto">
        <CytoscapeCentrality />
      </div>
    </main>
  );
}