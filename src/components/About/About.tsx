import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Skillset from "./Skillset";
import Aboutcard from "./AboutCard";
import developer from "../../Assets/about.jpg";
import {  JS_SKILLS, JS_TOOLS, CSHARP_SKILLS, CSHARP_TOOLS, CPP_SKILLS, CPP_TOOLS } from "../../Constants";

const About: React.FC = () => {
  return (
    <Container fluid className="about-section">
      <Container>
        <Row style={{ justifyContent: "center", padding: "10px" }}>
          <Col
            md={7}
            style={{
              justifyContent: "center",
              paddingTop: "30px",
              paddingBottom: "50px",
            }}
          >
            <h1 style={{ fontSize: "2.1em", paddingBottom: "20px" }}>
              <strong className="purple">About Me</strong>
            </h1>
            <Aboutcard />
          </Col>
          <Col md={5} style={{ paddingBottom: "50px" }} className="about-img">
            <img src={developer} alt="about" className="image-style" />
          </Col>
        </Row>
        <Row className="skill-tools-wrapper">
          <Col xs={2} className="skill-wrapper">
            <h3>
              Langs
            </h3>
          </Col>
          <Col xs={6} className="skill-wrapper">
            <h3>
              Skillset
            </h3>
          </Col>
          <Col xs={4} className="skill-wrapper">
            <h3>
              Tools I use
            </h3>
          </Col>
        </Row>
        <Skillset title="JS" skills={JS_SKILLS} tools={JS_TOOLS} />
        <Skillset title="C#" skills={CSHARP_SKILLS} tools={CSHARP_TOOLS} />
        <Skillset title="C++" skills={CPP_SKILLS} tools={CPP_TOOLS} />
      </Container>
    </Container>
  );
};

export default About;
