import React from "react";
import { Icon } from "@iconify/react";
import myImg from "../../Assets/zvi_azran_img.jpg";
import pdf from "../../Assets/zvi_azran_cv.pdf";
import SocialMedia from "../../components/SocialMedia";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../../App.css";

const About: React.FC = () => {
  return (
    <div className="about-resume">
      <section>
        <Container fluid className="about-section">
          <Container className="about-content">
            <Row>
              <Col md={6} className="about-header">
                <h1 className="heading">
                  Hello There!{" "}
                  <span className="wave" role="img" aria-labelledby="wave">
                    👋🏻
                  </span>
                </h1>

                <h2 className="heading-name">
                  I'm
                  <strong className="main-name"> Zvi Azran</strong>
                </h2>

                <p className="heading-description blockquote">
                  I'm a teacher and a former software engineer with a decade of experience in JavaScript, C#, C++ and more. Experienced in developing for cybersecurity solutions, optimizing performance, and maintaining complex codebases. Also an unapologetic Unicode enthusiast.<br/><br/>This project is both a showcase of my capabilities, thoroughness and dedication and a love letter to the plain old text that everyone unfairly takes for granted.<br/><br/>My goal is to make this project worthy of your browser favorites 🤗 It's free and publicly available for all. 
                </p>
              </Col>

              <Col md={5}>
                <img src={myImg} className="profile-pic" alt="avatar" />
              </Col>
            </Row>
          </Container>
        </Container>

        <Container>
          <Row>
            <Col md={12} className="about-social">
              <h1>Get in Touch</h1>
              <p style={{ fontSize: 20 }} >
                If you need someone with deep Unicode knowledge to lecture and enhance your team
                <br />
                <strong>Feel free to connect</strong>
              </p>
              <SocialMedia />
            </Col>
          </Row>

          <Button
            variant="primary"
            href={pdf}
            target="_blank"
            className="download-button"
          >
            <Icon icon="mdi:download" style={{ marginBottom: "2px" }} />
            &nbsp;Download CV
          </Button>
          
        </Container>
      </section>
    </div>
  );
};

export default About;
