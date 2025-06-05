import React from "react";
import { Icon } from "@iconify/react";
import myImg from "../../Assets/zvi_azran_img.jpg";
import pdf from "../../Assets/zvi_azran_cv.pdf";
import SocialMedia from "../SocialMedia";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../../App.css";

const About: React.FC = () => {
  return (
    <div className="about-resume">
      <section>
        <Container fluid className="home-section" id="home">
          <Container className="home-content">
            <Row>
              <Col md={6} className="home-header">
                <h1 style={{ paddingBottom: 15 }} className="heading">
                  Hi There!{" "}
                  <span className="wave" role="img" aria-labelledby="wave">
                    👋🏻
                  </span>
                </h1>

                <h1 className="heading-name">
                  I'm
                  <strong className="main-name"> Zvi Azran</strong>
                </h1>

                <p className="heading-description blockquote">
                  I'm a software engineer with a decade of experience in C#, C++, JavaScript, and more. Experienced in developing for cybersecurity solutions, optimizing performance, and maintaining complex codebases. Also an unapologetic Unicode enthusiast.<br/>This project is both a showcase of my capabilities and a love letter to the overlooked details hidden in text.<br/>It's free and open source for all.
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
            <Col md={12} className="home-about-social">
              <h1>Get in Touch</h1>
              <p>
                If you're in search of a developer to enhance your team or collaborate on a project
                <br />
                <strong>Feel free to connect with me</strong>
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
