import { Icon } from '@iconify/react';

function SocialMedia() {
  return (
    <ul className="home-about-social-links">
      <li className="social-icons">
        <a
          href="https://github.com/zviazran"
          target="_blank"
          rel="noreferrer"
          className="icon-colour home-social-icons"
        >
          <Icon icon="mdi:github" className="social-icon" />
        </a>
      </li>
      <li className="social-icons">
        <a
          href="https://www.linkedin.com/in/zvi-azran-131956121"
          target="_blank"
          rel="noreferrer"
          className="icon-colour home-social-icons"
        >
          <Icon icon="fa6-brands:linkedin-in" className="social-icon" />
        </a>
      </li>
      <li className="social-icons">
        <a
          href="mailto:zviazran@gmail.com"
          target="_blank"
          rel="noreferrer"
          className="icon-colour home-social-icons"
        >
          <Icon icon="mdi:email" className="social-icon" />
        </a>
      </li>
    </ul>
  );
}

export default SocialMedia;
