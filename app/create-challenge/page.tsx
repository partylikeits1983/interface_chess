import ChallengeForm from './form';

export default function Page() {
  return (
    <div className="flex justify-center">
      <div className="prose prose-sm prose-invert max-w-none space-y-9">
        <h1 className="text-xl font-bold">Create a Chess Challenge</h1>
        <ul>
          <li>Step 1) Fill out the required fields below</li>
          <li>Step 2) Sign the transaction with your wallet</li>
          <li>Step 2) Send the challenge address to your friend</li>
        </ul>

        <ChallengeForm />
      </div>
    </div>
  );
}
