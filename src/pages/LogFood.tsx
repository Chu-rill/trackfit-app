import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '@headlessui/react';
import ManualEntry from '../components/ManualEntry';
import ImageUpload from '../components/ImageUpload';
import CameraCapture from '../components/CameraCapture';
import QRScanner from '../components/QRScanner';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function LogFood() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const categories = [
    {
      name: 'Manual Entry',
      component: ManualEntry,
      icon: '✏️',
    },
    {
      name: 'Upload Image',
      component: ImageUpload,
      icon: '📁',
    },
    {
      name: 'Take Photo',
      component: CameraCapture,
      icon: '📷',
    },
    {
      name: 'Scan QR Code',
      component: QRScanner,
      icon: '📱',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log Food</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your meals using any of the methods below
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 px-4">
            {categories.map((category) => (
              <Tab
                key={category.name}
                className={({ selected }) =>
                  classNames(
                    'py-4 px-6 text-sm font-medium leading-5 transition-colors',
                    'focus:outline-none',
                    selected
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )
                }
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="p-6">
            {categories.map((category, idx) => (
              <Tab.Panel key={idx}>
                <category.component />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
