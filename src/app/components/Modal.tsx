'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in-fast">
      <div className="bg-dark-light rounded-xl shadow-2xl w-full max-w-md m-4 border border-gray-700">
        <div className="p-5 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 text-gray-300">
          {children}
        </div>
        <div className="px-6 py-4 bg-dark rounded-b-xl border-t border-gray-700 text-right">
          <button 
            onClick={onClose} 
            className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;