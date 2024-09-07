
const Footer = () => {
  return (
    <footer className="bg-slate-500 h-20 relative mt-4">
      <div className="p-2">
        <div className="border-t border-gray-200 pb-3" />
        <div className="h-full flex flex-col md:flex-row md:justify-between justify-center items-center px-4">
          <div className="text-center md:text-left pb-2 md:pb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} prakhar deep has, All rights
              reserved.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex space-x-4 md:space-x-8">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Cookie Policy
              </a>
              <a
                href="mailto:prakhardeep173@gmail.com"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="text-center md:text-right mt-2 md:mt-0">
            <p className="text-sm text-muted-foreground">
              Made with 👦 in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
