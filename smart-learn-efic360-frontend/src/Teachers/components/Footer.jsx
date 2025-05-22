


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="pull-left">
          <span className="text-bold text-uppercase">Smart Learn EFIC 360</span>
        </div>
        <div className="pull-right go-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <i className="ti-angle-up"></i>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
