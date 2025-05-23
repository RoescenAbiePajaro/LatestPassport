import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function FAQ () {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch FAQs from backend
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        let url = '/api/faqs';
        
        if (searchQuery) {
          url = `/api/faqs/search?q=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }

        const data = await response.json();
        
        if (data.success) {
          setFaqData(data.data);
          setError(null);
        } else {
          throw new Error(data.message || 'Error fetching FAQs');
        }
      } catch (err) {
        setError(err.message);
        setFaqData([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a small debounce to search
    const timer = setTimeout(() => {
      fetchFaqs();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-semibold text-gray-700 dark:text-gray-200 text-center mb-6"
      >
        Frequently Asked Questions
      </motion.h2>

      {/* Search input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center min-h-[500px]">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* FAQ List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {!loading && !error && faqData.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No FAQs found
          </div>
        ) : (
          faqData.map((faq, index) => (
            <div
              key={faq._id || index}
              className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-4 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-base font-medium">{faq.question}</span>
                {openIndex === index ? (
                  <HiOutlineChevronUp className="h-5 w-5 text-teal-500" />
                ) : (
                  <HiOutlineChevronDown className="h-5 w-5 text-teal-500" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

