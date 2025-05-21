import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';


const faqData = [
  {
    question: 'What is the Category Manager?',
    answer: 'The Category Manager is a dashboard feature that lets you create, edit, search, and delete categories to organize your content efficiently.'
  },
  {
    question: 'Who can access the Category Manager?',
    answer: 'You need to be logged into the dashboard with a valid account. The interface uses your authentication token to ensure only authorized users can manage categories.'
  },
  {
    question: 'How do I create a new category?',
    answer: 'Click the "Create Category" button (with a plus icon) at the top-right. Fill in the required category name and optional description in the form, then click "Create Category" to save.'
  },
  {
    question: 'Can I edit an existing category?',
    answer: 'Yes, find the category in the list, click the pencil icon, update the name or description in the form, and click "Update Category" to save changes.'
  },
  {
    question: 'How do I delete a category?',
    answer: 'Locate the category in the list, click the trash icon, and confirm the deletion in the modal that appears. This action cannot be undone.'
  },
  {
    question: 'How do I search for a category?',
    answer: 'Use the search bar above the category list. Enter a keyword to filter categories by name or description. Clear the search to view all categories.'
  },
  {
    question: 'How does pagination work?',
    answer: 'The Category Manager shows up to 5 categories per page. Use the "Previous," "Next," or numbered page buttons to navigate. Pagination adjusts automatically when using the search feature.'
  },
  {
    question: 'Why do I see an error when creating or editing a category?',
    answer: 'Common reasons include missing a required category name, network issues, or authorization problems. Ensure the name field is filled, check your internet, and verify you’re logged in correctly.'
  },
  {
    question: 'Why is the page loading slowly?',
    answer: 'A loading spinner appears while fetching categories. Check your internet connection. If it persists, refresh the page or contact support.'
  },
  {
    question: 'What does "No categories found" mean?',
    answer: 'This appears if no categories exist in your account or if your search term doesn’t match any categories. Create a new category or clear the search term.'
  },
  {
    question: 'Is the interface mobile-friendly?',
    answer: 'Yes, the Category Manager is responsive. On mobile, pagination controls simplify to "Previous" and "Next" buttons for easier navigation.'
  },
  {
    question: 'What are success messages?',
    answer: 'After creating, editing, or deleting a category, a green success message (e.g., "Category created successfully!") appears and auto-dismisses after 5 seconds.'
  }
];

const FAQ = () => {
  // State to track which FAQ item is expanded
  const [openIndex, setOpenIndex] = useState(null);

  // Toggle FAQ item expansion
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3 mb-6"
      >
        Frequently Asked Questions
      </motion.h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {faqData.map((faq, index) => (
          <div
            key={index}
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
        ))}
      </div>
    </div>
  );
};

export default FAQ;