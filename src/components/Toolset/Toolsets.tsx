import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ToolsetCards";
import { TOOLSETS } from "../../Constants";

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
          My Unicode Toolset
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
    </Container>
  );
};

export default Toolsets;
