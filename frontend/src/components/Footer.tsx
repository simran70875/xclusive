import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import images from "./imagesPath";



const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-800 text-white  w-full ">
      {/* Top subscription section */}
      {/* <div className="container-padding py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">

      <div className="md:w-1/2 text-sm md:text-base leading-relaxed">
        <p className="font-semibold mb-2">Stay Connected</p>
        <p className="text-gray-400 font-normal">
          Get weekly updates about our latest products, events, and special deals delivered straight to your inbox.
        </p>
      </div>


      <form className="md:w-1/2 flex flex-row gap-3 items-center justify-center w-full">
        <input
          type="email"
          placeholder="Enter your email"
          aria-label="Email address"
          className="subscribe-input"
        />
        <button type="submit" className="subscribe-button">
          Subscribe
        </button>
      </form>
    </div> */}

      {/* Light grey separator */}
      <div className="bg-gray-700 h-[1px] w-full" />

      {/* Bottom footer columns */}
      <div className="container-padding py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        {/* Column 1: Logo + text + social icons */}
        <div>
          <img
            src={images.logo_white}
            alt="Loading workwear gear..."
            className="w-50 h-auto mb-6"
          />
          {/* <h2 className="font-bold text-2xl mb-2">
            WorkSafety
            <span className="w-1 h-1 bg-primary inline-block" />
          </h2> */}
          <p className="mb-6 text-gray-300">
            Work Wear & Safety Solutions
          </p>
          <a href="#" aria-label="Facebook" className="footer-social-link">
            <Phone size={20} />  <p className="text-gray-300">
              +44 1799611006
            </p>
          </a>

          {/* <div className="flex flex-col space-y-2">
            <a href="#" aria-label="Facebook" className="footer-social-link">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="footer-social-link">
              <Twitter size={20} />
            </a>
            <a href="#" aria-label="Instagram" className="footer-social-link">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="LinkedIn" className="footer-social-link">
              <Linkedin size={20} />
            </a>
          </div> */}
        </div>

        {/* Column 2: Company Links */}
        <div>
          <h3 className="footer-heading">Company</h3>
          <ul className="space-y-2">
            {[{ name: "What We Do", path: "/about" }, { name: "Terms & Conditions", path: "/terms" },].map((text) => (
              <li key={text.name}>
                <div
                  onClick={() => navigate(text.path)}
                  className="nav-link mb-3 text-gray-500 cursor-pointer hover-item"
                >
                  {text.name}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: My Account Links */}
        <div>
          <h3 className="footer-heading">My Account</h3>
          <ul className="space-y-2">
            {[{ name: "Sign In", path: "/login" }, { name: "View Cart", path: "/cart" }, { name: "Help & Support", path: "/about" }].map((text) => (
              <li key={text.name}>
                <div

                  onClick={() => navigate(text.path)}
                  className="nav-link mb-3 text-gray-500 cursor-pointer hover-item"
                >
                  {text.name}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Customer Service Links */}
        <div>
          <h3 className="footer-heading">Customer Service</h3>
          <ul className="space-y-2">
            {[{ name: "Help & Contact Us", path: "/contact" }, { name: "Terms & Conditions", path: "/terms" }].map((text) => (
              <li key={text.name}>
                <div

                  onClick={() => navigate(text.path)}
                  className="nav-link mb-3 text-gray-500 cursor-pointer hover-item"
                >
                  {text.name}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-gray-700 text-gray-400 text-center py-4 text-xs">
        © 2020-2025 powered by WorkSafety
      </div>
    </footer>
  )
};

export default Footer;
