'use client';
const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-red-500">Error</h1>
      <p className="text-lg text-gray-600">Something went wrong.</p>
    </div>
  );
};
export default ErrorPage;