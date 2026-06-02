import { Link, useSearchParams } from 'react-router';

export const CheckEmail = () => {
  const [params] = useSearchParams();
  const email = params.get('email');

  return (
    <div className="min-h-screen bg-zinc-50 grid place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-zinc-600">
          We sent a confirmation link{email ? ` to ${email}` : ''}. Open it to finish creating
          your account.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
