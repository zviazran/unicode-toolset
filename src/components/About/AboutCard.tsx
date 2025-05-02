import React from "react";
import Card from "react-bootstrap/Card";
import { Icon } from "@iconify/react";

const activities: string[] = [
  "Playing board and retro games",
  "Movies and shows",
  "Solving Unicode bugs",
  "Learning Japanese",
];

const AboutCard: React.FC = () => {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi Everyone, I am <span className="purple">Zvi Azran</span> from{" "}
            <span className="purple">Jerusalem, Israel.</span>
            <br />
            Software Engineer who loves to transform ideas into reality using
            code.
            <br />
            Motivated developer with expertise in C#, C++, JavaScript, and more. Experienced in technical development for large-scale cybersecurity projects, optimizing Windows systems, and improving software performance. Skilled in security, system architecture, and cross-platform development.
            <br />
            <br />
            Other things I do for fun:    
          </p>
          <ul>
            {activities.map((activity, index) => (
              <li className="about-activity" key={index}>
                <Icon icon="mdi:chevron-right" /> {activity}
              </li>
            ))}
          </ul>
        </blockquote>
      </Card.Body>
    </Card>
  );
};

export default AboutCard;
