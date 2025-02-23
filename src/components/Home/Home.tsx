import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import myImg from "../../Assets/zvi_azran_img.jpg";
import SocialMedia from "../SocialMedia";

const Home: React.FC = () => {
  return (
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
               I'm a software engineer with a decade of experience in C#, C++, JavaScript, and more. Experienced in developing for cybersecurity solutions, optimizing performance, and maintaining complex codebases. Also an unapologetic Unicode enthusiast. 
              </p>
            </Col>

            <Col md={5}>
              <img src={myImg} className="profile-pic" alt="avatar" />
            </Col>
          </Row>
        </Container>
      </Container>
      
      <Container fluid className="home-about-section" id="about">
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
        </Container>
      </Container>
    </section>
  );
};

export default Home;
