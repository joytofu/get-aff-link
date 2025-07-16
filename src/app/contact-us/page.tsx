'use client';

import { useState } from 'react';

export default function Page() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-4xl font-bold text-heading mb-4">Contact Us</h1>
      <p className="text-lg mb-8">
        Have a question or feedback? Fill out the form below to get in touch with us.
      </p>

      {submitted ? (
        <div className="text-center p-4 bg-green-900 text-white rounded-lg">
          <p className="font-bold">Thank you for your message!</p>
          <p>We'll get back to you as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-lg">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="w-full"
              placeholder="Your message..."
            ></textarea>
          </div>
          <div>
            <button type="submit">
              Send Message
            </button>
          </div>
        </form>
      )}
    </div>
  );
}