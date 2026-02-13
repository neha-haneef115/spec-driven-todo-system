export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Taskly. Built with care for productivity.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-500">
            <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">
              Privacy
            </span>
            <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">
              Terms
            </span>
            <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">
              Support
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
