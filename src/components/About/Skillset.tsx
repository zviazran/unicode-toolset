import React from "react";
import { Row, Col } from "react-bootstrap";
import Techstack from "./Techstack";

interface SkillsetProps {
  title: string;
  skills: { name: string; initialRating: number }[];
  tools: string[];
}

const Skillset: React.FC<SkillsetProps> = ({ title, skills, tools }) => {
  return (
    <Row className="skill-tools-wrapper">
      <Col xs={2} className="skill-wrapper">
        <h4 className="skill-heading">{title}</h4>
      </Col>
      
      <Col xs={6} className="skill-wrapper">
        {skills.map((skill, index) => (
          <Techstack name={skill.name} initialRating={skill.initialRating} key={index} />
        ))}
      </Col>
      <Col xs={4} className="skill-wrapper">
        {tools.map((tool, index) => (
          <ul key={index} className="tool-name">
            <li>{tool}</li>
          </ul>
        ))}
      </Col>
    </Row>
  );
};

export default Skillset;
