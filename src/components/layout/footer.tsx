export function Footer() {
  return (
    <footer className="w-full border-t border-darkPurple/30 bg-voidBlack/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center text-sm text-ashGray">
          <span>Made by</span>
          <a
            href="https://x.com/askpurin"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1.5 font-medium text-amethyst hover:text-lavenderGlow transition-colors duration-200"
          >
            @Askpurin
          </a>
        </div>
      </div>
    </footer>
  );
}
