import PersonGraph from '@/components/PersonGraph';

export default function Page() {
  return (
    <main className="p-4 w-screen h-screen overflow-hidden">
      <h1 className="text-xl font-bold mb-4">人物相関図</h1>
      <PersonGraph />
    </main>
  );
}