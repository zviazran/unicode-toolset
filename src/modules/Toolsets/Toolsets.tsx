import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ToolsetCards";
import { TOOLSETS, RECOMMENDATIONS } from "../../constants/Constants";

interface Project {
  name: string;
  image: string;
  joke: string;
  description: string;
  link: string; // an internal route like "/toolsets/1"
}

const Toolsets: React.FC = () => {
  return (
    <Container fluid className="toolset-section">
      <Container>
        <h1 className="toolset-heading">
          Uոі𐐽൦ꓒ𝖾 ‮ytiruceS‬ Т︃օ︃օ︃l︃ꮪ︃e︃t
        </h1>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          {TOOLSETS.map((project: Project, index: number) => (
            <Col md={4} className="toolset-card" key={index}>
              <ProjectCard
                imgPath={project.image}
                title={project.name}
                joke={project.joke}
                description={project.description}
                link={project.link}
              />
            </Col>
          ))}
        </Row>
      </Container>
      <Container>
        <h2 className="toolset-heading">
          Other Recommendations
        </h2>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          {RECOMMENDATIONS.map((project: Project, index: number) => (
            <Col md={4} className="toolset-card" key={index}>
              <ProjectCard
                imgPath={project.image}
                title={project.name}
                joke={project.joke}
                description={project.description}
                link={project.link}
              />
            </Col>
          ))}
        </Row>
      </Container>      
    </Container>
  );
};

export default Toolsets;
