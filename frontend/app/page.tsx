'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Loan Management System</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Apply for quick loans or access the operations dashboard to process applications.
      </p>
      
      <div className="flex space-x-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow hover:bg-gray-900 transition"
        >
          Sign Up as Borrower
        </Link>
      </div>

      <div className="mt-12 p-4 bg-white border rounded-lg max-w-sm text-left text-xs text-gray-500 shadow-sm">
        <p className="font-bold mb-1 text-gray-700">Seeded Role Test Credentials (Password: Password123!):</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>borrower@lms.com (Borrower)</li>
          <li>sales@lms.com (Sales Exec)</li>
          <li>sanction@lms.com (Sanction Officer)</li>
          <li>disbursement@lms.com (Disbursement Exec)</li>
          <li>collection@lms.com (Collection Exec)</li>
          <li>admin@lms.com (Admin)</li>
        </ul>
      </div>
    </div>
  );
}