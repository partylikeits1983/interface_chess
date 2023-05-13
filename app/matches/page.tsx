import CardList from './CardList';

export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Matches</h1>

      <CardList />
    </div>
  );
}
