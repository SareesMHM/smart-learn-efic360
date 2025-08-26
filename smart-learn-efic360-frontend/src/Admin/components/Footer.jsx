const Footer = () => {
  const year = new Date().getFullYear();

  const handleGoTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-left">
          <span className="brand">
            <strong>Smart Learn EFIC 360</strong>
          </span>
          <span className="sep" aria-hidden="true">•</span>
          <span className="copy">© {year}</span>
        </div>

        <button
          type="button"
          className="go-top"
          onClick={handleGoTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <i className="ti-angle-up" aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
